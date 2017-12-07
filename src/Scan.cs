#r "System.Xml.dll"
#r "System.Reflection.dll"
using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using System.Xml;


public class Argument
{
    public string Name { get; set; }
    public string Type { get; set; }
}

public class ArgumentComment
{
    public string Name { get; set; }
    public string Comment { get; set; }
}

public class Comment
{
    public Comment()
    {

    }

    public Comment(XmlDocument doc, string xpath)
    {
        var summary = doc.SelectSingleNode(xpath + "/summary");
        if(summary != null)
            this.Summary = summary.InnerText.Trim();
        var returns = doc.SelectSingleNode(xpath + "/returns");
        if (returns != null)
            this.Returns = returns.InnerText.Trim();
        var arguments = doc.SelectNodes(xpath + "/param");
        if(arguments != null)
        {
            this.Arguments = new Dictionary<string, string>();
            foreach(var arg in arguments.OfType<XmlNode>())
                this.Arguments[arg.Attributes["name"].Value] = arg.InnerText.Trim();
        }
    }

    public string Summary { get; set; }
    public string Returns { get; set; }
    public Dictionary<string, string> Arguments { get; set; }
}

public class Method
{
    public string Name { get; set; }
    public Argument[] Arguments { get; set; }
    public string Returns { get; set; }
    public Comment Comment { get; set; }

}

public class Hub
{
    public string Name { get; set; }
    public Comment Comment { get; set; }
    public Method[] Server { get; set; }
    public Method[] Client { get; set; }
}

public class Startup
{
    static bool IsDerivedOfGenericType(Type type, Type genericType)
    {
        if (type.IsGenericType && type.GetGenericTypeDefinition() == genericType)
            return true;
        return type.BaseType != null && IsDerivedOfGenericType(type.BaseType, genericType);
    }
    static Type GetDerivedGenericTypeParameter(Type type, Type genericType)
    {
        if (type.IsGenericType && type.GetGenericTypeDefinition() == genericType)
            return type.GenericTypeArguments.First();
        return type.BaseType != null
            ? GetDerivedGenericTypeParameter(type.BaseType, genericType)
            : null;
    }

    private static readonly Type[] _numberTypes = new[] { typeof(byte), typeof(short), typeof(int), typeof(long), typeof(float), typeof(decimal), typeof(double) };
    private static readonly Type[] _dateTypes = new[] { typeof(DateTime), typeof(DateTimeOffset) };

    private static string MapToJavaScriptType(Type type)
    {
      if (typeof(System.Collections.IEnumerable).IsAssignableFrom(type))
      {
        return "Array";
      }
      if (!type.IsPrimitive && !(type == typeof(string)))
      {
        return "Object";
      }
      if (type == typeof(string))
      {
        return "String";
      }
      if (_numberTypes.Contains(type))
      {
        return "Number";
      }
      if (_dateTypes.Contains(type))
      {
        return "Date";
      }
        return type.Name;
    }

    static string GetReturnType(MethodInfo y)
    {
      if (y.ReturnParameter != null && y.ReturnParameter.ParameterType != typeof(Task) && y.ReturnParameter.ParameterType != typeof(void))
      {
          if (IsDerivedOfGenericType(y.ReturnParameter.ParameterType, typeof(Task<>)))
              return MapToJavaScriptType(y.ReturnParameter.ParameterType.GenericTypeArguments.First());
          return MapToJavaScriptType(y.ReturnParameter.ParameterType);
      }
      return null;
    }

    public async Task<object> Invoke(object input)
    {
        var extension = "." + input.ToString().Split(new[] { '.' }).Last();
        if (string.IsNullOrEmpty(extension))
            extension = ".dll";
        AppDomain.CurrentDomain.ReflectionOnlyAssemblyResolve += (sender, args) =>
        {
            try
            {
                return Assembly.ReflectionOnlyLoad(args.Name);
            }
            catch
            {
                try
                {
                    var path = Path.Combine(Path.GetDirectoryName(input.ToString()) ?? "", args.Name.Split(new[] { ',' })[0] + extension);
                    return Assembly.ReflectionOnlyLoadFrom(path);
                }
                catch
                {
                    return null;
                }
            }
        };

        var assemblyPath = input.ToString();
        var ass = Assembly.ReflectionOnlyLoadFrom(assemblyPath);
        var docPath = assemblyPath.Substring(0, assemblyPath.LastIndexOf(".", StringComparison.Ordinal)) + ".XML";
        var xml = new XmlDocument();
        if (File.Exists(docPath))
            xml.Load(docPath);
        var hubType = Type.ReflectionOnlyGetType("Microsoft.AspNet.SignalR.Hub, Microsoft.AspNet.SignalR.Core", true, true);
        var hubGenericType = Type.ReflectionOnlyGetType("Microsoft.AspNet.SignalR.Hub`1, Microsoft.AspNet.SignalR.Core", true, true);
        return ass.DefinedTypes.Where(x => !x.IsAbstract && IsDerivedOfGenericType(x, hubGenericType)).Select(x => new Hub
        {
            Name = x.Name,
            Comment = new Comment(xml, "//member[@name='T:" + x.FullName + "']"),
            Server = x.GetMethods().Where(y => y.IsPublic && !y.IsStatic && y.DeclaringType != hubType && y.DeclaringType != typeof(object) && y.Name != "OnConnected" && !(y.DeclaringType.IsGenericType && y.DeclaringType.GetGenericTypeDefinition() == hubGenericType))
            .Select(y => new Method
            {
                Name = y.Name,
                Comment = new Comment(xml, "//member[starts-with(@name, 'M:" + x.FullName + "." + y.Name + "')]"),
                Arguments = y.GetParameters().Where(z => z.ParameterType != typeof(CancellationToken)).Select(z => new Argument() { Name = z.Name, Type = MapToJavaScriptType(z.ParameterType) }).ToArray(),
                Returns = GetReturnType(y)
            }).ToArray(),
            Client = GetDerivedGenericTypeParameter(x, hubGenericType).GetTypeInfo().DeclaredMethods.Where(y => y.IsPublic && !y.IsStatic && y.GetBaseDefinition() == y)
            .Select(y => new Method
            {
                Name = y.Name,
                Arguments = y.GetParameters().Select(z => new Argument() { Name = z.Name, Type = MapToJavaScriptType(z.ParameterType) }).ToArray(),
                Comment = new Comment(xml, "//member[starts-with(@name, 'M:" + y.DeclaringType.FullName + "." + y.Name + "')]"),
                Returns = GetReturnType(y)
            }).ToArray()
        }).ToArray();
    }
}
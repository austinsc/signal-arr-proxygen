import edge from 'edge';

export const reflect = edge.func(function() {/*
#r "System.Xml.dll"
#r "System.Reflection.dll"
using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using System.Xml;


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
            this.Arguments = arguments.OfType<XmlNode>().Select(q => new ArgumentComment() { Comment = q.InnerText.Trim(), Name = q.Attributes["name"].Value }).ToArray();
    }

    public string Summary { get; set; }
    public string Returns { get; set; }
    public ArgumentComment[] Arguments { get; set; }
}

public class Method
{
    public string Name { get; set; }
    public string[] Arguments { get; set; }
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
        var hubGenericType = Type.ReflectionOnlyGetType("Microsoft.AspNet.SignalR.Hub`1, Microsoft.AspNet.SignalR.Core", false, true);
        return ass.DefinedTypes.Where(x => IsDerivedOfGenericType(x, hubGenericType)).Select(x => new Hub
        {
            Name = x.Name,
            Comment = new Comment(xml, "//member[@name='T:" + x.FullName + "']"),
            Server = x.DeclaredMethods.Where(y => y.IsPublic && !y.IsStatic && y.GetBaseDefinition() == y).Select(y => new Method
            {
                Name = y.Name,
                Comment = new Comment(xml, "//member[starts-with(@name, 'M:" + x.FullName + "." + y.Name + "')]"),
                Arguments = y.GetParameters().Select(z => z.Name).ToArray(),
                Returns = GetReturnType(y)
            }).ToArray(),
            Client = x.BaseType.GenericTypeArguments.First().GetTypeInfo().DeclaredMethods.Where(y => y.IsPublic && !y.IsStatic && y.GetBaseDefinition() == y).Select(y => new Method
            {
                Name = y.Name,
                Arguments = y.GetParameters().Select(z => z.Name).ToArray(),
                Comment = new Comment(xml, "//member[starts-with(@name, 'M:" + y.DeclaringType.FullName + "." + y.Name + "')]"),
                Returns = GetReturnType(y)
            }).ToArray()
        }).ToArray();
    }
}
*/
});

export function scan(assembly) {
  return new Promise((resolve, reject) => {
    reflect(assembly, (error, result) => {
      if(error) {
        return reject(error);
      }
      resolve(result);
    });
  });
}
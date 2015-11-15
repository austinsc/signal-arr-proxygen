import edge from 'edge';

export const reflect = edge.func(function() {/*
#r "System.Reflection.dll"
using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

public class Method
{
    public string Name { get; set; }
    public string[] Arguments { get; set; }
}

public class Hub
{
    public string Name { get; set; }
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

    public async Task<object> Invoke(object input)
    {
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
                    var path = Path.Combine(Path.GetDirectoryName(input.ToString()) ?? "", args.Name.Split(new [] {','})[0] + ".dll");
                    return Assembly.ReflectionOnlyLoadFrom(path);
                }
                catch
                {
                    return null;
                }
            }
        };

        var ass = Assembly.ReflectionOnlyLoadFrom(input.ToString());
        var hubType = Type.ReflectionOnlyGetType("Microsoft.AspNet.SignalR.Hub, Microsoft.AspNet.SignalR.Core", true, true);
        var hubGenericType = Type.ReflectionOnlyGetType("Microsoft.AspNet.SignalR.Hub`1, Microsoft.AspNet.SignalR.Core", false, true);
        return ass.DefinedTypes.Where(x => IsDerivedOfGenericType(x, hubGenericType)).Select(x => new Hub
        {
            Name = x.Name,
            Server = x.DeclaredMethods.Where(y => y.IsPublic && !y.IsStatic).Select(y => new Method
            {
                Name = y.Name,
                Arguments = y.GetParameters().Select(z => z.Name).ToArray()
            }).ToArray(),
            Client = x.BaseType.GenericTypeArguments.First().GetTypeInfo().DeclaredMethods.Where(y => y.IsPublic && !y.IsStatic).Select(y => new Method
            {
                Name = y.Name,
                Arguments = y.GetParameters().Select(z => z.Name).ToArray()
            }).ToArray()
        }).ToArray();
    }
}
*/
});

export const scan = (args) => new Promise((resolve, reject) => {
  reflect(args, (error, result) => {
    if(error){
      return reject(error);
    }
    resolve(result);
  });
});
'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _edge = require('edge');

var _edge2 = _interopRequireDefault(_edge);

var reflect = _edge2['default'].func(function () {/*
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
                                                  var ass = Assembly.ReflectionOnlyLoadFrom(input.ToString());
                                                  var hubType = Type.ReflectionOnlyGetType("Microsoft.AspNet.SignalR.Hub, Microsoft.AspNet.SignalR.Core", true, true);
                                                  var hubGenericType = Type.ReflectionOnlyGetType("Microsoft.AspNet.SignalR.Hub`1, Microsoft.AspNet.SignalR.Core", false, true);
                                                  return ass.DefinedTypes.Where(x => IsDerivedOfGenericType(x, hubGenericType)).Select(x => new Hub
                                                  {
                                                  Name = x.Name,
                                                  Server = x.DeclaredMethods.Where(y => y.IsPublic && !y.IsStatic && y.GetBaseDefinition() == y).Select(y => new Method
                                                  {
                                                  Name = y.Name,
                                                  Arguments = y.GetParameters().Select(z => z.Name).ToArray()
                                                  }).ToArray(),
                                                  Client = x.BaseType.GenericTypeArguments.First().GetTypeInfo().DeclaredMethods.Where(y => y.IsPublic && !y.IsStatic && y.GetBaseDefinition() == y).Select(y => new Method
                                                  {
                                                  Name = y.Name,
                                                  Arguments = y.GetParameters().Select(z => z.Name).ToArray()
                                                  }).ToArray()
                                                  }).ToArray();
                                                  }
                                                  }
                                                  */
});

exports.reflect = reflect;
var scan = function scan(args) {
    return new Promise(function (resolve, reject) {
        reflect(args, function (error, result) {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });
};
exports.scan = scan;
//# sourceMappingURL=HubScanner.js.map
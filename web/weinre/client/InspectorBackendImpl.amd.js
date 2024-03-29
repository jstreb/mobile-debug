;modjewel.define("weinre/client/InspectorBackendImpl", function(require, exports, module) { var Ex, IDLTools, InspectorBackendImpl, MessageDispatcher, Weinre;

Ex = require('../common/Ex');

IDLTools = require('../common/IDLTools');

MessageDispatcher = require('../common/MessageDispatcher');

Weinre = require('../common/Weinre');

module.exports = InspectorBackendImpl = (function() {

  function InspectorBackendImpl() {
    this.registeredDomainDispatchers = {};
    MessageDispatcher.setInspectorBackend(this);
  }

  InspectorBackendImpl.setupProxies = function() {
    var intf, intfName, intfNames, method, proxy, proxyMethod, _i, _len, _results;
    intfNames = ["ApplicationCache", "BrowserDebugger", "CSS", "Console", "DOM", "DOMStorage", "Database", "Debugger", "InjectedScript", "Inspector", "Network", "Profiler", "Runtime"];
    _results = [];
    for (_i = 0, _len = intfNames.length; _i < _len; _i++) {
      intfName = intfNames[_i];
      proxy = Weinre.messageDispatcher.createProxy(intfName);
      if (window[intfName]) {
        throw new Ex(arguments, "backend interface '" + intfName + "' already created");
      }
      intf = IDLTools.getIDL(intfName);
      if (!intf) {
        throw new Ex(arguments, "interface not registered: '" + intfName + "'");
      }
      window[intfName] = {};
      _results.push((function() {
        var _j, _len2, _ref, _results2;
        _ref = intf.methods;
        _results2 = [];
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          method = _ref[_j];
          proxyMethod = InspectorBackendImpl.getProxyMethod(proxy, method);
          InspectorBackendImpl.prototype[method.name] = proxyMethod;
          _results2.push(window[intfName][method.name] = proxyMethod);
        }
        return _results2;
      })());
    }
    return _results;
  };

  InspectorBackendImpl.getProxyMethod = function(proxy, method) {
    return function() {
      return proxy[method.name].apply(proxy, arguments);
    };
  };

  InspectorBackendImpl.prototype.registerDomainDispatcher = function(name, intf) {
    return this.registeredDomainDispatchers[name] = intf;
  };

  InspectorBackendImpl.prototype.getRegisteredDomainDispatcher = function(name) {
    if (!this.registeredDomainDispatchers.hasOwnProperty(name)) return null;
    return this.registeredDomainDispatchers[name];
  };

  return InspectorBackendImpl;

})();

require("../common/MethodNamer").setNamesForClass(module.exports);

});

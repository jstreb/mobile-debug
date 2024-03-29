;modjewel.define("weinre/common/MessageDispatcher", function(require, exports, module) { var Binding, Callback, Ex, IDLTools, InspectorBackend, MessageDispatcher, Verbose, WebSocketXhr, Weinre,
  __indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Weinre = require('./Weinre');

WebSocketXhr = require('./WebSocketXhr');

IDLTools = require('./IDLTools');

Binding = require('./Binding');

Ex = require('./Ex');

Callback = require('./Callback');

Verbose = false;

InspectorBackend = null;

module.exports = MessageDispatcher = (function() {

  function MessageDispatcher(url, id) {
    if (!id) id = "anonymous";
    this._url = url;
    this._id = id;
    this.error = null;
    this._opening = false;
    this._opened = false;
    this._closed = false;
    this._interfaces = {};
    this._open();
  }

  MessageDispatcher.setInspectorBackend = function(inspectorBackend) {
    return InspectorBackend = inspectorBackend;
  };

  MessageDispatcher.verbose = function(value) {
    if (arguments.length >= 1) Verbose = !!value;
    return Verbose;
  };

  MessageDispatcher.prototype._open = function() {
    if (this._opened || this._opening) return;
    if (this._closed) throw new Ex(arguments, "socket has already been closed");
    this._opening = true;
    this._socket = new WebSocketXhr(this._url, this._id);
    this._socket.addEventListener("open", Binding(this, "_handleOpen"));
    this._socket.addEventListener("error", Binding(this, "_handleError"));
    this._socket.addEventListener("message", Binding(this, "_handleMessage"));
    return this._socket.addEventListener("close", Binding(this, "_handleClose"));
  };

  MessageDispatcher.prototype.close = function() {
    if (this._closed) return;
    this._opened = false;
    this._closed = true;
    return this._socket.close();
  };

  MessageDispatcher.prototype.send = function(data) {
    return this._socket.send(data);
  };

  MessageDispatcher.prototype.getWebSocket = function() {
    return this._socket;
  };

  MessageDispatcher.prototype.registerInterface = function(intfName, intf, validate) {
    if (validate) IDLTools.validateAgainstIDL(intf.constructor, intfName);
    if (this._interfaces[intfName]) {
      throw new Ex(arguments, "interface " + intfName + " has already been registered");
    }
    return this._interfaces[intfName] = intf;
  };

  MessageDispatcher.prototype.createProxy = function(intfName) {
    var proxy, self, __invoke;
    proxy = {};
    IDLTools.buildProxyForIDL(proxy, intfName);
    self = this;
    proxy.__invoke = __invoke = function(intfName, methodName, args) {
      return self._sendMethodInvocation(intfName, methodName, args);
    };
    return proxy;
  };

  MessageDispatcher.prototype._sendMethodInvocation = function(intfName, methodName, args) {
    var data;
    if (typeof intfName !== "string") {
      throw new Ex(arguments, "expecting intf parameter to be a string");
    }
    if (typeof methodName !== "string") {
      throw new Ex(arguments, "expecting method parameter to be a string");
    }
    data = {
      interface: intfName,
      method: methodName,
      args: args
    };
    data = JSON.stringify(data);
    this._socket.send(data);
    if (Verbose) {
      return Weinre.logDebug(this.constructor.name + ("[" + this._url + "]: send " + intfName + "." + methodName + "(" + (JSON.stringify(args)) + ")"));
    }
  };

  MessageDispatcher.prototype.getState = function() {
    if (this._opening) return "opening";
    if (this._opened) return "opened";
    if (this._closed) return "closed";
    return "unknown";
  };

  MessageDispatcher.prototype.isOpen = function() {
    return this._opened === true;
  };

  MessageDispatcher.prototype._handleOpen = function(event) {
    this._opening = false;
    this._opened = true;
    this.channel = event.channel;
    Callback.setConnectorChannel(this.channel);
    if (Verbose) {
      return Weinre.logDebug(this.constructor.name + ("[" + this._url + "]: opened"));
    }
  };

  MessageDispatcher.prototype._handleError = function(message) {
    this.error = message;
    this.close();
    if (Verbose) {
      return Weinre.logDebug(this.constructor.name + ("[" + this._url + "]: error: ") + message);
    }
  };

  MessageDispatcher.prototype._handleMessage = function(message) {
    var args, data, intf, intfName, method, methodName, methodSignature, skipErrorForMethods;
    skipErrorForMethods = ['domContentEventFired', 'loadEventFired', 'childNodeRemoved'];
    try {
      data = JSON.parse(message.data);
    } catch (e) {
      throw new Ex(arguments, "invalid JSON data received: " + e + ": '" + message.data + "'");
    }
    intfName = data["interface"];
    methodName = data.method;
    args = data.args;
    methodSignature = intfName + ("." + methodName + "()");
    intf = this._interfaces.hasOwnProperty(intfName) && this._interfaces[intfName];
    if (!intf && InspectorBackend && intfName.match(/.*Notify/)) {
      intf = InspectorBackend.getRegisteredDomainDispatcher(intfName.substr(0, intfName.length - 6));
    }
    if (!intf) {
      Weinre.notImplemented("weinre: request for non-registered interface: " + methodSignature);
      return;
    }
    methodSignature = intf.constructor.name + ("." + methodName + "()");
    method = intf[methodName];
    if (typeof method !== "function") {
      Weinre.notImplemented(methodSignature);
      return;
    }
    try {
      method.apply(intf, args);
    } catch (e) {
      if (__indexOf.call(skipErrorForMethods, methodName) < 0) {
        Weinre.logError(("weinre: invocation exception on " + methodSignature + ": ") + e);
      }
    }
    if (Verbose) {
      return Weinre.logDebug(this.constructor.name + ("[" + this._url + "]: recv " + intfName + "." + methodName + "(" + (JSON.stringify(args)) + ")"));
    }
  };

  MessageDispatcher.prototype._handleClose = function() {
    this._reallyClosed = true;
    if (Verbose) {
      return Weinre.logDebug(this.constructor.name + ("[" + this._url + "]: closed"));
    }
  };

  return MessageDispatcher;

})();

require("../common/MethodNamer").setNamesForClass(module.exports);

});

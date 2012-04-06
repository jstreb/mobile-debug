;modjewel.define("weinre/target/WeinreTargetEventsImpl", function(require, exports, module) { var Callback, Console, Weinre, WeinreTargetEventsImpl;

Weinre = require('../common/Weinre');

Callback = require('../common/Callback');

Console = require('./Console');

module.exports = WeinreTargetEventsImpl = (function() {

  function WeinreTargetEventsImpl() {}

  WeinreTargetEventsImpl.prototype.connectionCreated = function(clientChannel, targetChannel) {
    var message;
    message = ("weinre: target " + targetChannel + " connected to client ") + clientChannel;
    Weinre.logInfo(message);
    return Weinre.target.whenBodyReady(this, [], function() {
      var oldValue;
      oldValue = Console.useRemote(true);
      Weinre.target.setDocument();
      Weinre.wi.TimelineNotify.timelineProfilerWasStopped();
      return Weinre.wi.DOMStorage.initialize();
    });
  };

  WeinreTargetEventsImpl.prototype.connectionDestroyed = function(clientChannel, targetChannel) {
    var message, oldValue;
    message = ("weinre: target " + targetChannel + " disconnected from client ") + clientChannel;
    Weinre.logInfo(message);
    return oldValue = Console.useRemote(false);
  };

  WeinreTargetEventsImpl.prototype.sendCallback = function(callbackId, result) {
    return Callback.invoke(callbackId, result);
  };

  return WeinreTargetEventsImpl;

})();

require("../common/MethodNamer").setNamesForClass(module.exports);

});

;modjewel.define("weinre/target/WiInspectorImpl", function(require, exports, module) { var Timeline, Weinre, WiInspectorImpl;

Weinre = require('../common/Weinre');

Timeline = require('../target/Timeline');

module.exports = WiInspectorImpl = (function() {

  function WiInspectorImpl() {}

  WiInspectorImpl.prototype.reloadPage = function(callback) {
    if (callback) Weinre.WeinreTargetCommands.sendClientCallback(callback);
    return window.location.reload();
  };

  WiInspectorImpl.prototype.highlightDOMNode = function(nodeId, callback) {
    var node;
    node = Weinre.nodeStore.getNode(nodeId);
    if (!node) {
      Weinre.logWarning(arguments.callee.signature + " passed an invalid nodeId: " + nodeId);
      return;
    }
    Weinre.elementHighlighter.on(node);
    if (callback) return Weinre.WeinreTargetCommands.sendClientCallback(callback);
  };

  WiInspectorImpl.prototype.hideDOMNodeHighlight = function(callback) {
    Weinre.elementHighlighter.off();
    if (callback) return Weinre.WeinreTargetCommands.sendClientCallback(callback);
  };

  WiInspectorImpl.prototype.startTimelineProfiler = function(callback) {
    Timeline.start();
    Weinre.wi.TimelineNotify.timelineProfilerWasStarted();
    if (callback) return Weinre.WeinreTargetCommands.sendClientCallback(callback);
  };

  WiInspectorImpl.prototype.stopTimelineProfiler = function(callback) {
    Timeline.stop();
    Weinre.wi.TimelineNotify.timelineProfilerWasStopped();
    if (callback) return Weinre.WeinreTargetCommands.sendClientCallback(callback);
  };

  return WiInspectorImpl;

})();

require("../common/MethodNamer").setNamesForClass(module.exports);

});

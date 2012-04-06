;modjewel.define("weinre/target/WeinreExtraClientCommandsImpl", function(require, exports, module) { var Console, Weinre, WeinreExtraClientCommandsImpl, WiDatabaseImpl;

Weinre = require('../common/Weinre');

WiDatabaseImpl = require('./WiDatabaseImpl');

Console = require('./Console');

module.exports = WeinreExtraClientCommandsImpl = (function() {

  function WeinreExtraClientCommandsImpl() {}

  WeinreExtraClientCommandsImpl.prototype.getDatabases = function(callback) {
    var result;
    if (!callback) return;
    result = WiDatabaseImpl.getDatabases();
    return Weinre.WeinreTargetCommands.sendClientCallback(callback, [result]);
  };

  return WeinreExtraClientCommandsImpl;

})();

require("../common/MethodNamer").setNamesForClass(module.exports);

});

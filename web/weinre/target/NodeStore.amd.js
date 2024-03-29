;modjewel.define("weinre/target/NodeStore", function(require, exports, module) { var IDGenerator, NodeStore, Weinre, handleDOMAttrModified, handleDOMCharacterDataModified, handleDOMNodeInserted, handleDOMNodeRemoved, handleDOMSubtreeModified;

Weinre = require('../common/Weinre');

IDGenerator = require('../common/IDGenerator');

module.exports = NodeStore = (function() {

  function NodeStore() {
    this.__nodeMap = {};
    this.__nodeDataMap = {};
    this.inspectedNodes = [];
    document.addEventListener("DOMSubtreeModified", handleDOMSubtreeModified, false);
    document.addEventListener("DOMNodeInserted", handleDOMNodeInserted, false);
    document.addEventListener("DOMNodeRemoved", handleDOMNodeRemoved, false);
    document.addEventListener("DOMAttrModified", handleDOMAttrModified, false);
    document.addEventListener("DOMCharacterDataModified", handleDOMCharacterDataModified, false);
  }

  NodeStore.prototype.addInspectedNode = function(nodeId) {
    this.inspectedNodes.unshift(nodeId);
    if (this.inspectedNodes.length > 5) {
      return this.inspectedNodes = this.inspectedNodes.slice(0, 5);
    }
  };

  NodeStore.prototype.getInspectedNode = function(index) {
    return this.inspectedNodes[index];
  };

  NodeStore.prototype.getNode = function(nodeId) {
    return this.__nodeMap[nodeId];
  };

  NodeStore.prototype.checkNodeId = function(node) {
    return IDGenerator.checkId(node);
  };

  NodeStore.prototype.getNodeId = function(node) {
    var id;
    id = this.checkNodeId(node);
    if (id) return id;
    return IDGenerator.getId(node, this.__nodeMap);
  };

  NodeStore.prototype.getNodeData = function(nodeId, depth) {
    return this.serializeNode(this.getNode(nodeId), depth);
  };

  NodeStore.prototype.getPreviousSiblingId = function(node) {
    var id, sib;
    while (true) {
      sib = node.previousSibling;
      if (!sib) return 0;
      id = this.checkNodeId(sib);
      if (id) return id;
      node = sib;
    }
  };

  NodeStore.prototype.nextNodeId = function() {
    return "" + IDGenerator.next();
  };

  NodeStore.prototype.serializeNode = function(node, depth) {
    var children, i, id, localName, nodeData, nodeName, nodeValue;
    nodeName = "";
    nodeValue = null;
    localName = null;
    id = this.getNodeId(node);
    switch (node.nodeType) {
      case Node.TEXT_NODE:
      case Node.COMMENT_NODE:
      case Node.CDATA_SECTION_NODE:
        nodeValue = node.nodeValue;
        break;
      case Node.ATTRIBUTE_NODE:
        localName = node.localName;
        break;
      case Node.DOCUMENT_FRAGMENT_NODE:
        break;
      default:
        nodeName = node.nodeName;
        localName = node.localName;
    }
    nodeData = {
      id: id,
      nodeType: node.nodeType,
      nodeName: nodeName,
      localName: localName,
      nodeValue: nodeValue
    };
    if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.DOCUMENT_NODE || node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      nodeData.childNodeCount = this.childNodeCount(node);
      children = this.serializeNodeChildren(node, depth);
      if (children.length) nodeData.children = children;
      if (node.nodeType === Node.ELEMENT_NODE) {
        nodeData.attributes = [];
        i = 0;
        while (i < node.attributes.length) {
          nodeData.attributes.push(node.attributes[i].nodeName);
          nodeData.attributes.push(node.attributes[i].nodeValue);
          i++;
        }
      } else {
        if (node.nodeType === Node.DOCUMENT_NODE) {
          nodeData.documentURL = window.location.href;
        }
      }
    } else if (node.nodeType === Node.DOCUMENT_TYPE_NODE) {
      nodeData.publicId = node.publicId;
      nodeData.systemId = node.systemId;
      nodeData.internalSubset = node.internalSubset;
    } else if (node.nodeType === Node.ATTRIBUTE_NODE) {
      nodeData.name = node.nodeName;
      nodeData.value = node.nodeValue;
    }
    return nodeData;
  };

  NodeStore.prototype.serializeNodeChildren = function(node, depth) {
    var childIds, childNode, i, result;
    result = [];
    childIds = this.childNodeIds(node);
    if (depth === 0) {
      if (childIds.length === 1) {
        childNode = this.getNode(childIds[0]);
        if (childNode.nodeType === Node.TEXT_NODE) {
          result.push(this.serializeNode(childNode));
        }
      }
      return result;
    }
    depth--;
    i = 0;
    while (i < childIds.length) {
      result.push(this.serializeNode(this.getNode(childIds[i]), depth));
      i++;
    }
    return result;
  };

  NodeStore.prototype.childNodeCount = function(node) {
    return this.childNodeIds(node).length;
  };

  NodeStore.prototype.childNodeIds = function(node) {
    var childNode, i, ids, _i, _len, _ref;
    ids = [];
    i = 0;
    _ref = node.childNodes;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      childNode = _ref[_i];
      if (this.isToBeSkipped(childNode)) continue;
      ids.push(this.getNodeId(childNode));
    }
    return ids;
  };

  NodeStore.prototype.isToBeSkipped = function(node) {
    if (!node) return true;
    if (node.__weinreHighlighter) return true;
    if (node.nodeType !== Node.TEXT_NODE) return false;
    return !!node.nodeValue.match(/^\s*$/);
  };

  return NodeStore;

})();

handleDOMSubtreeModified = function(event) {
  if (!event.attrChange) return;
  return NodeStore.handleDOMAttrModified(event);
};

handleDOMNodeInserted = function(event) {
  var child, parentId, previous, targetId;
  targetId = Weinre.nodeStore.checkNodeId(event.target);
  parentId = Weinre.nodeStore.checkNodeId(event.relatedNode);
  if (!parentId) return;
  child = Weinre.nodeStore.serializeNode(event.target, 0);
  previous = Weinre.nodeStore.getPreviousSiblingId(event.target);
  return Weinre.wi.DOMNotify.childNodeInserted(parentId, previous, child);
};

handleDOMNodeRemoved = function(event) {
  var childCount, parentId, targetId;
  targetId = Weinre.nodeStore.checkNodeId(event.target);
  parentId = Weinre.nodeStore.checkNodeId(event.relatedNode);
  if (!parentId) return;
  if (targetId) {
    if (parentId) return Weinre.wi.DOMNotify.childNodeRemoved(parentId, targetId);
  } else {
    childCount = Weinre.nodeStore.childNodeCount(event.relatedNode);
    return Weinre.wi.DOMNotify.childNodeCountUpdated(parentId, childCount);
  }
};

handleDOMAttrModified = function(event) {
  var attrs, i, targetId;
  targetId = Weinre.nodeStore.checkNodeId(event.target);
  if (!targetId) return;
  attrs = [];
  i = 0;
  while (i < event.target.attributes.length) {
    attrs.push(event.target.attributes[i].name);
    attrs.push(event.target.attributes[i].value);
    i++;
  }
  return Weinre.wi.DOMNotify.attributesUpdated(targetId, attrs);
};

handleDOMCharacterDataModified = function(event) {
  var targetId;
  targetId = Weinre.nodeStore.checkNodeId(event.target);
  if (!targetId) return;
  return Weinre.wi.DOMNotify.characterDataModified(targetId, event.newValue);
};

require("../common/MethodNamer").setNamesForClass(module.exports);

});

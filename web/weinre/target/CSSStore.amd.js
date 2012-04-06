;modjewel.define("weinre/target/CSSStore", function(require, exports, module) { var CSSStore, IDGenerator, Weinre, _elementMatchesSelector, _fallbackMatchesSelector, _getMappableId, _getMappableObject, _mozMatchesSelector, _webkitMatchesSelector;

IDGenerator = require('../common/IDGenerator');

Weinre = require('../common/Weinre');

_elementMatchesSelector = null;

module.exports = CSSStore = (function() {

  function CSSStore() {
    this.styleSheetMap = {};
    this.styleRuleMap = {};
    this.styleDeclMap = {};
    this.testElement = document.createElement("div");
  }

  CSSStore.prototype.getInlineStyle = function(node) {
    var cssProperty, styleObject, _i, _len, _ref;
    styleObject = this._buildMirrorForStyle(node.style, true);
    _ref = styleObject.cssProperties;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      cssProperty = _ref[_i];
      cssProperty.status = "style";
    }
    return styleObject;
  };

  CSSStore.prototype.getComputedStyle = function(node) {
    var styleObject;
    if (!node) return {};
    if (node.nodeType !== Node.ELEMENT_NODE) return {};
    styleObject = this._buildMirrorForStyle(window.getComputedStyle(node), false);
    return styleObject;
  };

  CSSStore.prototype.getMatchedCSSRules = function(node) {
    var cssRule, object, result, styleSheet, _i, _j, _len, _len2, _ref, _ref2;
    result = [];
    _ref = document.styleSheets;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      styleSheet = _ref[_i];
      if (!styleSheet.cssRules) continue;
      _ref2 = styleSheet.cssRules;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        cssRule = _ref2[_j];
        if (!_elementMatchesSelector(node, cssRule.selectorText)) continue;
        object = {};
        object.ruleId = this._getStyleRuleId(cssRule);
        object.selectorText = cssRule.selectorText;
        object.style = this._buildMirrorForStyle(cssRule.style, true);
        result.push(object);
      }
    }
    return result;
  };

  CSSStore.prototype.getStyleAttributes = function(node) {
    var result;
    result = {};
    return result;
  };

  CSSStore.prototype.getPseudoElements = function(node) {
    var result;
    result = [];
    return result;
  };

  CSSStore.prototype.setPropertyText = function(styleId, propertyIndex, text, overwrite) {
    var compare, i, key, mirror, properties, propertyIndices, propertyMirror, styleDecl;
    styleDecl = Weinre.cssStore._getStyleDecl(styleId);
    if (!styleDecl) {
      Weinre.logWarning("requested style not available: " + styleId);
      return null;
    }
    mirror = styleDecl.__weinre__mirror;
    if (!mirror) {
      Weinre.logWarning("requested mirror not available: " + styleId);
      return null;
    }
    properties = mirror.cssProperties;
    propertyMirror = this._parseProperty(text);
    if (null === propertyMirror) {
      this._removePropertyFromMirror(mirror, propertyIndex);
      properties = mirror.cssProperties;
    } else {
      this._removePropertyFromMirror(mirror, propertyIndex);
      properties = mirror.cssProperties;
      propertyIndices = {};
      i = 0;
      while (i < properties.length) {
        propertyIndices[properties[i].name] = i;
        i++;
      }
      i = 0;
      while (i < propertyMirror.cssProperties.length) {
        if (propertyIndices[propertyMirror.cssProperties[i].name] != null) {
          properties[propertyIndices[propertyMirror.cssProperties[i].name]] = propertyMirror.cssProperties[i];
        } else {
          properties.push(propertyMirror.cssProperties[i]);
        }
        i++;
      }
      for (key in propertyMirror.shorthandValues) {
        mirror.shorthandValues[key] = propertyMirror.shorthandValues[key];
      }
    }
    properties.sort(compare = function(p1, p2) {
      if (p1.name < p2.name) {
        return -1;
      } else if (p1.name > p2.name) {
        return 1;
      } else {
        return 0;
      }
    });
    this._setStyleFromMirror(styleDecl);
    return mirror;
  };

  CSSStore.prototype._removePropertyFromMirror = function(mirror, index) {
    var i, newProperties, properties, property;
    properties = mirror.cssProperties;
    if (index >= properties.length) return;
    property = properties[index];
    properties[index] = null;
    if (mirror.shorthandValues[property.name]) {
      delete mirror.shorthandValues[property.name];
      i = 0;
      while (i < properties.length) {
        if (properties[i]) {
          if (properties[i].shorthandName === property.name) properties[i] = null;
        }
        i++;
      }
    }
    newProperties = [];
    i = 0;
    while (i < properties.length) {
      if (properties[i]) newProperties.push(properties[i]);
      i++;
    }
    return mirror.cssProperties = newProperties;
  };

  CSSStore.prototype.toggleProperty = function(styleId, propertyIndex, disable) {
    var cssProperty, mirror, styleDecl;
    styleDecl = Weinre.cssStore._getStyleDecl(styleId);
    if (!styleDecl) {
      Weinre.logWarning("requested style not available: " + styleId);
      return null;
    }
    mirror = styleDecl.__weinre__mirror;
    if (!mirror) {
      Weinre.logWarning("requested mirror not available: " + styleId);
      return null;
    }
    cssProperty = mirror.cssProperties[propertyIndex];
    if (!cssProperty) {
      Weinre.logWarning(("requested property not available: " + styleId + ": ") + propertyIndex);
      return null;
    }
    if (disable) {
      cssProperty.status = "disabled";
    } else {
      cssProperty.status = "active";
    }
    this._setStyleFromMirror(styleDecl);
    return mirror;
  };

  CSSStore.prototype._setStyleFromMirror = function(styleDecl) {
    var cssProperties, cssText, property, _i, _len;
    cssText = [];
    cssProperties = styleDecl.__weinre__mirror.cssProperties;
    cssText = "";
    for (_i = 0, _len = cssProperties.length; _i < _len; _i++) {
      property = cssProperties[_i];
      if (!property.parsedOk) continue;
      if (property.status === "disabled") continue;
      if (property.shorthandName) continue;
      cssText += property.name + ": " + property.value;
      if (property.priority === "important") {
        cssText += " !important; ";
      } else {
        cssText += "; ";
      }
    }
    return styleDecl.cssText = cssText;
  };

  CSSStore.prototype._buildMirrorForStyle = function(styleDecl, bind) {
    var i, name, properties, property, result, shorthandName;
    result = {
      properties: {},
      cssProperties: []
    };
    if (!styleDecl) return result;
    if (bind) {
      result.styleId = this._getStyleDeclId(styleDecl);
      styleDecl.__weinre__mirror = result;
    }
    result.properties.width = styleDecl.getPropertyValue("width") || "";
    result.properties.height = styleDecl.getPropertyValue("height") || "";
    result.cssText = styleDecl.cssText;
    result.shorthandValues = {};
    properties = [];
    if (styleDecl) {
      i = 0;
      while (i < styleDecl.length) {
        property = {};
        name = styleDecl.item(i);
        property.name = name;
        property.priority = styleDecl.getPropertyPriority(name);
        property.implicit = styleDecl.isPropertyImplicit(name);
        property.shorthandName = styleDecl.getPropertyShorthand(name) || "";
        property.status = (property.shorthandName ? "style" : "active");
        property.parsedOk = true;
        property.value = styleDecl.getPropertyValue(name);
        properties.push(property);
        if (property.shorthandName) {
          shorthandName = property.shorthandName;
          if (!result.shorthandValues[shorthandName]) {
            result.shorthandValues[shorthandName] = styleDecl.getPropertyValue(shorthandName);
            property = {};
            property.name = shorthandName;
            property.priority = styleDecl.getPropertyPriority(shorthandName);
            property.implicit = styleDecl.isPropertyImplicit(shorthandName);
            property.shorthandName = "";
            property.status = "active";
            property.parsedOk = true;
            property.value = styleDecl.getPropertyValue(name);
            properties.push(property);
          }
        }
        i++;
      }
    }
    properties.sort(function(p1, p2) {
      if (p1.name < p2.name) {
        return -1;
      } else if (p1.name > p2.name) {
        return 1;
      } else {
        return 0;
      }
    });
    result.cssProperties = properties;
    return result;
  };

  CSSStore.prototype._parseProperty = function(string) {
    var match, property, propertyPattern, result, testStyleDecl;
    testStyleDecl = this.testElement.style;
    try {
      testStyleDecl.cssText = string;
      if (testStyleDecl.cssText !== "") {
        return this._buildMirrorForStyle(testStyleDecl, false);
      }
    } catch (_error) {}
    propertyPattern = /\s*(.+)\s*:\s*(.+)\s*(!important)?\s*;/;
    match = propertyPattern.exec(string);
    if (!match) return null;
    match[3] = (match[3] === "!important" ? "important" : "");
    property = {};
    property.name = match[1];
    property.priority = match[3];
    property.implicit = true;
    property.shorthandName = "";
    property.status = "inactive";
    property.parsedOk = false;
    property.value = match[2];
    result = {};
    result.width = 0;
    result.height = 0;
    result.shorthandValues = 0;
    result.cssProperties = [property];
    return result;
  };

  CSSStore.prototype._getStyleSheet = function(id) {
    return _getMappableObject(id, this.styleSheetMap);
  };

  CSSStore.prototype._getStyleSheetId = function(styleSheet) {
    return _getMappableId(styleSheet, this.styleSheetMap);
  };

  CSSStore.prototype._getStyleRule = function(id) {
    return _getMappableObject(id, this.styleRuleMap);
  };

  CSSStore.prototype._getStyleRuleId = function(styleRule) {
    return _getMappableId(styleRule, this.styleRuleMap);
  };

  CSSStore.prototype._getStyleDecl = function(id) {
    return _getMappableObject(id, this.styleDeclMap);
  };

  CSSStore.prototype._getStyleDeclId = function(styleDecl) {
    return _getMappableId(styleDecl, this.styleDeclMap);
  };

  return CSSStore;

})();

_getMappableObject = function(id, map) {
  return map[id];
};

_getMappableId = function(object, map) {
  return IDGenerator.getId(object, map);
};

_mozMatchesSelector = function(element, selector) {
  if (!element.mozMatchesSelector) return false;
  return element.mozMatchesSelector(selector);
};

_webkitMatchesSelector = function(element, selector) {
  if (!element.webkitMatchesSelector) return false;
  return element.webkitMatchesSelector(selector);
};

_fallbackMatchesSelector = function(element, selector) {
  return false;
};

if (Element.prototype.webkitMatchesSelector) {
  _elementMatchesSelector = _webkitMatchesSelector;
} else if (Element.prototype.mozMatchesSelector) {
  _elementMatchesSelector = _mozMatchesSelector;
} else {
  _elementMatchesSelector = _fallbackMatchesSelector;
}

require("../common/MethodNamer").setNamesForClass(module.exports);

});

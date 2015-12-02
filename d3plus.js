(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
 (c) 2013, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/

(function () { 'use strict';

// to suit your point format, run search/replace for '.x' and '.y';
// for 3D version, see 3d branch (configurability would draw significant performance overhead)

// square distance between 2 points
function getSqDist(p1, p2) {

    var dx = p1.x - p2.x,
        dy = p1.y - p2.y;

    return dx * dx + dy * dy;
}

// square distance from a point to a segment
function getSqSegDist(p, p1, p2) {

    var x = p1.x,
        y = p1.y,
        dx = p2.x - x,
        dy = p2.y - y;

    if (dx !== 0 || dy !== 0) {

        var t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = p2.x;
            y = p2.y;

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = p.x - x;
    dy = p.y - y;

    return dx * dx + dy * dy;
}
// rest of the code doesn't care about point format

// basic distance-based simplification
function simplifyRadialDist(points, sqTolerance) {

    var prevPoint = points[0],
        newPoints = [prevPoint],
        point;

    for (var i = 1, len = points.length; i < len; i++) {
        point = points[i];

        if (getSqDist(point, prevPoint) > sqTolerance) {
            newPoints.push(point);
            prevPoint = point;
        }
    }

    if (prevPoint !== point) newPoints.push(point);

    return newPoints;
}

// simplification using optimized Douglas-Peucker algorithm with recursion elimination
function simplifyDouglasPeucker(points, sqTolerance) {

    var len = points.length,
        MarkerArray = typeof Uint8Array !== 'undefined' ? Uint8Array : Array,
        markers = new MarkerArray(len),
        first = 0,
        last = len - 1,
        stack = [],
        newPoints = [],
        i, maxSqDist, sqDist, index;

    markers[first] = markers[last] = 1;

    while (last) {

        maxSqDist = 0;

        for (i = first + 1; i < last; i++) {
            sqDist = getSqSegDist(points[i], points[first], points[last]);

            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            markers[index] = 1;
            stack.push(first, index, index, last);
        }

        last = stack.pop();
        first = stack.pop();
    }

    for (i = 0; i < len; i++) {
        if (markers[i]) newPoints.push(points[i]);
    }

    return newPoints;
}

// both algorithms combined for awesome performance
function simplify(points, tolerance, highestQuality) {

    var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

    points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
    points = simplifyDouglasPeucker(points, sqTolerance);

    return points;
}

// export as AMD module / Node module / browser or worker variable
if (typeof define === 'function' && define.amd) define(function() { return simplify; });
else if (typeof module !== 'undefined') module.exports = simplify;
else if (typeof self !== 'undefined') self.simplify = simplify;
else window.simplify = simplify;

})();

},{}],2:[function(require,module,exports){
var colorSort;

colorSort = require("../color/sort.coffee");

module.exports = function(a, b, keys, sort, colors, vars, depth) {
  var i, k, retVal;
  if (!sort) {
    sort = "asc";
  }
  if (!(colors instanceof Array)) {
    colors = [colors];
  }
  if (!(keys instanceof Array)) {
    keys = [keys];
  }
  if (vars && depth !== void 0 && typeof depth !== "number") {
    depth = vars.id.nesting.indexOf(depth);
  }
  retVal = 0;
  i = 0;
  while (i < keys.length) {
    k = keys[i];
    a = vars && a.d3plus && a.d3plus.sortKeys ? a.d3plus.sortKeys[k] : a[k];
    b = vars && b.d3plus && b.d3plus.sortKeys ? b.d3plus.sortKeys[k] : b[k];
    if (vars && colors.indexOf(k) >= 0) {
      retVal = colorSort(a, b);
    } else {
      retVal = a < b ? -1 : 1;
    }
    if (retVal !== 0 || i === keys.length - 1) {
      break;
    }
    i++;
  }
  if (sort === "asc") {
    return retVal;
  } else {
    return -retVal;
  }
};


},{"../color/sort.coffee":18}],3:[function(require,module,exports){
module.exports = function(arr, value) {
  var constructor;
  if (arr instanceof Array) {
    constructor = value === void 0 || value === null ? value : value.constructor;
    return arr.indexOf(value) >= 0 || arr.indexOf(constructor) >= 0;
  } else {
    return false;
  }
};


},{}],4:[function(require,module,exports){
var comparator, fetchSort;

comparator = require("./comparator.coffee");

fetchSort = require("../core/fetch/sort.coffee");

module.exports = function(arr, keys, sort, colors, vars, depth) {
  var d, data, i, len;
  if (!arr || arr.length <= 1) {
    return arr || [];
  } else {
    if (vars) {
      if (!keys) {
        keys = vars.order.value || vars.size.value || vars.id.value;
      }
      if (!sort) {
        sort = vars.order.sort.value;
      }
      if (!colors) {
        colors = vars.color.value || [];
      }
      for (i = 0, len = arr.length; i < len; i++) {
        d = arr[i];
        if (!d.d3plus) {
          d.d3plus = {};
        }
        data = "d3plus" in d && "d3plus" in d.d3plus ? d.d3plus : d;
        d.d3plus.sortKeys = fetchSort(vars, data, keys, colors, depth);
      }
    }
    return arr.sort(function(a, b) {
      return comparator(a, b, keys, sort, colors, vars, depth);
    });
  }
};


},{"../core/fetch/sort.coffee":24,"./comparator.coffee":2}],5:[function(require,module,exports){
module.exports = function(arr, x) {
  if (x === void 0) {
    return arr;
  }
  if (x === false) {
    return [];
  }
  if (x instanceof Array) {
    return x;
  }
  if (!(arr instanceof Array)) {
    arr = [];
  }
  if (arr.indexOf(x) >= 0) {
    arr.splice(arr.indexOf(x), 1);
  } else {
    arr.push(x);
  }
  return arr;
};


},{}],6:[function(require,module,exports){
var sheet;

sheet = function(name) {
  var css, i, returnBoolean, tested;
  tested = sheet.tested;
  if (name in tested) {
    return tested[name];
  }
  i = 0;
  returnBoolean = false;
  while (i < document.styleSheets.length) {
    css = document.styleSheets[i];
    if (css.href && css.href.indexOf(name) >= 0) {
      returnBoolean = true;
      break;
    }
    i++;
  }
  return returnBoolean;
};

sheet.tested = {};

module.exports = sheet;


},{}],7:[function(require,module,exports){
// Determines if the current browser is Internet Explorer.
module.exports = /*@cc_on!@*/false

},{}],8:[function(require,module,exports){
var ie, touch;

ie = require("./ie.js");

touch = require("./touch.coffee");

if (touch) {
  module.exports = {
    click: "click",
    down: "touchstart",
    up: "touchend",
    over: ie ? "mouseenter" : "mouseover",
    out: ie ? "mouseleave" : "mouseout",
    move: "mousemove"
  };
} else {
  module.exports = {
    click: "click",
    down: "mousedown",
    up: "mouseup",
    over: ie ? "mouseenter" : "mouseover",
    out: ie ? "mouseleave" : "mouseout",
    move: "mousemove"
  };
}


},{"./ie.js":7,"./touch.coffee":12}],9:[function(require,module,exports){
var prefix;

prefix = function() {
  var val;
  if ("-webkit-transform" in document.body.style) {
    val = "-webkit-";
  } else if ("-moz-transform" in document.body.style) {
    val = "-moz-";
  } else if ("-ms-transform" in document.body.style) {
    val = "-ms-";
  } else if ("-o-transform" in document.body.style) {
    val = "-o-";
  } else {
    val = "";
  }
  prefix = function() {
    return val;
  };
  return val;
};

module.exports = prefix;


},{}],10:[function(require,module,exports){
module.exports = d3.select("html").attr("dir") === "rtl";


},{}],11:[function(require,module,exports){
var scrollbar;

scrollbar = function() {
  var inner, outer, val, w1, w2;
  inner = document.createElement("p");
  inner.style.width = "100%";
  inner.style.height = "200px";
  outer = document.createElement("div");
  outer.style.position = "absolute";
  outer.style.top = "0px";
  outer.style.left = "0px";
  outer.style.visibility = "hidden";
  outer.style.width = "200px";
  outer.style.height = "150px";
  outer.style.overflow = "hidden";
  outer.appendChild(inner);
  document.body.appendChild(outer);
  w1 = inner.offsetWidth;
  outer.style.overflow = "scroll";
  w2 = inner.offsetWidth;
  if (w1 === w2) {
    w2 = outer.clientWidth;
  }
  document.body.removeChild(outer);
  val = w1 - w2;
  scrollbar = function() {
    return val;
  };
  return val;
};

module.exports = scrollbar;


},{}],12:[function(require,module,exports){
module.exports = ("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch ? true : false;


},{}],13:[function(require,module,exports){
module.exports = function(color) {
  var hsl;
  hsl = d3.hsl(color);
  if (hsl.l > .45) {
    if (hsl.s > .8) {
      hsl.s = 0.8;
    }
    hsl.l = 0.45;
  }
  return hsl.toString();
};


},{}],14:[function(require,module,exports){
module.exports = function(color, increment) {
  var c;
  if (increment === void 0) {
    increment = 0.5;
  }
  c = d3.hsl(color);
  increment = (1 - c.l) * increment;
  c.l += increment;
  c.s -= increment;
  return c.toString();
};


},{}],15:[function(require,module,exports){
module.exports = function(c1, c2, o1, o2) {
  var b, g, r;
  if (!o1) {
    o1 = 1;
  }
  if (!o2) {
    o2 = 1;
  }
  c1 = d3.rgb(c1);
  c2 = d3.rgb(c2);
  r = (o1 * c1.r + o2 * c2.r - o1 * o2 * c2.r) / (o1 + o2 - o1 * o2);
  g = (o1 * c1.g + o2 * c2.g - o1 * o2 * c2.g) / (o1 + o2 - o1 * o2);
  b = (o1 * c1.b + o2 * c2.b - o1 * o2 * c2.b) / (o1 + o2 - o1 * o2);
  return d3.rgb(r, g, b).toString();
};


},{}],16:[function(require,module,exports){
var defaultScale;

defaultScale = require("./scale.coffee");

module.exports = function(x, scale) {
  var rand_int;
  rand_int = x || Math.floor(Math.random() * 20);
  scale = scale || defaultScale;
  return scale(rand_int);
};


},{"./scale.coffee":17}],17:[function(require,module,exports){
module.exports = d3.scale.ordinal().range(["#b22200", "#EACE3F", "#282F6B", "#B35C1E", "#224F20", "#5F487C", "#759143", "#419391", "#993F88", "#e89c89", "#ffee8d", "#afd5e8", "#f7ba77", "#a5c697", "#c5b5e5", "#d1d392", "#bbefd0", "#e099cf"]);


},{}],18:[function(require,module,exports){
module.exports = function(a, b) {
  var aHSL, bHSL;
  aHSL = d3.hsl(a);
  bHSL = d3.hsl(b);
  a = aHSL.s === 0 ? 361 : aHSL.h;
  b = bHSL.s === 0 ? 361 : bHSL.h;
  if (a === b) {
    return aHSL.l - bHSL.l;
  } else {
    return a - b;
  }
};


},{}],19:[function(require,module,exports){
module.exports = function(color) {
  var b, g, r, rgbColor, yiq;
  rgbColor = d3.rgb(color);
  r = rgbColor.r;
  g = rgbColor.g;
  b = rgbColor.b;
  yiq = (r * 299 + g * 587 + b * 114) / 1000;
  if (yiq >= 128) {
    return "#444444";
  } else {
    return "#f7f7f7";
  }
};


},{}],20:[function(require,module,exports){
module.exports = function(color) {
  var blackColors, testColor, userBlack;
  color = color + "";
  color = color.replace(RegExp(" ", "g"), "");
  if (color.indexOf("rgb") === 0) {
    color = color.split("(")[1].split(")")[0].split(",").slice(0, 3).join(",");
  }
  if (color.indexOf("hsl") === 0) {
    color = color.split(",")[2].split(")")[0];
  }
  testColor = d3.rgb(color).toString();
  blackColors = ["black", "#000", "#000000", "0%", "0,0,0"];
  userBlack = blackColors.indexOf(color) >= 0;
  return testColor !== "#000000" || userBlack;
};


},{}],21:[function(require,module,exports){
var ie, print, wiki;

ie = require("../../client/ie.js");

wiki = require("./wiki.coffee");

print = function(type, message, style) {
  style = style || "";
  if (ie || typeof InstallTrigger !== 'undefined') {
    console.log("[ D3plus ] " + message);
  } else if (type.indexOf("group") === 0) {
    console[type]("%c[ D3plus ]%c " + message, "font-weight: 800;" + "color: #b35c1e;" + "margin-left: 0px;", "font-weight:200;" + style);
  } else {
    console[type]("%c" + message, style + "font-weight:200;");
  }
};

print.comment = function(message) {
  this("log", message, "color:#aaa;");
};

print.error = function(message, url) {
  this("groupCollapsed", "ERROR: " + message, "font-weight:800;color:#D74B03;");
  this.stack();
  this.wiki(url);
  this.groupEnd();
};

print.group = function(message) {
  this("group", message, "color:#888;");
};

print.groupCollapsed = function(message) {
  this("groupCollapsed", message, "color:#888;");
};

print.groupEnd = function() {
  if (!ie) {
    console.groupEnd();
  }
};

print.log = function(message) {
  this("log", message, "color:#444444;");
};

print.stack = function() {
  var err, line, message, page, splitter, stack, url;
  if (!ie) {
    err = new Error();
    if (err.stack) {
      stack = err.stack.split("\n");
      stack = stack.filter(function(e) {
        return e.indexOf("Error") !== 0 && e.indexOf("d3plus.js:") < 0 && e.indexOf("d3plus.min.js:") < 0;
      });
      if (stack.length && stack[0].length) {
        splitter = window.chrome ? "at " : "@";
        url = stack[0];
        if (url.indexOf(splitter) >= 0) {
          url = url.split(splitter)[1];
        }
        stack = url.split(":");
        if (stack.length === 3) {
          stack.pop();
        }
        line = stack.pop();
        page = stack.join(":").split("/");
        page = page[page.length - 1];
        message = "line " + line + " of " + page + ": " + url;
        this("log", message, "color:#D74B03;");
      }
    }
  }
};

print.time = function(message) {
  if (!ie) {
    console.time(message);
  }
};

print.timeEnd = function(message) {
  if (!ie) {
    console.timeEnd(message);
  }
};

print.warning = function(message, url) {
  this("groupCollapsed", message, "color:#888;");
  this.stack();
  this.wiki(url);
  this.groupEnd();
};

print.wiki = function(url) {
  if (url) {
    if (url in wiki) {
      url = d3plus.repo + "wiki/" + wiki[url];
    }
    this("log", "documentation: " + url, "color:#aaa;");
  }
};

module.exports = print;


},{"../../client/ie.js":7,"./wiki.coffee":22}],22:[function(require,module,exports){
module.exports = {
  active: "Visualizations#active",
  aggs: "Visualizations#aggs",
  alt: "Forms#alt",
  attrs: "Visualizations#attrs",
  axes: "Visualizations#axes",
  background: "Visualizations#background",
  color: "Visualizations#color",
  cols: "Visualizations#cols",
  config: "Visualizations#config",
  container: "Visualizations#container",
  coords: "Visualizations#coords",
  csv: "Visualizations#csv",
  data: "Visualizations#data",
  depth: "Visualizations#depth",
  descs: "Visualizations#descs",
  dev: "Visualizations#dev",
  draw: "Visualizations#draw",
  edges: "Visualizations#edges",
  error: "Visualizations#error",
  focus: "Visualizations#focus",
  font: "Visualizations#font",
  footer: "Visualizations#footer",
  format: "Visualizations#format",
  height: "Visualizations#height",
  history: "Visualizations#history",
  hover: "Forms#hover",
  icon: "Visualizations#icon",
  id: "Visualizations#id",
  keywords: "Forms#keywords",
  labels: "Visualizations#labels",
  legend: "Visualizations#legend",
  links: "Visualizations#links",
  margin: "Visualizations#margin",
  messages: "Visualizations#messages",
  method: "Methods",
  mouse: "Visualizations#mouse",
  nodes: "Visualizations#nodes",
  open: "Forms#open",
  order: "Visualizations#order",
  remove: "Forms#remove",
  search: "Forms#search",
  select: "Forms#select",
  selectAll: "Forms#selectAll",
  shape: "Visualizations#shape",
  size: "Visualizations#size",
  temp: "Visualizations#temp",
  text: "Visualizations#text",
  time: "Visualizations#time",
  timeline: "Visualizations#timeline",
  timing: "Visualizations#timing",
  title: "Visualizations#title",
  tooltip: "Visualizations#tooltip",
  total: "Visualizations#total",
  type: "Visualizations#type",
  ui: "Visualizations#ui",
  width: "Visualizations#width",
  x: "Visualizations#x",
  y: "Visualizations#y",
  zoom: "Visualizations#zoom"
};


},{}],23:[function(require,module,exports){
var fetchValue, getColor, getRandom, randomColor, uniques, validColor, validObject;

fetchValue = require("./value.coffee");

randomColor = require("../../color/random.coffee");

validColor = require("../../color/validate.coffee");

validObject = require("../../object/validate.coffee");

uniques = require("../../util/uniques.coffee");

module.exports = function(vars, id, level) {
  var color, colorLevel, colors, i, obj, value;
  obj = validObject(id);
  if (obj && "d3plus" in id && "color" in id.d3plus) {
    return id.d3plus.color;
  }
  if (level === void 0) {
    level = vars.id.value;
  }
  if (typeof level === "number") {
    level = vars.id.nesting[level];
  }
  if (!vars.color.value) {
    return getRandom(vars, id, level);
  } else {
    colors = [];
    i = vars.id.nesting.indexOf(level);
    while (i >= 0) {
      colorLevel = vars.id.nesting[i];
      value = uniques(id, vars.color.value, fetchValue, vars, colorLevel);
      if (value.length === 1) {
        value = value[0];
      }
      if (!(value instanceof Array) && value !== void 0 && value !== null) {
        color = getColor(vars, id, value, level);
        if (colors.indexOf(color) < 0) {
          colors.push(color);
        }
        break;
      }
      i--;
    }
    if (colors.length === 1) {
      return colors[0];
    } else {
      return vars.color.missing;
    }
  }
};

getColor = function(vars, id, color, level) {
  if (!color) {
    if (vars.color.value && typeof vars.color.valueScale === "function") {
      return vars.color.valueScale(0);
    }
    return getRandom(vars, id, level);
  } else if (!vars.color.valueScale) {
    if (validColor(color)) {
      return color;
    } else {
      return getRandom(vars, color, level);
    }
  } else {
    return vars.color.valueScale(color);
  }
};

getRandom = function(vars, c, level) {
  if (validObject(c)) {
    c = fetchValue(vars, c, level);
  }
  if (c instanceof Array) {
    c = c[0];
  }
  return randomColor(c, vars.color.scale.value);
};


},{"../../color/random.coffee":16,"../../color/validate.coffee":20,"../../object/validate.coffee":49,"../../util/uniques.coffee":84,"./value.coffee":26}],24:[function(require,module,exports){
var fetchColor, fetchText, fetchValue;

fetchValue = require("./value.coffee");

fetchColor = require("./color.coffee");

fetchText = require("./text.js");

module.exports = function(vars, d, keys, colors, depth) {
  var i, key, len, obj, value;
  if (!(keys instanceof Array)) {
    keys = [keys];
  }
  if (!(colors instanceof Array)) {
    colors = [colors];
  }
  if (vars && depth !== void 0 && typeof depth !== "number") {
    depth = vars.id.nesting.indexOf(depth);
  }
  obj = {};
  for (i = 0, len = keys.length; i < len; i++) {
    key = keys[i];
    if (vars) {
      if (colors.indexOf(key) >= 0) {
        value = fetchColor(vars, d, depth);
      } else if (key === vars.text.value) {
        value = fetchText(vars, d, depth);
      } else {
        value = fetchValue(vars, d, key, depth);
      }
    } else {
      value = d[key];
    }
    if (value instanceof Array) {
      value = value[0];
    }
    value = typeof value === "string" ? value.toLowerCase() : value;
    obj[key] = value;
  }
  return obj;
};


},{"./color.coffee":23,"./text.js":25,"./value.coffee":26}],25:[function(require,module,exports){
var fetchValue = require("./value.coffee"),
    validObject = require("../../object/validate.coffee"),
    uniques     = require("../../util/uniques.coffee");

//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Get array of available text values
//------------------------------------------------------------------------------
module.exports = function(vars, obj, depth) {

  if (typeof depth !== "number") depth = vars.depth.value;

  var key = vars.id.nesting[depth], textKeys;

  if ( vars.text.nesting && validObject(vars.text.nesting) ) {
    if ( vars.text.nesting[key] ) {
      textKeys = vars.text.nesting[key];
    }
    else {
      textKeys = vars.text.value;
    }
  }
  else {
    textKeys = [];
    if (vars.text.value && depth === vars.depth.value) textKeys.push(vars.text.value);
    textKeys.push(key);
  }

  if ( !(textKeys instanceof Array) ) {
    textKeys = [ textKeys ];
  }

  var names = [];

  if (validObject(obj) && "d3plus" in obj && obj.d3plus.text) {
    names.push(obj.d3plus.text.toString());
    names.push(vars.format.value(obj.d3plus.text.toString(), {"vars": vars, "data": obj}));
  }
  else {

    var formatObj = validObject(obj) ? obj : undefined;

    if (formatObj && obj[vars.id.value] instanceof Array) {
      obj = obj[vars.id.value];
    }
    else if (!(obj instanceof Array)) {
      obj = [obj];
    }

    textKeys.forEach(function( t ){

      var name = uniques(obj, t, fetchValue, vars, key);

      if ( name.length ) {
        if (name.length > 1) {
          name = name.filter(function(n){
            return (n instanceof Array) || (typeof n === "string" && n.indexOf(" < ") < 0);
          });
        }
        name = name.map(function(n){
          if (n instanceof Array) {
            n = n.filter(function(nn){ return nn; });
            return n.map(function(nn){
              return vars.format.value(nn.toString(), {"vars": vars, "data": formatObj, "key": t});
            });
          }
          else if (n) {
            return vars.format.value(n.toString(), {"vars": vars, "data": formatObj, "key": t});
          }
        });
        if (name.length === 1) name = name[0];
        names.push(name);
      }

    });

  }

  return names;

};

},{"../../object/validate.coffee":49,"../../util/uniques.coffee":84,"./value.coffee":26}],26:[function(require,module,exports){
var cacheInit, checkAttrs, checkData, fetch, fetchArray, filterArray, find, uniqueValues, validObject, valueParse;

validObject = require("../../object/validate.coffee");

uniqueValues = require("../../util/uniques.coffee");

find = function(vars, node, variable, depth) {
  var cache, nodeObject, returned, val;
  nodeObject = validObject(node);
  if (typeof variable === "function" && nodeObject) {
    return variable(node, vars);
  }
  if (nodeObject) {
    if (variable in node) {
      return node[variable];
    }
    cache = vars.data.cacheID + "_" + depth;
    cacheInit(node, cache, vars);
    if (variable in node.d3plus.data[cache]) {
      return node.d3plus.data[cache][variable];
    }
    if (depth in node) {
      node = node[depth];
    } else if (vars.id.value in node) {
      node = node[vars.id.value];
      if (depth !== variable) {
        returned = checkData(vars, node, depth, vars.id.value);
      }
      if (returned === null || returned === void 0) {
        returned = checkAttrs(vars, node, depth, vars.id.value);
      }
      if (returned === null || returned === void 0) {
        return null;
      } else if (depth === variable) {
        return returned;
      }
      node = returned;
    } else {
      return null;
    }
  }
  if (node instanceof Array && !validObject(node[0])) {
    node = uniqueValues(node);
  }
  if (node instanceof Array && validObject(node[0])) {
    val = uniqueValues(node, variable);
    if (val.length) {
      return val;
    }
  }
  val = checkData(vars, node, variable, depth);
  if (val) {
    return val;
  }
  val = checkAttrs(vars, node, variable, depth);
  return val;
};

checkData = function(vars, node, variable, depth) {
  var val;
  if (vars.data.viz instanceof Array && variable in vars.data.keys) {
    val = uniqueValues(filterArray(vars.data.viz, node, depth), variable);
  }
  if (val && val.length) {
    return val;
  } else {
    return null;
  }
};

checkAttrs = function(vars, node, variable, depth) {
  var attrList, n, val, vals;
  if ("attrs" in vars && vars.attrs.value && variable in vars.attrs.keys) {
    if (validObject(vars.attrs.value) && depth in vars.attrs.value) {
      attrList = vars.attrs.value[depth];
    } else {
      attrList = vars.attrs.value;
    }
    if (attrList instanceof Array) {
      val = uniqueValues(filterArray(attrList, node, depth), variable);
      if (val.length) {
        return val;
      }
    } else if (node instanceof Array) {
      attrList = [
        (function() {
          var j, len, results;
          if (n in attrList) {
            results = [];
            for (j = 0, len = node.length; j < len; j++) {
              n = node[j];
              results.push(attrList[n]);
            }
            return results;
          }
        })()
      ];
      if (attrList.length) {
        vals = uniqueValues(attrList, variable);
        if (vals.length) {
          return vals;
        }
      }
    } else if (node in attrList) {
      return attrList[node][variable];
    }
  }
  return null;
};

filterArray = function(arr, node, depth) {
  if (node instanceof Array) {
    return arr.filter(function(d) {
      return node.indexOf(d[depth]) >= 0;
    });
  } else {
    return arr.filter(function(d) {
      return d[depth] === node;
    });
  }
};

cacheInit = function(node, cache, vars) {
  if (!("d3plus" in node)) {
    node.d3plus = {};
  }
  if (!("data" in node.d3plus)) {
    node.d3plus.data = {};
  }
  if (vars.data.changed || (vars.attrs && vars.attrs.changed) || !(cache in node.d3plus.data)) {
    node.d3plus.data[cache] = {};
  }
  return node;
};

valueParse = function(vars, node, depth, variable, val) {
  var cache, d, i, j, len, timeVar, v;
  if (val === null) {
    return val;
  }
  timeVar = "time" in vars && vars.time.value === variable;
  if (!(val instanceof Array)) {
    val = [val];
  }
  for (i = j = 0, len = val.length; j < len; i = ++j) {
    v = val[i];
    if (timeVar && v !== null && v.constructor !== Date) {
      v = v + "";
      if (v.length === 4 && parseInt(v) + "" === v) {
        v += "/01/01";
      }
      d = new Date(v);
      if (d !== "Invalid Date") {
        val[i] = d;
      }
    }
  }
  if (val.length === 1) {
    val = val[0];
  }
  if (val !== null && validObject(node) && typeof variable === "string" && !(variable in node)) {
    cache = vars.data.cacheID + "_" + depth;
    node.d3plus.data[cache][variable] = val;
  }
  return val;
};

fetchArray = function(vars, arr, variable, depth) {
  var item, j, len, v, val;
  val = [];
  for (j = 0, len = arr.length; j < len; j++) {
    item = arr[j];
    if (validObject(item)) {
      v = find(vars, item, variable, depth);
      val.push(valueParse(vars, item, depth, variable, v));
    } else {
      val.push(item);
    }
  }
  if (typeof val[0] !== "number") {
    val = uniqueValues(val);
  }
  if (val.length === 1) {
    return val[0];
  } else {
    return val;
  }
};

fetch = function(vars, node, variable, depth) {
  var nodeObject, val;
  if (!variable) {
    return null;
  }
  if (typeof variable === "number") {
    return variable;
  }
  nodeObject = validObject(node);
  if (!depth) {
    depth = vars.id.value;
  }
  if (nodeObject && node.values instanceof Array) {
    val = fetchArray(vars, node.values, variable, depth);
  } else if (nodeObject && node[variable] instanceof Array) {
    val = fetchArray(vars, node[variable], variable, depth);
  } else if (node instanceof Array) {
    val = fetchArray(vars, node, variable, depth);
  } else {
    val = find(vars, node, variable, depth);
    val = valueParse(vars, node, depth, variable, val);
  }
  return val;
};

module.exports = fetch;


},{"../../object/validate.coffee":49,"../../util/uniques.coffee":84}],27:[function(require,module,exports){
module.exports = function(type) {
  var attrs, styles, tester;
  if (["div", "svg"].indexOf(type) < 0) {
    type = "div";
  }
  styles = {
    position: "absolute",
    left: "-9999px",
    top: "-9999px",
    visibility: "hidden",
    display: "block"
  };
  attrs = type === "div" ? {} : {
    position: "absolute"
  };
  tester = d3.select("body").selectAll(type + ".d3plus_tester").data([0]);
  tester.enter().append(type).attr("class", "d3plus_tester").style(styles).attr(attrs);
  return tester;
};


},{}],28:[function(require,module,exports){
module.exports = {
  dev: {
    accepted: "{0} is not an accepted value for {1}, please use one of the following: {2}.",
    deprecated: "the {0} method has been removed, please update your code to use {1}.",
    noChange: "{0} was not updated because it did not change.",
    noContainer: "cannot find a container on the page matching {0}.",
    of: "of",
    oldStyle: "style properties for {0} have now been embedded directly into .{1}().",
    sameEdge: "edges cannot link to themselves. automatically removing self-referencing edge {0}.",
    set: "{0} has been set.",
    setLong: "{0} has been set to {1}.",
    setContainer: "please define a container div using .container()"
  },
  error: {
    accepted: "{0} is not an accepted {1} for {2} visualizations, please use one of the following: {3}.",
    connections: "no connections available for {0}.",
    data: "no data available",
    dataYear: "no data available for {0}.",
    lib: "{0} visualizations require loading the {1} library.",
    libs: "{0} visualizations require loading the following libraries: {1}.",
    method: "{0} visualizations require setting the {1} method.",
    methods: "{0} visualizations require setting the following methods: {1}."
  },
  format: {
    decimal: ".",
    thousands: ",",
    grouping: [3],
    currency: ["$", ""],
    dateTime: "%A, %B %-d, %Y %X",
    date: "%-m/%-d/%Y",
    time: "%I:%M:%S %p",
    periods: ["AM", "PM"],
    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  },
  lowercase: ["a", "an", "and", "as", "at", "but", "by", "for", "from", "if", "in", "into", "near", "nor", "of", "on", "onto", "or", "per", "that", "the", "to", "with", "via", "vs", "vs."],
  message: {
    data: "analyzing data",
    draw: "drawing visualization",
    initializing: "initializing {0}",
    loading: "loading data",
    tooltipReset: "resetting tooltips",
    ui: "updating ui"
  },
  method: {
    active: "active segments",
    color: "color",
    depth: "depth",
    dev: "verbose",
    focus: "focus",
    icon: "icon",
    id: "id",
    height: "height",
    labels: "labels",
    legend: "legend",
    margin: "margin",
    messages: "status messages",
    mode: "mode",
    mute: "hide",
    order: "order",
    search: "search",
    shape: "shape",
    size: "size",
    solo: "isolate",
    style: "style",
    temp: "temporary segments",
    text: "text",
    time: "time",
    timeline: "timeline",
    total: "total segments",
    type: "type",
    width: "width",
    x: "x axis",
    y: "y axis",
    zoom: "zoom"
  },
  time: ["date", "day", "month", "time", "year"],
  timeFormat: {
    FullYear: "%Y",
    Month: "%B",
    MonthSmall: "%b",
    Date: "%A %-d",
    DateSmall: "%-d",
    Hours: "%I %p",
    Minutes: "%I:%M",
    Seconds: "%Ss",
    Milliseconds: "%Lms",
    "FullYear-Month": "%b %Y",
    "FullYear-Date": "%-m/%-d/%Y",
    "Month-Date": "%b %-d",
    "Hours-Minutes": "%I:%M %p",
    "Hours-Seconds": "%I:%M:%S %p",
    "Hours-Milliseconds": "%H:%M:%S.%L",
    "Minutes-Seconds": "%I:%M:%S %p",
    "Minutes-Milliseconds": "%H:%M:%S.%L",
    "Seconds-Milliseconds": "%H:%M:%S.%L"
  },
  ui: {
    and: "and",
    back: "back",
    collapse: "click to collapse",
    error: "error",
    expand: "click to expand",
    including: "including",
    loading: "loading...",
    more: "{0} more",
    moreInfo: "click for more info",
    or: "or",
    noResults: "no results matching {0}.",
    primary: "primary connections",
    share: "share",
    total: "total",
    values: "values"
  },
  uppercase: ["CEO", "CEOs", "CFO", "CFOs", "CNC", "COO", "COOs", "CPU", "CPUs", "GDP", "HVAC", "ID", "IT", "R&D", "TV", "UI"],
  visualization: {
    bar: "Bar Chart",
    box: "Box Plot",
    bubbles: "Bubbles",
    chart: "Chart",
    geo_map: "Geo Map",
    line: "Line Plot",
    network: "Network",
    paths: "Paths",
    pie: "Pie Chart",
    rings: "Rings",
    scatter: "Scatter Plot",
    stacked: "Stacked Area",
    table: "Table",
    tree_map: "Tree Map"
  }
};


},{}],29:[function(require,module,exports){
module.exports = {
    "format": {
        "decimal": ",",
        "thousands": ".",
        "grouping": [3],
        "currency": ["", " €"],
        "dateTime": "%A, %e de %B de %Y, %X",
        "date": "%d/%m/%Y",
        "time": "%H:%M:%S",
        "periods": ["AM", "PM"],
        "days": ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
        "shortDays": ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
        "months": ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
        "shortMonths": ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]
    },
    "dev": {
        "accepted": "{0} no es un valor aceptado para {1}, por favor utilice uno de los siguientes: {2}.",
        "deprecated": "el método {0} ha sido eliminado, por favor, actualiza tu código para utilizar {1}.",
        "noChange": "{0} no se actualiza porque no cambió.",
        "noContainer": "no se puede encontrar un contenedor en la página correspondiente a {0}.",
        "of": "de",
        "oldStyle": "propiedades de estilo para {0} ahora se han incorporado directamente en. {1} ().",
        "sameEdge": "los vínculos no se pueden enlazar con si mismos. eliminando automáticamente el vínculo {0} que se autorreferencia.",
        "set": "{0} se ha establecido.",
        "setLong": "{0} ha sido establecido a {1}.",
        "setContainer": "defina un div contenedor utilizando .container ()"
    },
    "error": {
        "accepted": "{0} no es un {1} aceptado para visualizaciones de {2}, por favor utilice uno de los siguientes: {3}.",
        "connections": "no hay conexiones disponibles para {0}.",
        "data": "No hay datos disponibles",
        "dataYear": "no hay datos disponibles para {0}.",
        "lib": "{0} visualizaciones requieren cargar las siguientes librerías: {1}.",
        "libs": "{0} visualizaciones requieren cargar las siguientes librerías: {1}.",
        "method": "{0} visualizaciones requieren establecer el ​​método {1}.",
        "methods": "{0} visualizaciones requieren establecer los siguientes métodos: {1}."
    },
    "lowercase": [
        "una",
        "y",
        "en",
        "pero",
        "en",
        "de",
        "o",
        "el",
        "la",
        "los",
        "las",
        "para",
        "a",
        "con"
    ],
    "method": {
        "active": "segmentos activos",
        "color": "color",
        "depth": "profundidad",
        "dev": "detallado",
        "focus": "foco",
        "icon": "ícono",
        "id": "id",
        "height": "alto",
        "labels": "rótulo",
        "legend": "leyenda",
        "margin": "margen",
        "messages": "mensajes de estado",
        "mute": "ocultar",
        "order": "orden",
        "search": "búsqueda",
        "shape": "forma",
        "size": "tamaño",
        "solo": "aislar",
        "style": "estilo",
        "temp": "segmentos temporales",
        "text": "texto",
        "time": "tiempo",
        "timeline": "línea de tiempo",
        "total": "segmentos totales",
        "type": "tipo",
        "width": "anchura",
        "x": "eje x",
        "y": "eje Y",
        "zoom": "#ERROR!",
        "mode": "modo"
    },
    "time": [
        "fecha",
        "día",
        "mes",
        "hora",
        "año"
    ],
    "visualization": {
        "bubbles": "Burbujas",
        "chart": "Tabla",
        "geo_map": "Mapa Geo",
        "line": "Línea Solar",
        "network": "Red",
        "rings": "Anillos",
        "scatter": "Gráfico De Dispersión",
        "stacked": "Área Apilada",
        "tree_map": "Mapa de Árbol",
        "bar": "Gráfico De Barras",
        "box": "Diagrama de Cajas",
        "paths": "Caminos",
        "pie": "Gráfico de Pastel",
        "table": "Tabla"
    },
    "ui": {
        "and": "y",
        "back": "atrás",
        "collapse": "click para cerrar",
        "error": "error",
        "expand": "haga clic para ampliar",
        "loading": "Cargando ...",
        "more": "{0} más",
        "moreInfo": "clic para más información",
        "noResults": "no se encontraron resultados para {0}.",
        "primary": "relaciones principales",
        "share": "porcentaje",
        "total": "total",
        "values": "valores",
        "including": "Incluyendo",
        "or": "o"
    },
    "message": {
        "data": "analizando los datos",
        "draw": "visualizando",
        "initializing": "inicializando {0}",
        "loading": "cargando datos",
        "tooltipReset": "restableciendo las descripciones emergentes",
        "ui": "actualizando la interfaz de usuario"
    },
    "uppercase": [
        "CEO",
        "CEOs",
        "CFO",
        "CFOs",
        "CNC",
        "COO",
        "COOs",
        "CPU",
        "CPUs",
        "PIB",
        "HVAC",
        "ID",
        "TI",
        "I&D",
        "TV",
        "UI"
    ]
}

},{}],30:[function(require,module,exports){
module.exports = {
    "format": {
        "decimal": ",",
        "thousands": ".",
        "grouping": [3],
        "currency": ["", " €"],
        "dateTime": "%A, le %e %B %Y, %X",
        "date": "%d/%m/%Y",
        "time": "%H:%M:%S",
        "periods": ["AM", "PM"], // unused
        "days": ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
        "shortDays": ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
        "months": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
        "shortMonths": ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."]
    },
    "dev": {
        "accepted": "{0} n'est pas une option valide pour {1}, les valeurs possibles sont: {2}.",
        "deprecated": "{0} a été éliminé de la version courante, mettez à jour votre code source avec {1}.",
        "noChange": "{0} n'a pas été mis à jour car inchangé.",
        "noContainer": "impossible de trouver un contenant correspondant à {0}.",
        "of": "de",
        "oldStyle": "les propriétés de {0} ont été imbriquées dans .{1}().",
        "sameEdge": "un arc ne peut pas boucler sur lui même. L'auto-référence est automatiquement éliminée {0}.",
        "set": "{0} a été mis à jour.",
        "setLong": "{0} a été mis à jour à {1}.",
        "setContainer": "merci de choisir un div qui utilise .container()"
    },
    "error": {
        "accepted": "{0} n'est pas correct {1} pour {2} visualisations, merci d'utilisez une des options suivantes: {3}.",
        "connections": "Pas de connections disponibles pour {0}.",
        "data": "Pas de données disponibles",
        "dataYear": "Pas de données disponibles pour {0}.",
        "lib": "La visualisation de {0} nécessite le chargement de la librairie {1}.",
        "libs": "La visualisation de {0} nécessite le chargement des librairies {1}.",
        "method": "La visualisation du {0} exige la définition de {1}.",
        "methods": "La visualisation du {0} exige les définitions de {1}."
    },
    "lowercase": [
        "un",
        "une",
        "de",
        "des",
        "et",
        "mais",
        "les",
        "ou",
        "pour",
        "avec",
        "comme",
        "par",
        "vers",
        "si",
        "dans",
        "près",
        "ni",
        "dessus",
        "que",
        "le",
        "la",
        "via",
        "sinon",
        "alors"
    ],
    "method": {
        "active": "segments actifs",
        "color": "couleur",
        "depth": "profondeur",
        "dev": "verbeux",
        "focus": "focus",
        "icon": "ícone",
        "id": "id",
        "height": "hauteur",
        "labels": "labels",
        "legend": "légende",
        "margin": "marge",
        "messages": "messages",
        "mute": "cacher",
        "order": "ordre",
        "search": "recherche",
        "shape": "format",
        "size": "taille",
        "solo": "isoler",
        "style": "style",
        "temp": "segments temporaires",
        "text": "texte",
        "time": "temps",
        "timeline": "ligne temporelle",
        "total": "segments totaux",
        "type": "type",
        "width": "largeur",
        "x": "axe x",
        "y": "axe y",
        "zoom": "zoom",
        "mode": "mode"
    },
    "time": [
        "année",
        "date",
        "jour",
        "heure",
        "mois"
    ],
    "visualization": {
        "bubbles": "Bulles",
        "chart": "Graphique",
        "geo_map": "Carte",
        "line": "Courbes",
        "network": "Réseau",
        "rings": "Anneaux",
        "scatter": "Nuage de points",
        "stacked": "Aires empilées",
        "tree_map": "Arbre",
        "bar": "Diagramme en barres",
        "box": "Boîtes à Moustaches",
        "paths": "Chemins",
        "pie": "Camembert",
        "table": "Table"
    },
    "ui": {
        "and": "et",
        "back": "retour",
        "collapse": "clic pour réduire",
        "error": "erreur",
        "expand": "clic pour agrandir",
        "loading": "chargement ...",
        "more": "plus {0}",
        "moreInfo": "clic pour plus d'information",
        "noResults": "pas de résultat correspondant à {0}.",
        "primary": "connections primaires",
        "share": "part",
        "total": "total",
        "values": "valeurs",
        "including": "incluant",
        "or": "ou"
    },
    "message": {
        "data": "analyse des données",
        "draw": "tracé en cours",
        "initializing": "Initialisation {0}",
        "loading": "chargement",
        "tooltipReset": "réinitialisation des bulles",
        "ui": "rafraichissement de l'interface"
    },
    "uppercase": [
        "CEO",
        "CEOs",
        "CFO",
        "CFOs",
        "CNC",
        "COO",
        "COOs",
        "CPU",
        "CPUs",
        "PIB",
        "HVAC",
        "ID",
        "IT",
        "TV",
        "UI"
    ]
}

},{}],31:[function(require,module,exports){
module.exports = {
    "format": {
        "decimal": ",",
        "thousands": ".",
        "grouping": [3],
        "currency": ["", " ден."],
        "dateTime": "%A, %e %B %Y г. %X",
        "date": "%d.%m.%Y",
        "time": "%H:%M:%S",
        "periods": ["AM", "PM"],
        "days": ["недела", "понеделник", "вторник", "среда", "четврток", "петок", "сабота"],
        "shortDays": ["нед", "пон", "вто", "сре", "чет", "пет", "саб"],
        "months": ["јануари", "февруари", "март", "април", "мај", "јуни", "јули", "август", "септември", "октомври", "ноември", "декември"],
        "shortMonths": ["јан", "фев", "мар", "апр", "мај", "јун", "јул", "авг", "сеп", "окт", "ное", "дек"]
    },
    "dev": {
        "accepted": "{0} не е прифатенa вредноста за {1}, ве молиме користете еднa од следниве вредности: {2}.",
        "deprecated": "{0} метод е отстранета, ве молиме обновете го вашиот код за да се користи {1}.",
        "noChange": "{0} не е ажурирана, бидејќи немаше промени.",
        "noContainer": "не можe да се најде контејнер на страницата кој се совпаѓа со {0}.",
        "of": "на",
        "oldStyle": "својствата за стилот за {0} сега се вградени директно во. {1} ().",
        "sameEdge": "рабовите не може да имаат алка самите кон себе. автоматски ги отстранувам рабовите кои се само-референцираат {0}.",
        "set": "{0} е наместен.",
        "setLong": "{0} е поставен на {1}.",
        "setContainer": "Ве молиме дефинирајте контејнер div користејќи .container()"
    },
    "error": {
        "accepted": "{0} не е прифатлива за {1} {2} визуелизација, ве молиме користете една од следниве: {3}.",
        "connections": "не е достапна за врски {0}.",
        "data": "нема податоци",
        "dataYear": "Нема достапни податоци за {0}.",
        "lib": "{0} визуализации бараат вчитување на библиотеката {1} .",
        "libs": "{0} визуализации бараат вчитување следниве библиотеки: {1}.",
        "method": "{0} визуализации бара поставување на {1} методот.",
        "methods": "{0} визуализации бараат поставување на следниве методи: {1}."
    },
    "lowercase": [
        "a",
        "и",
        "во",
        "но",
        "на",
        "или",
        "да",
        "се",
        "со"
    ],
    "method": {
        "active": "активни сегменти",
        "color": "боја",
        "depth": "длабочина",
        "dev": "опширно",
        "focus": "фокус",
        "icon": "икона",
        "id": "id",
        "height": "висина",
        "labels": "етикети",
        "legend": "легенда",
        "margin": "маргина",
        "messages": "пораки за статусот",
        "mute": "скрие",
        "order": "цел",
        "search": "барај",
        "shape": "форма",
        "size": "големина",
        "solo": "изолирање",
        "style": "стил",
        "temp": "привремени сегменти",
        "text": "текст",
        "time": "време",
        "timeline": "времеплов",
        "total": "Вкупно сегменти",
        "type": "тип",
        "width": "ширина",
        "x": "x оската",
        "y": "оската y",
        "zoom": "зум",
        "mode": "режим"
    },
    "time": [
        "датум",
        "ден",
        "месец",
        "време",
        "година"
    ],
    "visualization": {
        "bubbles": "Меурчиња",
        "chart": "Шема",
        "geo_map": "Гео мапа",
        "line": "Линиски график",
        "network": "Мрежа",
        "rings": "Прстени",
        "scatter": "Распрскан график",
        "stacked": "Наредена површина",
        "tree_map": "Мапа во вид на дрво",
        "bar": "Бар табела",
        "box": "Кутија Парцел",
        "paths": "Патеки",
        "pie": "Пита графикон",
        "table": "Табела"
    },
    "ui": {
        "and": "и",
        "back": "назад",
        "collapse": "кликни за да се собере",
        "error": "грешка",
        "expand": "кликни за да се прошири",
        "loading": "Се вчитува ...",
        "more": "{0} повеќе",
        "moreInfo": "кликнете за повеќе информации",
        "noResults": "Не се пронајдени појавување на {0}.",
        "primary": "основно врски",
        "share": "удел",
        "total": "Вкупниот",
        "values": "вредности",
        "including": "Вклучувајќи",
        "or": "или"
    },
    "message": {
        "data": "анализа на податоци",
        "draw": "цртање на визуелизација",
        "initializing": "иницијализација {0}",
        "loading": "податоци за вчитување",
        "tooltipReset": "ресетирање на објаснувањата",
        "ui": "ажурирање на кориничкиот интерфејс"
    },
    "uppercase": [
        "CEO",
        "CEOs",
        "CFO",
        "CFOs",
        "CNC",
        "COO",
        "COOs",
        "CPU",
        "CPUs",
        "GDP",
        "HVAC",
        "ID",
        "IT",
        "R&D",
        "TV",
        "UI"
    ]
}

},{}],32:[function(require,module,exports){
module.exports = {
    "format": {
        "decimal": ",",
        "thousands": ".",
        "grouping": [3],
        "currency": ["R$", ""],
        "dateTime": "%A, %e de %B de %Y. %X",
        "date": "%d/%m/%Y",
        "time": "%H:%M:%S",
        "periods": ["AM", "PM"],
        "days": ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
        "shortDays": ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        "months": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        "shortMonths": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    },
    "dev": {
        "accepted": "{0} não é um valor válido para {1}, por favor use um dos seguintes procedimentos: {2}.",
        "deprecated": "{0} método foi removido, por favor atualize seu código para utilizar {1}.",
        "noChange": "{0} não foi atualizado porque ele não mudou.",
        "noContainer": "Não foi possível encontrar um local na página correspondente a {0}.",
        "of": "de",
        "oldStyle": "propriedades de estilo para {0} já foi incorporado diretamente no. {1} ().",
        "sameEdge": "bordas não podem vincular a si mesmos. removendo automaticamente borda de auto-referência {0}.",
        "set": "{0} foi definido.",
        "setLong": "{0} foi definida para {1}.",
        "setContainer": "por favor, defina um div utilizando .container()"
    },
    "error": {
        "accepted": "{0} não é um {1} reconhecido para visualizações {2}, favor usar um dos seguintes procedimentos: {3}.",
        "connections": "Não há conexões disponíveis para {0}.",
        "data": "Não há dados disponíveis",
        "dataYear": "Não há dados disponíveis para {0}.",
        "lib": "A visualização {0} necessita que seja carregado a biblioteca {1}.",
        "libs": "A visualização {0} necessita que seja carregado as bibliotecas {1}.",
        "method": "A visualização {0} exige a definição do método {1}.",
        "methods": "A visualização {0} exige a definição dos métodos {1}."
    },
    "lowercase": [
        "um",
        "uma",
        "e",
        "como",
        "em",
        "no",
        "na",
        "mas",
        "por",
        "para",
        "pelo",
        "pela",
        "de",
        "do",
        "da",
        "se",
        "perto",
        "nem",
        "ou",
        "que",
        "o",
        "a",
        "com",
        "v"
    ],
    "method": {
        "active": "segmentos activos",
        "color": "cor",
        "depth": "profundidade",
        "dev": "verboso",
        "focus": "foco",
        "icon": "ícone",
        "id": "identificador",
        "height": "altura",
        "labels": "etiquetas",
        "legend": "legenda",
        "margin": "margem",
        "messages": "mensagens de status",
        "mute": "ocultar",
        "order": "ordenar",
        "search": "pesquisar",
        "shape": "forma",
        "size": "tamanho",
        "solo": "isolar",
        "style": "estilo",
        "temp": "segmentos temporários",
        "text": "texto",
        "time": "tempo",
        "timeline": "linha do tempo",
        "total": "segmentos no total",
        "type": "tipo",
        "width": "largura",
        "x": "eixo x",
        "y": "eixo y",
        "zoom": "zoom",
        "mode": "modo"
    },
    "time": [
        "data",
        "dia",
        "mês",
        "hora",
        "ano"
    ],
    "visualization": {
        "bubbles": "Bolhas",
        "chart": "Gráfico",
        "geo_map": "Mapa",
        "line": "Gráfico de Linha",
        "network": "Rede",
        "rings": "Anéis",
        "scatter": "Dispersão",
        "stacked": "Evolução",
        "tree_map": "Tree Map",
        "bar": "Gráfico de Barras",
        "box": "Box Plot",
        "paths": "Caminhos",
        "pie": "Pie Chart",
        "table": "Tabela"
    },
    "ui": {
        "and": "e",
        "back": "voltar",
        "collapse": "Clique para fechar",
        "error": "erro",
        "expand": "clique para expandir",
        "loading": "carregando ...",
        "more": "mais {0}",
        "moreInfo": "Clique para mais informações",
        "noResults": "nenhum resultado para {0}.",
        "primary": "conexões primárias",
        "share": "participação",
        "total": "total",
        "values": "valores",
        "including": "Incluindo",
        "or": "ou"
    },
    "message": {
        "data": "analisando dados",
        "draw": "desenhando visualização",
        "initializing": "inicializando {0}",
        "loading": "carregando dados",
        "tooltipReset": "redefinindo as dicas",
        "ui": "atualizando interface"
    },
    "uppercase": [
        "CEO",
        "CEOs",
        "CFO",
        "CFOs",
        "CNC",
        "COO",
        "COOs",
        "CPU",
        "CPUs",
        "PIB",
        "HVAC",
        "ID",
        "TI",
        "P&D",
        "TV",
        "IU"
    ]
}

},{}],33:[function(require,module,exports){
module.exports = {
    "format": {
        "decimal": ",",
        "thousands": ".",
        "grouping": [3],
        "currency": ["€", ""],
        "dateTime": "%A, %e de %B de %Y. %X",
        "date": "%d/%m/%Y",
        "time": "%H:%M:%S",
        "periods": ["AM", "PM"],
        "days": ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
        "shortDays": ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"],
        "months": ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
        "shortMonths": ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    },
    "dev": {
        "accepted": "{0} não é um valor válido para {1}, por favor escolha uma das seguintes opções: {2}.",
        "deprecated": "o método {0} foi removido, por favor atualize o seu código para usar {1}.",
        "noChange": "{0} não foi atualizado porque não houve modificações.",
        "noContainer": "Não foi possível encontrar um elemento na página correspondente a {0}.",
        "of": "de",
        "oldStyle": "as propriedades de {0} já foram incluídas em .{1}().",
        "sameEdge": "bordas não podem vincular a si mesmos. removendo automaticamente borda de auto-referência {0}.",
        "set": "{0} foi definido.",
        "setLong": "{0} foi alterado para {1}.",
        "setContainer": "por favor indique um elemento div através do método .container()"
    },
    "error": {
        "accepted": "{0} não é uma {1} válida para a visualização {2}, por favor escolha uma das seguintes: {3}.",
        "connections": "não existem ligações disponíveis para {0}.",
        "data": "não existem dados disponíveis",
        "dataYear": "não existem dados disponíveis para {0}.",
        "lib": "a visualização {0} necessita que a biblioteca {1} seja carregada.",
        "libs": "a visualização {0} necessita que as seguintes bibliotecas sejam carregadas: {1}.",
        "method": "A visualização {0} exige a definição do método {1}.",
        "methods": "A visualização {0} exige a definição dos seguintes métodos {1}."
    },
    "lowercase": [
        "um",
        "uma",
        "e",
        "como",
        "em",
        "no",
        "na",
        "mas",
        "por",
        "para",
        "pelo",
        "pela",
        "de",
        "do",
        "da",
        "se",
        "perto",
        "nem",
        "ou",
        "que",
        "o",
        "a",
        "com",
        "v"
    ],
    "method": {
        "active": "segmentos activos",
        "color": "cor",
        "depth": "profundidade",
        "dev": "verboso",
        "focus": "foco",
        "icon": "ícone",
        "id": "identificador",
        "height": "altura",
        "labels": "etiquetas",
        "legend": "legenda",
        "margin": "margem",
        "messages": "estado",
        "order": "ordenar",
        "search": "pesquisar",
        "shape": "forma",
        "size": "tamanho",
        "style": "estilo",
        "temp": "segmentos temporários",
        "text": "texto",
        "time": "tempo",
        "timeline": "linha temporal",
        "total": "segmentos no total",
        "type": "tipo",
        "width": "largura",
        "x": "eixo dos xx",
        "y": "eixo dos yy",
        "zoom": "zoom",
        "mode": "#ERROR!",
        "mute": "ocultar",
        "solo": "isolar"
    },
    "time": [
        "data",
        "dia",
        "mês",
        "hora",
        "ano"
    ],
    "visualization": {
        "bubbles": "Bolhas",
        "chart": "Diagrama",
        "geo_map": "Mapa",
        "line": "Gráfico de Linha",
        "network": "Grafo",
        "rings": "Anéis",
        "scatter": "Gráfico de Dispersão",
        "stacked": "Gráfico de Área",
        "tree_map": "Tree Map",
        "bar": "Gráfico de Barras",
        "box": "Diagrama de Caixa e Bigodes",
        "paths": "Caminhos",
        "pie": "Gráfico de Setores",
        "table": "Tabela"
    },
    "ui": {
        "and": "e",
        "back": "voltar",
        "collapse": "Clique para colapsar",
        "error": "erro",
        "expand": "clique para expandir",
        "loading": "a carregar ...",
        "more": "mais {0}",
        "moreInfo": "Clique para mais informações",
        "noResults": "nenhum resultado para {0}.",
        "primary": "ligações principais",
        "share": "proporção",
        "total": "total",
        "values": "valores",
        "including": "Incluindo",
        "or": "ou"
    },
    "message": {
        "data": "a analisar os dados",
        "draw": "a desenhar a visualização",
        "initializing": "a inicializar {0}",
        "loading": "a carregar os dados",
        "tooltipReset": "a actualizar as caixas de informação",
        "ui": "a actualizar o interface"
    },
    "uppercase": [
        "CEO",
        "CEOs",
        "CFO",
        "CFOs",
        "CNC",
        "COO",
        "COOs",
        "CPU",
        "CPUs",
        "PIB",
        "HVAC",
        "ID",
        "TI",
        "I&D",
        "TV",
        "IU"
    ]
}

},{}],34:[function(require,module,exports){
module.exports = {
    "format": {
        "decimal": ",",
        "thousands": "\xa0",
        "grouping": [3],
        "currency": ["", " руб."],
        "dateTime": "%A, %e %B %Y г. %X",
        "date": "%d.%m.%Y",
        "time": "%H:%M:%S",
        "periods": ["AM", "PM"],
        "days": ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
        "shortDays": ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
        "months": ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
        "shortMonths": ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"]
    },
    "dev": {
        "accepted": "{0} не принимаются значение {1}, пожалуйста, используйте один из следующих: {2}.",
        "deprecated": "Метод {0} был удален, пожалуйста, обновите ваш код, чтобы использовать {1}.",
        "noChange": "{0} не обновлен, поскольку он не изменится.",
        "noContainer": "не могу найти контейнер на странице соответствия {0}.",
        "of": "из",
        "oldStyle": "свойства стиля для {0} уже в настоящее время были встроен непосредственно в. {1} ().",
        "sameEdge": "Края не может связать себя. автоматически удаляя автореферентных ребро {0}.",
        "set": "{0} был установлен.",
        "setLong": "{0} установлено значение {1}.",
        "setContainer": "пожалуйста, определить контейнер DIV с помощью .container ()"
    },
    "error": {
        "accepted": "{0} не принимаются {1} для {2} визуализации, пожалуйста, используйте один из следующих: {3}.",
        "connections": "нет соединения, доступные для {0}.",
        "data": "данные недоступны",
        "dataYear": "нет данных {0}.",
        "lib": "{0} визуализации требуют загрузки {1} библиотеку.",
        "libs": "{0} визуализации требуют загрузки следующих библиотек: {1}.",
        "method": "{0} визуализации требуют установки {1} метода.",
        "methods": "{0} визуализации требуют установки следующих методов: {1}."
    },
    "lowercase": [
        "и",
        "как",
        "в",
        "но",
        "для",
        "из",
        "если в",
        "в",
        "недалеко",
        "ни",
        "на",
        "на",
        "или",
        "в",
        "что",
        "к",
        "с",
        "с помощью",
        "против",
        "против"
    ],
    "method": {
        "active": "активные сегменты",
        "color": "цвет",
        "depth": "глубина",
        "dev": "многословный",
        "focus": "фокус",
        "icon": "значок",
        "id": "ID",
        "height": "высота",
        "labels": "надписи",
        "legend": "легенда",
        "margin": "поле",
        "messages": "Сообщения о состоянии",
        "mute": "скрывать",
        "order": "порядок",
        "search": "поиск",
        "shape": "форма",
        "size": "размер",
        "solo": "изолировать",
        "style": "стиль",
        "temp": "временные сегменты",
        "text": "текст",
        "time": "время",
        "timeline": "график",
        "total": "всего сегментов",
        "type": "тип",
        "width": "ширина",
        "x": "ось х",
        "y": "Ось Y",
        "zoom": "масштаб",
        "mode": "режим"
    },
    "time": [
        "дата",
        "день",
        "месяц",
        "время",
        "год"
    ],
    "visualization": {
        "bubbles": "Пузыри",
        "chart": "График",
        "geo_map": "Гео Карта",
        "line": "Линия земля",
        "network": "Сеть",
        "rings": "Кольца",
        "scatter": "Разброс земля",
        "stacked": "С накоплением Площадь",
        "tree_map": "Дерево Карта",
        "bar": "Гистограмма",
        "box": "Коробка земля",
        "paths": "Пути",
        "pie": "Круговая диаграмма",
        "table": "Стол"
    },
    "ui": {
        "and": "и",
        "back": "назад",
        "collapse": "Щелкните, чтобы свернуть",
        "error": "ошибка",
        "expand": "щелкните, чтобы развернуть",
        "loading": "загрузка ...",
        "more": "{0} более",
        "moreInfo": "нажмите для получения более подробной информации",
        "noResults": "нет результатов, соответствующих {0}.",
        "primary": "первичные соединения",
        "share": "доля",
        "total": "общее",
        "values": "значения",
        "including": "включая",
        "or": "или"
    },
    "message": {
        "data": "Анализируя данные",
        "draw": "рисунок визуализация",
        "initializing": "инициализации {0}",
        "loading": "загрузка данных",
        "tooltipReset": "сброс подсказки",
        "ui": "обновление пользовательского интерфейса"
    },
    "uppercase": [
        "ID"
    ]
}

},{}],35:[function(require,module,exports){
module.exports = {
    "format": {
        "decimal": ".",
        "thousands": ",",
        "grouping": [3],
        "currency": ["¥", ""],
        "dateTime": "%A %B %e %Y %X",
        "date": "%Y/%-m/%-d",
        "time": "%H:%M:%S",
        "periods": ["上午", "下午"],
        "days": ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
        "shortDays": ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
        "months": ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        "shortMonths": ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
    },
    "dev": {
        "accepted": "{0}不是{1}的可接受值, 请用下列之一的值:{2}",
        "deprecated": "{0}的方法已被移除, 请更新您的代码去使用{1}",
        "noChange": "{0}没有更新, 因为它并没有改变。",
        "noContainer": "无法在该页找到容器去匹配{0}",
        "of": "的",
        "oldStyle": "样式属性{0}现在已经直接嵌入到。{1}（）。",
        "sameEdge": "边缘不能链接到自己。自动去除自我参照边缘{0}。",
        "set": "{0}已经被设置。",
        "setLong": "{0}被设置为{1}。",
        "setContainer": "请使用()容器来定义div容器"
    },
    "error": {
        "accepted": "{0}对于{2}的可视化效果并不是一个可接受的{1}, 请使用如下的一个：{3}.",
        "connections": "没有对{0}可用的连接。",
        "data": "无可用数据",
        "dataYear": "没有数据对{0}可用。",
        "lib": "{0}的可视化要求装载{1}库。",
        "libs": "{0}的可视化需要加载以下库：{1}。",
        "method": "{0}的可视化要求设置{1}方法。",
        "methods": "{0}的可视化要求设置以下方法：{1}。"
    },
    "lowercase": [
        "一个",
        "和",
        "在",
        "但是",
        "在...里",
        "的",
        "或者",
        "这",
        "向",
        "与...一起"
    ],
    "method": {
        "active": "活跃段",
        "color": "颜色",
        "depth": "深度",
        "dev": "详细",
        "focus": "焦点",
        "icon": "图标",
        "id": "身份认证",
        "height": "高度",
        "labels": "标签",
        "legend": "图例注释",
        "margin": "外边距",
        "messages": "状态消息",
        "mute": "隐藏",
        "order": "规则",
        "search": "搜索",
        "shape": "形状",
        "size": "大小",
        "solo": "隔离",
        "style": "样式",
        "temp": "暂时性区段",
        "text": "文本",
        "time": "时间",
        "timeline": "时间轴",
        "total": "总段",
        "type": "类型",
        "width": "宽度",
        "x": "X轴",
        "y": "Y轴",
        "zoom": "缩放",
        "mode": "模式"
    },
    "time": [
        "日",
        "星期",
        "月",
        "时间",
        "年"
    ],
    "visualization": {
        "bubbles": "气泡",
        "chart": "图表",
        "geo_map": "地理地图",
        "line": "线图",
        "network": "网络",
        "rings": "特性",
        "scatter": "散点图",
        "stacked": "堆积面积图",
        "tree_map": "树图",
        "bar": "条图",
        "box": "箱线图",
        "paths": "路径",
        "pie": "饼图",
        "table": "表"
    },
    "ui": {
        "and": "和",
        "back": "后面",
        "collapse": "点击合并",
        "error": "错误",
        "expand": "单击以展开",
        "loading": "载入中...",
        "more": "{0}更多",
        "moreInfo": "点击了解更多信息",
        "noResults": "没有结果匹配{0}。",
        "primary": "主要连接",
        "share": "共享",
        "total": "总",
        "values": "值",
        "including": "包括",
        "or": "或"
    },
    "message": {
        "data": "分析数据",
        "draw": "绘制可视化",
        "initializing": "初始化{0}",
        "loading": "加载数据",
        "tooltipReset": "重置工具提示",
        "ui": "更新UI"
    },
    "uppercase": [
        "CEO",
        "CEOs",
        "CFO",
        "CFOs",
        "CNC",
        "COO",
        "COOs",
        "CPU",
        "CPUs",
        "GDP",
        "HVAC",
        "ID",
        "电视",
        "用户界面",
        "研发"
    ]
}

},{}],36:[function(require,module,exports){
module.exports = {
  en_US: require("./languages/en_US.coffee"),
  es_ES: require("./languages/es_ES.js"),
  fr_FR: require("./languages/fr_FR.js"),
  mk_MK: require("./languages/mk_MK.js"),
  pt_BR: require("./languages/pt_BR.js"),
  pt_PT: require("./languages/pt_PT.js"),
  ru_RU: require("./languages/ru_RU.js"),
  zh_CN: require("./languages/zh_CN.js")
};


},{"./languages/en_US.coffee":28,"./languages/es_ES.js":29,"./languages/fr_FR.js":30,"./languages/mk_MK.js":31,"./languages/pt_BR.js":32,"./languages/pt_PT.js":33,"./languages/ru_RU.js":34,"./languages/zh_CN.js":35}],37:[function(require,module,exports){
var checkObject, copy, createFunction, initialize, print, process, setMethod, stringFormat, validObject;

copy = require("../../util/copy.coffee");

print = require("../console/print.coffee");

process = require("./process/detect.coffee");

setMethod = require("./set.coffee");

stringFormat = require("../../string/format.js");

validObject = require("../../object/validate.coffee");

module.exports = function(vars, methods) {
  var method, obj, results;
  results = [];
  for (method in methods) {
    obj = methods[method];
    vars[method] = copy(obj);
    vars[method].initialized = initialize(vars, vars[method], method);
    results.push(vars.self[method] = createFunction(vars, method));
  }
  return results;
};

initialize = function(vars, obj, method, p) {
  var d, deps, i, len, o;
  obj.previous = false;
  obj.changed = false;
  obj.initialized = false;
  obj.callback = false;
  if ("init" in obj && (!("value" in obj))) {
    obj.value = obj.init(vars);
    delete obj.init;
  }
  if ("process" in obj) {
    obj.value = process(vars, obj, obj.value);
  }
  for (o in obj) {
    if (o === "deprecates") {
      deps = obj[o] instanceof Array ? obj[o] : [obj[o]];
      for (i = 0, len = deps.length; i < len; i++) {
        d = deps[i];
        vars.self[d] = (function(dep, n) {
          return function(x) {
            var doc, rec, str;
            str = vars.format.locale.value.dev.deprecated;
            dep = "." + dep + "()";
            rec = p ? "\"" + n + "\" in ." + p + "()" : "." + n + "()";
            doc = p || n;
            print.error(stringFormat(str, dep, rec), doc);
            return vars.self;
          };
        })(d, method);
      }
    } else if (o === "global") {
      if (!(method in vars)) {
        vars[method] = [];
      }
    } else if (o !== "value") {
      if (validObject(obj[o])) {
        initialize(vars, obj[o], o, method);
      }
    }
  }
  return true;
};

createFunction = function(vars, key) {
  return function(user, callback) {
    var accepted, checkFont, checkValue, fontAttr, fontAttrValue, s, starting, str;
    accepted = "accepted" in vars[key] ? vars[key].accepted : null;
    if (typeof accepted === "function") {
      accepted = accepted(vars);
    }
    if (!(accepted instanceof Array)) {
      accepted = [accepted];
    }
    if (user === Object) {
      return vars[key];
    } else if (!arguments.length && accepted.indexOf(void 0) < 0) {
      if ("value" in vars[key]) {
        return vars[key].value;
      } else {
        return vars[key];
      }
    }
    if (key === "style" && typeof user === "object") {
      str = vars.format.locale.value.dev.oldStyle;
      for (s in user) {
        print.warning(stringFormat(str, "\"" + s + "\"", s), s);
        vars.self[s](user[s]);
      }
    }
    if (key === "font") {
      if (typeof user === "string") {
        user = {
          family: user
        };
      }
      starting = true;
      checkValue = function(o, a, m, v) {
        if (validObject(o[m]) && a in o[m]) {
          if (validObject(o[m][a])) {
            if (o[m][a].process) {
              o[m][a].value = o[m][a].process(v);
            } else {
              o[m][a].value = v;
            }
          } else {
            o[m][a] = v;
          }
        }
      };
      checkFont = function(o, a, v) {
        var m;
        if (validObject(o)) {
          if (starting) {
            for (m in o) {
              checkValue(o, a, m, v);
            }
          } else if ("font" in o) {
            checkValue(o, a, "font", v);
          }
          starting = false;
          for (m in o) {
            checkFont(o[m], a, v);
          }
        }
      };
      for (fontAttr in user) {
        fontAttrValue = user[fontAttr];
        if (fontAttr !== "secondary") {
          if (validObject(fontAttrValue)) {
            fontAttrValue = fontAttrValue.value;
          }
          if (fontAttrValue) {
            checkFont(vars, fontAttr, fontAttrValue);
          }
        }
      }
    }
    checkObject(vars, key, vars, key, user);
    if (typeof callback === "function") {
      vars[key].callback = callback;
    }
    if (vars[key].chainable === false) {
      return vars[key].value;
    } else {
      return vars.self;
    }
  };
};

checkObject = function(vars, method, object, key, value) {
  var approvedObject, d, objectOnly, passingObject;
  if (["accepted", "changed", "initialized", "previous", "process"].indexOf(key) < 0) {
    passingObject = validObject(value);
    objectOnly = validObject(object[key]) && "objectAccess" in object[key] && object[key]["objectAccess"] === false;
    approvedObject = passingObject && (objectOnly || ((!("value" in value)) && ((!validObject(object[key])) || (!(d3.keys(value)[0] in object[key])))));
    if (value === null || !passingObject || approvedObject) {
      setMethod(vars, method, object, key, value);
    } else if (passingObject) {
      for (d in value) {
        checkObject(vars, method, object[key], d, value[d]);
      }
    }
  }
};


},{"../../object/validate.coffee":49,"../../string/format.js":50,"../../util/copy.coffee":81,"../console/print.coffee":21,"./process/detect.coffee":38,"./set.coffee":40}],38:[function(require,module,exports){
var copy, update;

copy = require("../../../util/copy.coffee");

update = require("../../../array/update.coffee");

module.exports = function(vars, object, value) {
  if (object.process === Array) {
    return update(copy(object.value), value);
  } else if (typeof object.process === "object" && typeof value === "string") {
    return object.process[value];
  } else if (typeof object.process === "function") {
    return object.process(value, vars, object);
  } else {
    return value;
  }
};


},{"../../../array/update.coffee":5,"../../../util/copy.coffee":81}],39:[function(require,module,exports){
var contains, format, list, print;

contains = require("../../array/contains.coffee");

format = require("../../string/format.js");

list = require("../../string/list.coffee");

print = require("../console/print.coffee");

module.exports = function(vars, accepted, value, method, text) {
  var a, allowed, app, i, len, recs, str, val;
  if (typeof accepted === "function") {
    accepted = accepted(vars);
  }
  if (!(accepted instanceof Array)) {
    accepted = [accepted];
  }
  allowed = contains(accepted, value);
  if (allowed === false && value !== void 0) {
    recs = [];
    val = JSON.stringify(value);
    if (typeof value !== "string") {
      val = "\"" + val + "\"";
    }
    for (i = 0, len = accepted.length; i < len; i++) {
      a = accepted[i];
      if (typeof a === "string") {
        recs.push("\"" + a + "\"");
      } else if (typeof a === "function") {
        recs.push(a.toString().split("()")[0].substring(9));
      } else if (a === void 0) {
        recs.push("undefined");
      } else {
        recs.push(JSON.stringify(a));
      }
    }
    recs = list(recs, vars.format.locale.value.ui.or);
    if (vars.type && ["mode", "shape"].indexOf(method) >= 0) {
      str = vars.format.locale.value.error.accepted;
      app = vars.format.locale.value.visualization[vars.type.value] || vars.type.value;
      print.warning(format(str, val, method, app, recs), method);
    } else {
      str = vars.format.locale.value.dev.accepted;
      print.warning(format(str, val, text, recs), method);
    }
  }
  return !allowed;
};


},{"../../array/contains.coffee":3,"../../string/format.js":50,"../../string/list.coffee":51,"../console/print.coffee":21}],40:[function(require,module,exports){
var copy, d3selection, mergeObject, print, process, rejected, stringFormat, updateArray, validObject;

copy = require("../../util/copy.coffee");

d3selection = require("../../util/d3selection.coffee");

validObject = require("../../object/validate.coffee");

mergeObject = require("../../object/merge.coffee");

print = require("../console/print.coffee");

process = require("./process/detect.coffee");

rejected = require("./rejected.coffee");

stringFormat = require("../../string/format.js");

updateArray = require("../../array/update.coffee");

module.exports = function(vars, method, object, key, value) {
  var accepted, c, callback, d3object, hasValue, id, k, longArray, n, parentKey, str, text, typeFunction, valString;
  if (key === "value" || !key || key === method) {
    text = "." + method + "()";
  } else {
    text = "\"" + key + "\" " + vars.format.locale.value.dev.of + " ." + method + "()";
  }
  if (key === "value" && "accepted" in object) {
    accepted = object.accepted;
  } else if (validObject(object[key]) && "accepted" in object[key]) {
    accepted = object[key].accepted;
  } else {
    accepted = [value];
  }
  if (!rejected(vars, accepted, value, method, text)) {
    if (validObject(object[key]) && "value" in object[key]) {
      parentKey = key;
      object = object[key];
      key = "value";
    }
    if (key === "value" && "process" in object) {
      value = process(vars, object, value);
    }
    if ((!(object[key] instanceof Array)) && object[key] === value && value !== void 0) {
      str = vars.format.locale.value.dev.noChange;
      if (vars.dev.value) {
        print.comment(stringFormat(str, text));
      }
    } else {
      object.changed = true;
      if (object.loaded) {
        object.loaded = false;
      }
      if ("history" in vars && method !== "draw") {
        c = copy(object);
        c.method = method;
        vars.history.chain.push(c);
      }
      object.previous = object[key];
      if ("id" in vars && key === "value" && "nesting" in object) {
        if (method !== "id") {
          if (typeof object.nesting !== "object") {
            object.nesting = {};
          }
          if (validObject(value)) {
            for (id in value) {
              if (typeof value[id] === "string") {
                value[id] = [value[id]];
              }
            }
            object.nesting = mergeObject(object.nesting, value);
            if (!(vars.id.value in object.nesting)) {
              object.nesting[vars.id.value] = value[d3.keys(value)[0]];
            }
          } else if (value instanceof Array) {
            object.nesting[vars.id.value] = value;
          } else {
            object.nesting[vars.id.value] = [value];
          }
          object[key] = object.nesting[vars.id.value][0];
        } else {
          if (value instanceof Array) {
            object.nesting = value;
            if ("depth" in vars && vars.depth.value < value.length) {
              object[key] = value[vars.depth.value];
            } else {
              object[key] = value[0];
              if ("depth" in vars) {
                vars.depth.value = 0;
              }
            }
          } else {
            object[key] = value;
            object.nesting = [value];
            if ("depth" in vars) {
              vars.depth.value = 0;
            }
          }
        }
      } else if (method === "depth") {
        if (value >= vars.id.nesting.length) {
          vars.depth.value = vars.id.nesting.length - 1;
        } else if (value < 0) {
          vars.depth.value = 0;
        } else {
          vars.depth.value = value;
        }
        vars.id.value = vars.id.nesting[vars.depth.value];
        if (typeof vars.text.nesting === "object") {
          n = vars.text.nesting[vars.id.value];
          if (n) {
            vars.text.nesting[vars.id.value] = typeof n === "string" ? [n] : n;
            vars.text.value = (n instanceof Array ? n[0] : n);
          }
        }
      } else if (validObject(object[key]) && validObject(value)) {
        object[key] = mergeObject(object[key], value);
      } else {
        object[key] = value;
      }
      if (key === "value" && object.global) {
        hasValue = object[key].length > 0;
        k = parentKey || key;
        if (k in vars && ((hasValue && vars.data[k].indexOf(method) < 0) || (!hasValue && vars.data[k].indexOf(method) >= 0))) {
          vars.data[k] = updateArray(vars.data[k], method);
        }
      }
      if (key === "value" && object.dataFilter && vars.data && vars.data.filters.indexOf(method) < 0) {
        vars.data.filters.push(method);
      }
      if (vars.dev.value && object.changed && object[key] !== void 0) {
        longArray = object[key] instanceof Array && object[key].length > 10;
        d3object = d3selection(object[key]);
        typeFunction = typeof object[key] === "function";
        valString = (!longArray && !d3object && !typeFunction ? (typeof object[key] === "string" ? object[key] : JSON.stringify(object[key])) : null);
        if (valString !== null && valString.length < 260) {
          str = vars.format.locale.value.dev.setLong;
          print.log(stringFormat(str, text, "\"" + valString + "\""));
        } else {
          str = vars.format.locale.value.dev.set;
          print.log(stringFormat(str, text));
        }
      }
    }
    if (key === "value" && object.callback && !object.url) {
      callback = typeof object.callback === "function" ? object.callback : object.callback.value;
      if (callback) {
        callback(value, vars.self);
      }
    }
  }
};


},{"../../array/update.coffee":5,"../../object/merge.coffee":48,"../../object/validate.coffee":49,"../../string/format.js":50,"../../util/copy.coffee":81,"../../util/d3selection.coffee":82,"../console/print.coffee":21,"./process/detect.coffee":38,"./rejected.coffee":39}],41:[function(require,module,exports){
var fontTester;

fontTester = require("../core/font/tester.coffee");

module.exports = function(words, style, opts) {
  var attr, getHeight, getWidth, sizes, spacing, tester, tspans;
  if (!opts) {
    opts = {};
  }
  style = style || {};
  tester = opts.parent || fontTester("svg").append("text");
  sizes = [];
  if (!(words instanceof Array)) {
    words = [words];
  }
  tspans = tester.selectAll("tspan").data(words);
  attr = {
    left: "0px",
    position: "absolute",
    top: "0px",
    x: 0,
    y: 0
  };
  spacing = 0;
  if ("letter-spacing" in style) {
    spacing = parseFloat(style["letter-spacing"]);
    delete style["letter-spacing"];
  }
  getWidth = function(elem) {
    var add;
    add = 0;
    if (spacing) {
      add = (elem.innerHTML.length - 1) * spacing;
    }
    return elem.getComputedTextLength() + add;
  };
  getHeight = function(elem) {
    return elem.offsetHeight || elem.getBoundingClientRect().height || elem.parentNode.getBBox().height;
  };
  tspans.enter().append("tspan").text(String).style(style).attr(attr).each(function(d) {
    if (typeof opts.mod === "function") {
      return opts.mod(this);
    }
  }).each(function(d) {
    var children, height, width;
    children = d3.select(this).selectAll("tspan");
    if (children.size()) {
      width = [];
      children.each(function() {
        return width.push(getWidth(this));
      });
      width = d3.max(width);
    } else {
      width = getWidth(this);
    }
    height = getHeight(this);
    return sizes.push({
      height: height,
      text: d,
      width: width
    });
  });
  tspans.remove();
  if (!opts.parent) {
    tester.remove();
  }
  return sizes;
};


},{"../core/font/tester.coffee":27}],42:[function(require,module,exports){
var fontTester, validate;

fontTester = require("../core/font/tester.coffee");

validate = function(fontList) {
  var completed, family, font, fontString, i, j, len, len1, monospace, proportional, testElement, testWidth, tester, valid;
  if (!(fontList instanceof Array)) {
    fontList = fontList.split(",");
  }
  for (i = 0, len = fontList.length; i < len; i++) {
    font = fontList[i];
    font.trim();
  }
  fontString = fontList.join(", ");
  completed = validate.complete;
  if (fontString in completed) {
    return completed[fontString];
  }
  testElement = function(font) {
    return tester.append("span").style("font-family", font).style("font-size", "32px").style("padding", "0px").style("margin", "0px").text("abcdefghiABCDEFGHI_!@#$%^&*()_+1234567890");
  };
  testWidth = function(font, control) {
    var elem, width1, width2;
    elem = testElement(font);
    width1 = elem.node().offsetWidth;
    width2 = control.node().offsetWidth;
    elem.remove();
    return width1 !== width2;
  };
  tester = fontTester("div");
  monospace = testElement("monospace");
  proportional = testElement("sans-serif");
  for (j = 0, len1 = fontList.length; j < len1; j++) {
    family = fontList[j];
    valid = testWidth(family + ",monospace", monospace);
    if (!valid) {
      valid = testWidth(family + ",sans-serif", proportional);
    }
    if (valid) {
      valid = family;
      break;
    }
  }
  if (!valid) {
    valid = "sans-serif";
  }
  monospace.remove();
  proportional.remove();
  completed[fontString] = valid;
  return valid;
};

validate.complete = {};

module.exports = validate;


},{"../core/font/tester.coffee":27}],43:[function(require,module,exports){
var intersectPoints, lineIntersection, pointInPoly, pointInSegmentBox, polyInsidePoly, rayIntersectsSegment, rotatePoint, rotatePoly, segmentsIntersect, simplify, squaredDist;

simplify = require("simplify-js");

module.exports = function(poly, options) {
  var aRatio, aRatios, angle, angleRad, angleStep, angles, area, aspectRatioStep, aspectRatios, bBox, boxHeight, boxWidth, centroid, events, height, i, insidePoly, j, k, l, left, len, len1, len2, len3, m, maxArea, maxAspectRatio, maxHeight, maxRect, maxWidth, maxx, maxy, minAspectRatio, minSqDistH, minSqDistW, minx, miny, modifOrigins, origOrigin, origin, origins, p, p1H, p1W, p2H, p2W, rectPoly, ref, ref1, ref2, ref3, ref4, ref5, ref6, ref7, ref8, right, rndPoint, rndX, rndY, tempPoly, tolerance, width, widthStep, x0, y0;
  if (poly.length < 3) {
    return null;
  }
  events = [];
  aspectRatioStep = 0.5;
  angleStep = 5;
  if (options == null) {
    options = {};
  }
  if (options.maxAspectRatio == null) {
    options.maxAspectRatio = 15;
  }
  if (options.minWidth == null) {
    options.minWidth = 0;
  }
  if (options.minHeight == null) {
    options.minHeight = 0;
  }
  if (options.tolerance == null) {
    options.tolerance = 0.02;
  }
  if (options.nTries == null) {
    options.nTries = 20;
  }
  if (options.angle != null) {
    if (options.angle instanceof Array) {
      angles = options.angle;
    } else if (typeof options.angle === 'number') {
      angles = [options.angle];
    } else if (typeof options.angle === 'string' && !isNaN(options.angle)) {
      angles = [Number(options.angle)];
    }
  }
  if (angles == null) {
    angles = d3.range(-90, 90 + angleStep, angleStep);
  }
  if (options.aspectRatio != null) {
    if (options.aspectRatio instanceof Array) {
      aspectRatios = options.aspectRatio;
    } else if (typeof options.aspectRatio === 'number') {
      aspectRatios = [options.aspectRatio];
    } else if (typeof options.aspectRatio === 'string' && !isNaN(options.aspectRatio)) {
      aspectRatios = [Number(options.aspectRatio)];
    }
  }
  if (options.origin != null) {
    if (options.origin instanceof Array) {
      if (options.origin[0] instanceof Array) {
        origins = options.origin;
      } else {
        origins = [options.origin];
      }
    }
  }
  area = Math.abs(d3.geom.polygon(poly).area());
  if (area === 0) {
    return null;
  }
  ref = d3.extent(poly, function(d) {
    return d[0];
  }), minx = ref[0], maxx = ref[1];
  ref1 = d3.extent(poly, function(d) {
    return d[1];
  }), miny = ref1[0], maxy = ref1[1];
  tolerance = Math.min(maxx - minx, maxy - miny) * options.tolerance;
  tempPoly = (function() {
    var j, len, results;
    results = [];
    for (j = 0, len = poly.length; j < len; j++) {
      p = poly[j];
      results.push({
        x: p[0],
        y: p[1]
      });
    }
    return results;
  })();
  if (tolerance > 0) {
    tempPoly = simplify(tempPoly, tolerance);
    poly = (function() {
      var j, len, results;
      results = [];
      for (j = 0, len = tempPoly.length; j < len; j++) {
        p = tempPoly[j];
        results.push([p.x, p.y]);
      }
      return results;
    })();
  }
  if (options.vdebug) {
    events.push({
      type: 'simplify',
      poly: poly
    });
  }
  ref2 = d3.extent(poly, function(d) {
    return d[0];
  }), minx = ref2[0], maxx = ref2[1];
  ref3 = d3.extent(poly, function(d) {
    return d[1];
  }), miny = ref3[0], maxy = ref3[1];
  bBox = [[minx, miny], [maxx, miny], [maxx, maxy], [minx, maxy]];
  ref4 = [maxx - minx, maxy - miny], boxWidth = ref4[0], boxHeight = ref4[1];
  widthStep = Math.min(boxWidth, boxHeight) / 50;
  if (origins == null) {
    origins = [];
    centroid = d3.geom.polygon(poly).centroid();
    if (pointInPoly(centroid, poly)) {
      origins.push(centroid);
    }
    while (origins.length < options.nTries) {
      rndX = Math.random() * boxWidth + minx;
      rndY = Math.random() * boxHeight + miny;
      rndPoint = [rndX, rndY];
      if (pointInPoly(rndPoint, poly)) {
        origins.push(rndPoint);
      }
    }
  }
  if (options.vdebug) {
    events.push({
      type: 'origins',
      points: origins
    });
  }
  maxArea = 0;
  maxRect = null;
  for (j = 0, len = angles.length; j < len; j++) {
    angle = angles[j];
    angleRad = -angle * Math.PI / 180;
    if (options.vdebug) {
      events.push({
        type: 'angle',
        angle: angle
      });
    }
    for (i = k = 0, len1 = origins.length; k < len1; i = ++k) {
      origOrigin = origins[i];
      ref5 = intersectPoints(poly, origOrigin, angleRad), p1W = ref5[0], p2W = ref5[1];
      ref6 = intersectPoints(poly, origOrigin, angleRad + Math.PI / 2), p1H = ref6[0], p2H = ref6[1];
      modifOrigins = [];
      if ((p1W != null) && (p2W != null)) {
        modifOrigins.push([(p1W[0] + p2W[0]) / 2, (p1W[1] + p2W[1]) / 2]);
      }
      if ((p1H != null) && (p2H != null)) {
        modifOrigins.push([(p1H[0] + p2H[0]) / 2, (p1H[1] + p2H[1]) / 2]);
      }
      if (options.vdebug) {
        events.push({
          type: 'modifOrigin',
          idx: i,
          p1W: p1W,
          p2W: p2W,
          p1H: p1H,
          p2H: p2H,
          modifOrigins: modifOrigins
        });
      }
      for (l = 0, len2 = modifOrigins.length; l < len2; l++) {
        origin = modifOrigins[l];
        if (options.vdebug) {
          events.push({
            type: 'origin',
            cx: origin[0],
            cy: origin[1]
          });
        }
        ref7 = intersectPoints(poly, origin, angleRad), p1W = ref7[0], p2W = ref7[1];
        if (p1W === null || p2W === null) {
          continue;
        }
        minSqDistW = Math.min(squaredDist(origin, p1W), squaredDist(origin, p2W));
        maxWidth = 2 * Math.sqrt(minSqDistW);
        ref8 = intersectPoints(poly, origin, angleRad + Math.PI / 2), p1H = ref8[0], p2H = ref8[1];
        if (p1H === null || p2H === null) {
          continue;
        }
        minSqDistH = Math.min(squaredDist(origin, p1H), squaredDist(origin, p2H));
        maxHeight = 2 * Math.sqrt(minSqDistH);
        if (maxWidth * maxHeight < maxArea) {
          continue;
        }
        if (aspectRatios != null) {
          aRatios = aspectRatios;
        } else {
          minAspectRatio = Math.max(1, options.minWidth / maxHeight, maxArea / (maxHeight * maxHeight));
          maxAspectRatio = Math.min(options.maxAspectRatio, maxWidth / options.minHeight, (maxWidth * maxWidth) / maxArea);
          aRatios = d3.range(minAspectRatio, maxAspectRatio + aspectRatioStep, aspectRatioStep);
        }
        for (m = 0, len3 = aRatios.length; m < len3; m++) {
          aRatio = aRatios[m];
          left = Math.max(options.minWidth, Math.sqrt(maxArea * aRatio));
          right = Math.min(maxWidth, maxHeight * aRatio);
          if (right * maxHeight < maxArea) {
            continue;
          }
          if ((right - left) >= widthStep) {
            if (options.vdebug) {
              events.push({
                type: 'aRatio',
                aRatio: aRatio
              });
            }
          }
          while ((right - left) >= widthStep) {
            width = (left + right) / 2;
            height = width / aRatio;
            x0 = origin[0], y0 = origin[1];
            rectPoly = [[x0 - width / 2, y0 - height / 2], [x0 + width / 2, y0 - height / 2], [x0 + width / 2, y0 + height / 2], [x0 - width / 2, y0 + height / 2]];
            rectPoly = rotatePoly(rectPoly, angleRad, origin);
            if (polyInsidePoly(rectPoly, poly)) {
              insidePoly = true;
              maxArea = width * height;
              maxRect = {
                cx: x0,
                cy: y0,
                width: width,
                height: height,
                angle: angle
              };
              left = width;
            } else {
              insidePoly = false;
              right = width;
            }
            if (options.vdebug) {
              events.push({
                type: 'rectangle',
                cx: x0,
                cy: y0,
                width: width,
                height: height,
                areaFraction: (width * height) / area,
                angle: angle,
                insidePoly: insidePoly
              });
            }
          }
        }
      }
    }
  }
  return [maxRect, maxArea, events];
};

squaredDist = function(a, b) {
  var deltax, deltay;
  deltax = b[0] - a[0];
  deltay = b[1] - a[1];
  return deltax * deltax + deltay * deltay;
};

rayIntersectsSegment = function(p, p1, p2) {
  var a, b, mAB, mAP, ref;
  ref = p1[1] < p2[1] ? [p1, p2] : [p2, p1], a = ref[0], b = ref[1];
  if (p[1] === b[1] || p[1] === a[1]) {
    p[1] += Number.MIN_VALUE;
  }
  if (p[1] > b[1] || p[1] < a[1]) {
    return false;
  } else if (p[0] > a[0] && p[0] > b[0]) {
    return false;
  } else if (p[0] < a[0] && p[0] < b[0]) {
    return true;
  } else {
    mAB = (b[1] - a[1]) / (b[0] - a[0]);
    mAP = (p[1] - a[1]) / (p[0] - a[0]);
    return mAP > mAB;
  }
};

pointInPoly = function(p, poly) {
  var a, b, c, i, n;
  i = -1;
  n = poly.length;
  b = poly[n - 1];
  c = 0;
  while (++i < n) {
    a = b;
    b = poly[i];
    if (rayIntersectsSegment(p, a, b)) {
      c++;
    }
  }
  return c % 2 !== 0;
};

pointInSegmentBox = function(p, p1, q1) {
  var eps, px, py;
  eps = 1e-9;
  px = p[0], py = p[1];
  if (px < Math.min(p1[0], q1[0]) - eps || px > Math.max(p1[0], q1[0]) + eps || py < Math.min(p1[1], q1[1]) - eps || py > Math.max(p1[1], q1[1]) + eps) {
    return false;
  }
  return true;
};

lineIntersection = function(p1, q1, p2, q2) {
  var cross1, cross2, denom, dx1, dx2, dy1, dy2, eps, px, py;
  eps = 1e-9;
  dx1 = p1[0] - q1[0];
  dy1 = p1[1] - q1[1];
  dx2 = p2[0] - q2[0];
  dy2 = p2[1] - q2[1];
  denom = dx1 * dy2 - dy1 * dx2;
  if (Math.abs(denom) < eps) {
    return null;
  }
  cross1 = p1[0] * q1[1] - p1[1] * q1[0];
  cross2 = p2[0] * q2[1] - p2[1] * q2[0];
  px = (cross1 * dx2 - cross2 * dx1) / denom;
  py = (cross1 * dy2 - cross2 * dy1) / denom;
  return [px, py];
};

segmentsIntersect = function(p1, q1, p2, q2) {
  var p;
  p = lineIntersection(p1, q1, p2, q2);
  if (p == null) {
    return false;
  }
  return pointInSegmentBox(p, p1, q1) && pointInSegmentBox(p, p2, q2);
};

polyInsidePoly = function(polyA, polyB) {
  var aA, aB, bA, bB, iA, iB, nA, nB;
  iA = -1;
  nA = polyA.length;
  nB = polyB.length;
  bA = polyA[nA - 1];
  while (++iA < nA) {
    aA = bA;
    bA = polyA[iA];
    iB = -1;
    bB = polyB[nB - 1];
    while (++iB < nB) {
      aB = bB;
      bB = polyB[iB];
      if (segmentsIntersect(aA, bA, aB, bB)) {
        return false;
      }
    }
  }
  return pointInPoly(polyA[0], polyB);
};

rotatePoint = function(p, alpha, origin) {
  var cosAlpha, sinAlpha, xshifted, yshifted;
  if (origin == null) {
    origin = [0, 0];
  }
  xshifted = p[0] - origin[0];
  yshifted = p[1] - origin[1];
  cosAlpha = Math.cos(alpha);
  sinAlpha = Math.sin(alpha);
  return [cosAlpha * xshifted - sinAlpha * yshifted + origin[0], sinAlpha * xshifted + cosAlpha * yshifted + origin[1]];
};

rotatePoly = function(poly, alpha, origin) {
  var j, len, point, results;
  results = [];
  for (j = 0, len = poly.length; j < len; j++) {
    point = poly[j];
    results.push(rotatePoint(point, alpha, origin));
  }
  return results;
};

intersectPoints = function(poly, origin, alpha) {
  var a, b, closestPointLeft, closestPointRight, eps, i, idx, minSqDistLeft, minSqDistRight, n, p, shiftedOrigin, sqDist, x0, y0;
  eps = 1e-9;
  origin = [origin[0] + eps * Math.cos(alpha), origin[1] + eps * Math.sin(alpha)];
  x0 = origin[0], y0 = origin[1];
  shiftedOrigin = [x0 + Math.cos(alpha), y0 + Math.sin(alpha)];
  idx = 0;
  if (Math.abs(shiftedOrigin[0] - x0) < eps) {
    idx = 1;
  }
  i = -1;
  n = poly.length;
  b = poly[n - 1];
  minSqDistLeft = Number.MAX_VALUE;
  minSqDistRight = Number.MAX_VALUE;
  closestPointLeft = null;
  closestPointRight = null;
  while (++i < n) {
    a = b;
    b = poly[i];
    p = lineIntersection(origin, shiftedOrigin, a, b);
    if ((p != null) && pointInSegmentBox(p, a, b)) {
      sqDist = squaredDist(origin, p);
      if (p[idx] < origin[idx]) {
        if (sqDist < minSqDistLeft) {
          minSqDistLeft = sqDist;
          closestPointLeft = p;
        }
      } else if (p[idx] > origin[idx]) {
        if (sqDist < minSqDistRight) {
          minSqDistRight = sqDist;
          closestPointRight = p;
        }
      }
    }
  }
  return [closestPointLeft, closestPointRight];
};


},{"simplify-js":1}],44:[function(require,module,exports){
module.exports = function(radians, distance, shape) {
  var adjacentLegLength, coords, diagonal, oppositeLegLength;
  coords = {
    x: 0,
    y: 0
  };
  if (radians < 0) {
    radians = Math.PI * 2 + radians;
  }
  if (shape === "square") {
    diagonal = 45 * (Math.PI / 180);
    if (radians <= Math.PI) {
      if (radians < (Math.PI / 2)) {
        if (radians < diagonal) {
          coords.x += distance;
          oppositeLegLength = Math.tan(radians) * distance;
          coords.y += oppositeLegLength;
        } else {
          coords.y += distance;
          adjacentLegLength = distance / Math.tan(radians);
          coords.x += adjacentLegLength;
        }
      } else {
        if (radians < (Math.PI - diagonal)) {
          coords.y += distance;
          adjacentLegLength = distance / Math.tan(Math.PI - radians);
          coords.x -= adjacentLegLength;
        } else {
          coords.x -= distance;
          oppositeLegLength = Math.tan(Math.PI - radians) * distance;
          coords.y += oppositeLegLength;
        }
      }
    } else {
      if (radians < (3 * Math.PI / 2)) {
        if (radians < (diagonal + Math.PI)) {
          coords.x -= distance;
          oppositeLegLength = Math.tan(radians - Math.PI) * distance;
          coords.y -= oppositeLegLength;
        } else {
          coords.y -= distance;
          adjacentLegLength = distance / Math.tan(radians - Math.PI);
          coords.x -= adjacentLegLength;
        }
      } else {
        if (radians < (2 * Math.PI - diagonal)) {
          coords.y -= distance;
          adjacentLegLength = distance / Math.tan(2 * Math.PI - radians);
          coords.x += adjacentLegLength;
        } else {
          coords.x += distance;
          oppositeLegLength = Math.tan(2 * Math.PI - radians) * distance;
          coords.y -= oppositeLegLength;
        }
      }
    }
  } else {
    coords.x += distance * Math.cos(radians);
    coords.y += distance * Math.sin(radians);
  }
  return coords;
};


},{}],45:[function(require,module,exports){
var offset;

offset = require("../geom/offset.coffee");

module.exports = function(path) {
  var angle, i, j, last, len, length, o, obtuse, p, poly, prev, radius, segments, start, step, width;
  if (!path) {
    return [];
  }
  path = path.slice(1).slice(0, -1).split(/L|A/);
  poly = [];
  for (j = 0, len = path.length; j < len; j++) {
    p = path[j];
    p = p.split(" ");
    if (p.length === 1) {
      poly.push(p[0].split(",").map(function(d) {
        return parseFloat(d);
      }));
    } else {
      prev = poly[poly.length - 1];
      last = p.pop().split(",").map(function(d) {
        return parseFloat(d);
      });
      radius = parseFloat(p.shift().split(",")[0]);
      width = Math.sqrt(Math.pow(last[0] - prev[0], 2) + Math.pow(last[1] - prev[1], 2));
      angle = Math.acos((radius * radius + radius * radius - width * width) / (2 * radius * radius));
      obtuse = p[1].split(",")[0] === "1";
      if (obtuse) {
        angle = Math.PI * 2 - angle;
      }
      length = angle / (Math.PI * 2) * (radius * Math.PI * 2);
      segments = length / 5;
      start = Math.atan2(-prev[1], -prev[0]) - Math.PI;
      step = angle / segments;
      i = step;
      while (i < angle) {
        o = offset(start + i, radius);
        poly.push([o.x, o.y]);
        i += step;
      }
      poly.push(last);
    }
  }
  return poly;
};


},{"../geom/offset.coffee":44}],46:[function(require,module,exports){

/**
 * @class d3plus
 */
var d3plus, message, stylesheet;

d3plus = {};

if (typeof window !== "undefined") {
  window.d3plus = d3plus;
}

module.exports = d3plus;


/**
 * The current version of **D3plus** you are using. Returns a string in
 * [semantic versioning](http://semver.org/) format.
 * @property d3plus.version
 * @for d3plus
 * @type String
 * @static
 */

d3plus.version = "1.8.1 - Cerulean (pre-release)";


/**
 * The URL for the repo, used internally for certain error messages.
 * @property d3plus.repo
 * @for d3plus
 * @type String
 * @static
 */

d3plus.repo = "https://github.com/alexandersimoes/d3plus/";


/**
 * Utilities related to modifying arrays.
 * @class d3plus.array
 * @for d3plus
 * @static
 */

d3plus.array = {
  comparator: require("./array/comparator.coffee"),
  contains: require("./array/contains.coffee"),
  sort: require("./array/sort.coffee"),
  update: require("./array/update.coffee")
};


/**
 * Utilities related to the client's browser.
 * @class d3plus.client
 * @for d3plus
 * @static
 */

d3plus.client = {
  css: require("./client/css.coffee"),
  ie: require("./client/ie.js"),
  pointer: require("./client/pointer.coffee"),
  prefix: require("./client/prefix.coffee"),
  rtl: require("./client/rtl.coffee"),
  scrollbar: require("./client/scrollbar.coffee"),
  touch: require("./client/touch.coffee")
};


/**
 * Utilities related to color manipulation.
 * @class d3plus.color
 * @for d3plus
 * @static
 */

d3plus.color = {
  legible: require("./color/legible.coffee"),
  lighter: require("./color/lighter.coffee"),
  mix: require("./color/mix.coffee"),
  random: require("./color/random.coffee"),
  scale: require("./color/scale.coffee"),
  sort: require("./color/sort.coffee"),
  text: require("./color/text.coffee"),
  validate: require("./color/validate.coffee")
};


/**
 * Utilities related to fonts.
 * @class d3plus.font
 * @for d3plus
 * @static
 */

d3plus.font = {
  sizes: require("./font/sizes.coffee"),
  validate: require("./font/validate.coffee")
};


/**
 * Utilities related to geometric algorithms.
 * @class d3plus.geom
 * @for d3plus
 * @static
 */

d3plus.geom = {
  largestRect: require("./geom/largestRect.coffee"),
  offset: require("./geom/offset.coffee"),
  path2poly: require("./geom/path2poly.coffee")
};


/**
 * Utilities that process numbers.
 * @class d3plus.number
 * @for d3plus
 * @static
 */

d3plus.number = {
  format: require("./number/format.coffee")
};


/**
 * D3plus features a set of methods that relate to various object properties. These methods may be used outside of the normal constraints of the visualizations.
 * @class d3plus.object
 * @for d3plus
 * @static
 */

d3plus.object = {
  merge: require("./object/merge.coffee"),
  validate: require("./object/validate.coffee")
};


/**
 * Utilities that process strings.
 * @class d3plus.string
 * @for d3plus
 * @static
 */

d3plus.string = {
  format: require("./string/format.js"),
  list: require("./string/list.coffee"),
  strip: require("./string/strip.js"),
  title: require("./string/title.coffee")
};


/**
 * D3plus SVG Textwrapping
 * @class d3plus.textwrap
 * @for d3plus
 */

d3plus.textwrap = require("./textwrap/textwrap.coffee");


/**
 * D3plus features Utilities that can be used to help with some common javascript processes.
 * @class d3plus.util
 * @for d3plus
 * @static
 */

d3plus.util = {
  buckets: require("./util/buckets.coffee"),
  child: require("./util/child.coffee"),
  closest: require("./util/closest.coffee"),
  copy: require("./util/copy.coffee"),
  d3selection: require("./util/d3selection.coffee"),
  dataurl: require("./util/dataURL.coffee"),
  uniques: require("./util/uniques.coffee")
};

stylesheet = require("./client/css.coffee");

message = require("./core/console/print.coffee");

if (stylesheet("d3plus.css")) {
  message.warning("d3plus.css has been deprecated, you do not need to load this file.", d3plus.repo + "releases/tag/v1.4.0");
}


},{"./array/comparator.coffee":2,"./array/contains.coffee":3,"./array/sort.coffee":4,"./array/update.coffee":5,"./client/css.coffee":6,"./client/ie.js":7,"./client/pointer.coffee":8,"./client/prefix.coffee":9,"./client/rtl.coffee":10,"./client/scrollbar.coffee":11,"./client/touch.coffee":12,"./color/legible.coffee":13,"./color/lighter.coffee":14,"./color/mix.coffee":15,"./color/random.coffee":16,"./color/scale.coffee":17,"./color/sort.coffee":18,"./color/text.coffee":19,"./color/validate.coffee":20,"./core/console/print.coffee":21,"./font/sizes.coffee":41,"./font/validate.coffee":42,"./geom/largestRect.coffee":43,"./geom/offset.coffee":44,"./geom/path2poly.coffee":45,"./number/format.coffee":47,"./object/merge.coffee":48,"./object/validate.coffee":49,"./string/format.js":50,"./string/list.coffee":51,"./string/strip.js":52,"./string/title.coffee":53,"./textwrap/textwrap.coffee":77,"./util/buckets.coffee":78,"./util/child.coffee":79,"./util/closest.coffee":80,"./util/copy.coffee":81,"./util/d3selection.coffee":82,"./util/dataURL.coffee":83,"./util/uniques.coffee":84}],47:[function(require,module,exports){
var defaultLocale;

defaultLocale = require("../core/locale/languages/en_US.coffee");

module.exports = function(number, opts) {
  var affixes, format, key, labels, length, locale, ret, sigs, symbol, time, vars, zeros;
  if (!opts) {
    opts = {};
  }
  if ("locale" in opts) {
    locale = opts.locale;
  } else {
    locale = defaultLocale;
  }
  time = locale.time.slice();
  format = d3.locale(locale.format);
  if (!opts) {
    opts = {};
  }
  vars = opts.vars || {};
  key = opts.key;
  labels = "labels" in opts ? opts.labels : true;
  length = number.toString().split(".")[0].length;
  if (vars.time && vars.time.value) {
    time.push(vars.time.value);
  }
  if (typeof key === "string" && time.indexOf(key.toLowerCase()) >= 0) {
    ret = number;
  } else if (key === "share") {
    if (number === 0) {
      ret = 0;
    } else if (number >= 100) {
      ret = format.numberFormat(",f")(number);
    } else if (number > 99) {
      ret = format.numberFormat(".3g")(number);
    } else {
      ret = format.numberFormat(".2g")(number);
    }
    ret += "%";
  } else if (number < 10 && number > -10) {
    length = number.toString().split(".");
    sigs = 1;
    if (length.length > 1) {
      sigs = d3.min([parseFloat(length[1]).toString().length, 2]);
      if (!((-1 < number && number < 1))) {
        zeros = length[1].length - parseFloat(length[1]).toString().length;
        sigs += 1 + zeros;
      }
    }
    ret = format.numberFormat("." + sigs + "g")(number);
  } else if (length > 3) {
    symbol = d3.formatPrefix(number).symbol;
    symbol = symbol.replace("G", "B");
    number = d3.formatPrefix(number).scale(number);
    number = format.numberFormat(".3g")(number);
    number = number.replace(locale.format.decimal, ".");
    number = parseFloat(number) + "";
    number = number.replace(".", locale.format.decimal);
    ret = number + symbol;
  } else if (length === 3) {
    ret = format.numberFormat(",f")(number);
  } else if (number === 0) {
    ret = 0;
  } else {
    if (number === parseInt(number, 10)) {
      ret = format.numberFormat(".2")(number);
    } else {
      ret = format.numberFormat(".3g")(number);
    }
  }
  if (labels && key && "format" in vars && key in vars.format.affixes.value) {
    affixes = vars.format.affixes.value[key];
    return affixes[0] + ret + affixes[1];
  } else {
    return ret;
  }
};


},{"../core/locale/languages/en_US.coffee":28}],48:[function(require,module,exports){
var d3selection, validate;

d3selection = require("../util/d3selection.coffee");

validate = require("./validate.coffee");


/**
 * Given any two objects, this method will merge the two objects together, returning a new third object. The values of the second object always overwrite the first.
 * @method d3plus.object.merge
 * @for d3plus.object
 * @param obj1 {Object} The primary object.
 * @param obj2 {Object} The secondary object to merge into the first.
 * @return {Object}
 */

module.exports = function(obj1, obj2) {
  var copyObject, obj3;
  copyObject = function(obj, ret, shallow) {
    var k, results, v;
    results = [];
    for (k in obj) {
      v = obj[k];
      if (typeof v !== "undefined") {
        if (!shallow && validate(v)) {
          if (typeof ret[k] !== "object") {
            ret[k] = {};
          }
          results.push(copyObject(v, ret[k], k.indexOf("d3plus") === 0));
        } else if (!d3selection(v) && v instanceof Array) {
          results.push(ret[k] = v.slice(0));
        } else {
          results.push(ret[k] = v);
        }
      } else {
        results.push(void 0);
      }
    }
    return results;
  };
  obj3 = {};
  if (obj1) {
    copyObject(obj1, obj3);
  }
  if (obj2) {
    copyObject(obj2, obj3);
  }
  return obj3;
};


},{"../util/d3selection.coffee":82,"./validate.coffee":49}],49:[function(require,module,exports){

/**
 * This function returns true if the variable passed is a literal javascript keyed Object. It's a small, simple function, but it catches some edge-cases that can throw off your code (such as Arrays and `null`).
 * @method d3plus.object.validate
 * @for d3plus.object
 * @param obj {Object} The object to validate.
 * @return {Boolean}
 */
module.exports = function(obj) {
  return obj && obj.constructor === Object;
};


},{}],50:[function(require,module,exports){
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Formats a string similar to Python's "format"
//------------------------------------------------------------------------------
module.exports = function() {

  var args = Array.prototype.slice.call(arguments)
    , str = args.shift()

  str.unkeyed_index = 0;
  return str.replace(/\{(\w*)\}/g, function(match, key) {
      if (key === '') {
          key = str.unkeyed_index;
          str.unkeyed_index++
      }
      if (key == +key) {
          return args[key] !== 'undefined'
              ? args[key]
              : match;
      } else {
          for (var i = 0; i < args.length; i++) {
              if (typeof args[i] === 'object' && typeof args[i][key] !== 'undefined') {
                  return args[i][key];
              }
          }
          return match;
      }
  }.bind(str));

}

},{}],51:[function(require,module,exports){
var format, locale;

format = require("./format.js");

locale = require("../core/locale/languages/en_US.coffee").ui;

module.exports = function(list, andText, max, moreText) {
  var amount;
  if (!(list instanceof Array)) {
    return list;
  } else {
    list = list.slice(0);
  }
  if (!andText) {
    andText = locale.and;
  }
  if (!moreText) {
    moreText = locale.moreText;
  }
  if (list.length === 2) {
    return list.join(" " + andText + " ");
  } else {
    if (max && list.length > max) {
      amount = list.length - max + 1;
      list = list.slice(0, max - 1);
      list[max - 1] = format(moreText, amount);
    }
    if (list.length > 1) {
      list[list.length - 1] = andText + " " + list[list.length - 1];
    }
    return list.join(", ");
  }
};


},{"../core/locale/languages/en_US.coffee":28,"./format.js":50}],52:[function(require,module,exports){
//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Removes all non ASCII characters
//------------------------------------------------------------------------------
module.exports = function(str) {

  var removed = [ "!","@","#","$","%","^","&","*","(",")",
                  "[","]","{","}",".",",","/","\\","|",
                  "'","\"",";",":","<",">","?","=","+"];

  var diacritics = [
      [/[\300-\306]/g, "A"],
      [/[\340-\346]/g, "a"],
      [/[\310-\313]/g, "E"],
      [/[\350-\353]/g, "e"],
      [/[\314-\317]/g, "I"],
      [/[\354-\357]/g, "i"],
      [/[\322-\330]/g, "O"],
      [/[\362-\370]/g, "o"],
      [/[\331-\334]/g, "U"],
      [/[\371-\374]/g, "u"],
      [/[\321]/g, "N"],
      [/[\361]/g, "n"],
      [/[\307]/g, "C"],
      [/[\347]/g, "c"]
  ];

  str += "";

  return ""+str.replace(/[^A-Za-z0-9\-_]/g, function(chr) {

    if (" " === chr) {
      return "_";
    }
    else if (removed.indexOf(chr) >= 0) {
      return "";
    }

    var ret = chr;
    for (var d = 0; d < diacritics.length; d++) {
      if (new RegExp(diacritics[d][0]).test(chr)) {
        ret = diacritics[d][1];
        break;
      }
    }

    return ret;

  });

};

},{}],53:[function(require,module,exports){
var defaultLocale;

defaultLocale = require("../core/locale/languages/en_US.coffee");

module.exports = function(text, opts) {
  var biglow, bigs, key, locale, smalls;
  if (!text) {
    return "";
  }
  if (!opts) {
    opts = {};
  }
  key = opts.key;
  if (text.charAt(text.length - 1) === ".") {
    return text.charAt(0).toUpperCase() + text.substr(1);
  }
  locale = "locale" in this ? this.locale.value : defaultLocale;
  smalls = locale.lowercase.map(function(b) {
    return b.toLowerCase();
  });
  bigs = locale.uppercase;
  bigs = bigs.concat(bigs.map(function(b) {
    return b + "s";
  }));
  biglow = bigs.map(function(b) {
    return b.toLowerCase();
  });
  return text.replace(/[^\s!-#%&(-\x2A,-:;\x3F@\x5B-\x5D_\x7B}\u00A1\u00A7\u00AB\u00B6\u00B7\u00BB\u00BF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E3B\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]*/g, function(txt, i) {
    var bigindex, new_txt;
    if (txt) {
      bigindex = biglow.indexOf(txt.toLowerCase());
      if (bigindex >= 0) {
        return new_txt = bigs[bigindex];
      } else if (smalls.indexOf(txt.toLowerCase()) >= 0 && i !== 0 && i !== text.length - 1) {
        return new_txt = txt.toLowerCase();
      } else {
        return new_txt = txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    } else {
      return "";
    }
  });
};


},{"../core/locale/languages/en_US.coffee":28}],54:[function(require,module,exports){
var foreign, tspan;

foreign = require("./foreign.coffee");

tspan = require("./tspan.coffee");

module.exports = function(vars) {
  if (vars.text.html.value) {
    foreign(vars);
  } else {
    tspan(vars);
  }
};


},{"./foreign.coffee":55,"./tspan.coffee":58}],55:[function(require,module,exports){
module.exports = function(vars) {
  var anchor, color, family, opacity, text;
  text = vars.container.value;
  family = text.attr("font-family") || text.style("font-family");
  anchor = vars.align.value || text.attr("text-anchor") || text.style("text-anchor");
  color = text.attr("fill") || text.style("fill");
  opacity = text.attr("opacity") || text.style("opacity");
  anchor = anchor === "end" ? "right" : (anchor === "middle" ? "center" : "left");
  d3.select(text.node().parentNode).append("foreignObject").attr("width", vars.width.value + "px").attr("height", vars.height.value + "px").attr("x", "0px").attr("y", "0px").append("xhtml:div").style("font-family", family).style("font-size", vars.size.value[1] + "px").style("color", color).style("text-align", anchor).style("opacity", opacity).text(vars.text.current);
};


},{}],56:[function(require,module,exports){
module.exports = function(vars) {
  var diff, elem, height, prev, radius, shape, size, width, x, y;
  elem = vars.container.value;
  prev = elem.node().previousElementSibling;
  shape = prev ? prev.tagName.toLowerCase() : "";
  if (prev) {
    prev = d3.select(prev);
  }
  vars.container.x = vars.x.value || parseFloat(elem.attr("x"), 10);
  vars.container.y = vars.y.value || parseFloat(elem.attr("y"), 10);
  if (prev) {
    if (vars.shape.accepted.indexOf(shape) >= 0) {
      vars.self.shape(shape);
    }
    if (shape === "rect") {
      x = parseFloat(prev.attr("x"), 10) || 0;
      y = parseFloat(prev.attr("y"), 10) || 0;
      if (vars.padding.value === false) {
        diff = Math.abs(x - vars.container.x);
        if (diff) {
          vars.self.padding(diff);
        }
      }
      if (!vars.container.x) {
        vars.container.x = x + vars.padding.value;
      }
      if (!vars.container.y) {
        vars.container.y = y + vars.padding.value;
      }
      if (!vars.width.value) {
        width = parseFloat(prev.attr("width" || prev.style("width", 10)));
        vars.self.width(width);
      }
      if (!vars.height.value) {
        height = parseFloat(prev.attr("height" || prev.style("height", 10)));
        vars.self.height(height);
      }
    } else if (shape === "circle") {
      radius = parseFloat(prev.attr("r"), 10);
      x = parseFloat(prev.attr("cx"), 10) || 0;
      x -= radius;
      y = parseFloat(prev.attr("cy"), 10) || 0;
      y -= radius;
      if (vars.padding.value === false) {
        diff = Math.abs(x - vars.container.x);
        if (diff) {
          vars.self.padding(diff);
        }
      }
      if (!vars.container.x) {
        vars.container.x = x + vars.padding.value;
      }
      if (!vars.container.y) {
        vars.container.y = y + vars.padding.value;
      }
      if (!vars.width.value) {
        vars.self.width(radius * 2, 10);
      }
      if (!vars.height.value) {
        vars.self.height(radius * 2, 10);
      }
    } else {
      if (!vars.width.value) {
        vars.self.width(500);
      }
      if (!vars.height.value) {
        vars.self.height(500);
      }
    }
  }
  if (!vars.container.x) {
    vars.container.x = 0;
  }
  if (!vars.container.y) {
    vars.container.y = 0;
  }
  vars.width.inner = vars.width.value - vars.padding.value * 2;
  vars.height.inner = vars.height.value - vars.padding.value * 2;
  size = elem.attr("font-size") || elem.style("font-size");
  size = parseFloat(size, 10);
  vars.container.fontSize = size;
  vars.container.dy = parseFloat(elem.attr("dy"), 10);
  if (!vars.size.value) {
    if (vars.resize.value) {
      return vars.self.size([4, 80]);
    } else {
      return vars.self.size([size / 2, size]);
    }
  }
};


},{}],57:[function(require,module,exports){
module.exports = function(vars) {
  var text;
  if (!vars.text.value) {
    text = vars.container.value.text();
    if (text) {
      if (text.indexOf("tspan") >= 0) {
        text.replace(/\<\/tspan\>\<tspan\>/g, " ");
        text.replace(/\<\/tspan\>/g, "");
        text.replace(/\<tspan\>/g, "");
      }
      text = text.replace(/(\r\n|\n|\r)/gm, "");
      text = text.replace(/^\s+|\s+$/g, "");
      vars.self.text(text);
    }
  }
  if (vars.text.value instanceof Array) {
    vars.text.phrases = vars.text.value.filter(function(t) {
      return ["string", "number"].indexOf(typeof t) >= 0;
    });
  } else {
    vars.text.phrases = [vars.text.value + ""];
  }
  if (!vars.align.value) {
    return vars.container.align = vars.container.value.style("text-anchor") || vars.container.value.attr("text-anchor");
  }
};


},{}],58:[function(require,module,exports){
var rtl;

rtl = require("../../client/rtl.coffee");

module.exports = function(vars) {
  var anchor, dx, dy, ellipsis, fontSize, h, height, line, lineWidth, lines, mirror, newLine, placeWord, progress, reverse, rmod, rotate, rx, ry, space, start, textBox, translate, truncate, valign, width, words, wrap, x, y, yOffset;
  newLine = function(w, first) {
    var tspan;
    if (!w) {
      w = "";
    }
    if (!reverse || first) {
      tspan = vars.container.value.append("tspan");
    } else {
      tspan = vars.container.value.insert("tspan", "tspan");
    }
    return tspan.attr("x", x + "px").attr("dx", dx + "px").attr("dy", dy + "px").style("baseline-shift", "0%").attr("dominant-baseline", "alphabetic").text(w);
  };
  mirror = vars.rotate.value === -90 || vars.rotate.value === 90;
  width = mirror ? vars.height.inner : vars.width.inner;
  height = mirror ? vars.width.inner : vars.height.inner;
  if (vars.shape.value === "circle") {
    anchor = "middle";
  } else {
    anchor = vars.align.value || vars.container.align || "start";
  }
  if (anchor === "end" || (anchor === "start" && rtl)) {
    dx = width;
  } else if (anchor === "middle") {
    dx = width / 2;
  } else {
    dx = 0;
  }
  valign = vars.valign.value || "top";
  x = vars.container.x;
  fontSize = vars.resize.value ? vars.size.value[1] : vars.container.fontSize || vars.size.value[0];
  dy = vars.container.dy || fontSize * 1.1;
  textBox = null;
  progress = null;
  words = null;
  reverse = false;
  yOffset = 0;
  if (vars.shape.value === "circle") {
    if (valign === "middle") {
      yOffset = ((height / dy % 1) * dy) / 2;
    } else if (valign === "end") {
      yOffset = (height / dy % 1) * dy;
    }
  }
  vars.container.value.attr("text-anchor", anchor).attr("font-size", fontSize + "px").style("font-size", fontSize + "px").attr("x", vars.container.x).attr("y", vars.container.y);
  truncate = function() {
    textBox.remove();
    if (reverse) {
      line++;
      textBox = vars.container.value.select("tspan");
    } else {
      line--;
      textBox = d3.select(vars.container.value.node().lastChild);
    }
    if (!textBox.empty()) {
      words = textBox.text().match(/[^\s-]+-?/g);
      return ellipsis();
    }
  };
  lineWidth = function() {
    var b;
    if (vars.shape.value === "circle") {
      b = ((line - 1) * dy) + yOffset;
      if (b > height / 2) {
        b += dy;
      }
      return 2 * Math.sqrt(b * ((2 * (width / 2)) - b));
    } else {
      return width;
    }
  };
  ellipsis = function() {
    var lastChar, lastWord;
    if (words && words.length) {
      lastWord = words.pop();
      lastChar = lastWord.charAt(lastWord.length - 1);
      if (lastWord.length === 1 && vars.text.split.value.indexOf(lastWord) >= 0) {
        return ellipsis();
      } else {
        if (vars.text.split.value.indexOf(lastChar) >= 0) {
          lastWord = lastWord.substr(0, lastWord.length - 1);
        }
        textBox.text(words.join(" ") + " " + lastWord + "...");
        if (textBox.node().getComputedTextLength() > lineWidth()) {
          return ellipsis();
        }
      }
    } else {
      return truncate();
    }
  };
  placeWord = function(word) {
    var current, joiner, next_char;
    current = textBox.text();
    next_char = "";
    if (reverse) {
      next_char = vars.text.current.charAt(vars.text.current.length - progress.length - 1);
      joiner = next_char === " " ? " " : "";
      progress = word + joiner + progress;
      textBox.text(word + joiner + current);
    } else {
      next_char = vars.text.current.charAt(progress.length);
      joiner = next_char === " " ? " " : "";
      progress += joiner + word;
      textBox.text(current + joiner + word);
    }
    if (textBox.node().getComputedTextLength() > lineWidth() || next_char === "\n") {
      textBox.text(current);
      textBox = newLine(word);
      if (reverse) {
        return line--;
      } else {
        return line++;
      }
    }
  };
  start = 1;
  line = null;
  lines = null;
  wrap = function() {
    var i, len, next_char, unsafe, word;
    vars.container.value.selectAll("tspan").remove();
    vars.container.value.html("");
    words = vars.text.words.slice(0);
    if (reverse) {
      words.reverse();
    }
    progress = words[0];
    textBox = newLine(words.shift(), true);
    line = start;
    for (i = 0, len = words.length; i < len; i++) {
      word = words[i];
      if (line * dy > height) {
        truncate();
        break;
      }
      placeWord(word);
      unsafe = true;
      while (unsafe) {
        next_char = vars.text.current.charAt(progress.length + 1);
        unsafe = vars.text.split.value.indexOf(next_char) >= 0;
        if (unsafe) {
          placeWord(next_char);
        }
      }
    }
    if (line * dy > height) {
      truncate();
    }
    return lines = Math.abs(line - start) + 1;
  };
  wrap();
  lines = line;
  if (vars.shape.value === "circle") {
    space = height - lines * dy;
    if (space > dy) {
      if (valign === "middle") {
        start = (space / dy / 2 >> 0) + 1;
        wrap();
      } else if (valign === "bottom") {
        reverse = true;
        start = height / dy >> 0;
        wrap();
      }
    }
  }
  if (valign === "top") {
    y = 0;
  } else {
    h = lines * dy;
    y = valign === "middle" ? height / 2 - h / 2 : height - h;
  }
  y -= dy * 0.2;
  translate = "translate(0," + y + ")";
  if (vars.rotate.value === 180 || vars.rotate.value === -180) {
    rx = vars.container.x + width / 2;
    ry = vars.container.y + height / 2;
  } else {
    rmod = vars.rotate.value < 0 ? width : height;
    rx = vars.container.x + rmod / 2;
    ry = vars.container.y + rmod / 2;
  }
  rotate = "rotate(" + vars.rotate.value + ", " + rx + ", " + ry + ")";
  return vars.container.value.attr("transform", rotate + translate);
};


},{"../../client/rtl.coffee":10}],59:[function(require,module,exports){
var flow, fontSizes, resize, wrap;

flow = require("./flow.coffee");

fontSizes = require("../../font/sizes.coffee");

wrap = function(vars) {
  var firstChar;
  if (vars.text.phrases.length) {
    vars.text.current = vars.text.phrases.shift() + "";
    vars.text.words = vars.text.current.match(vars.text["break"]);
    firstChar = vars.text.current.charAt(0);
    if (firstChar !== vars.text.words[0].charAt(0)) {
      vars.text.words[0] = firstChar + vars.text.words[0];
    }
    vars.container.value.text("");
    if (vars.resize.value) {
      resize(vars);
    } else {
      flow(vars);
    }
  }
};

module.exports = wrap;

resize = function(vars) {
  var addon, areaMod, areaRatio, boxArea, height, heightMax, i, lineWidth, maxWidth, mirror, sizeMax, sizeRatio, sizes, textArea, width, widthRatio, words;
  words = [];
  i = 0;
  while (i < vars.text.words.length) {
    addon = (i === vars.text.words.length - 1 ? "" : " ");
    words.push(vars.text.words[i] + addon);
    i++;
  }
  mirror = vars.rotate.value === -90 || vars.rotate.value === 90;
  width = mirror ? vars.height.inner : vars.width.inner;
  height = mirror ? vars.width.inner : vars.height.inner;
  sizeMax = Math.floor(vars.size.value[1]);
  lineWidth = vars.shape.value === "circle" ? width * 0.75 : width;
  sizes = fontSizes(words, {
    "font-size": sizeMax + "px"
  }, {
    parent: vars.container.value
  });
  maxWidth = d3.max(sizes, function(d) {
    return d.width;
  });
  areaMod = 1.165 + (width / height * 0.11);
  textArea = d3.sum(sizes, function(d) {
    var h;
    h = vars.container.dy || sizeMax * 1.2;
    return d.width * h;
  }) * areaMod;
  if (vars.shape.value === "circle") {
    boxArea = Math.PI * Math.pow(width / 2, 2);
  } else {
    boxArea = lineWidth * height;
  }
  if (maxWidth > lineWidth || textArea > boxArea) {
    areaRatio = Math.sqrt(boxArea / textArea);
    widthRatio = lineWidth / maxWidth;
    sizeRatio = d3.min([areaRatio, widthRatio]);
    sizeMax = d3.max([vars.size.value[0], Math.floor(sizeMax * sizeRatio)]);
  }
  heightMax = Math.floor(height * 0.8);
  if (sizeMax > heightMax) {
    sizeMax = heightMax;
  }
  if (maxWidth * (sizeMax / vars.size.value[1]) <= lineWidth) {
    if (sizeMax !== vars.size.value[1]) {
      vars.self.size([vars.size.value[0], sizeMax]);
    }
    flow(vars);
  } else {
    wrap(vars);
  }
};


},{"../../font/sizes.coffee":41,"./flow.coffee":54}],60:[function(require,module,exports){
module.exports = {
  accepted: [false, "start", "middle", "end", "left", "center", "right"],
  process: function(value) {
    var css;
    css = ["left", "center", "right"].indexOf(value);
    if (css >= 0) {
      value = this.accepted[css + 1];
    }
    return value;
  },
  value: false
};


},{}],61:[function(require,module,exports){
module.exports = {
  accepted: [Object],
  objectAccess: false,
  process: function(value, vars) {
    var method, setting;
    for (method in value) {
      setting = value[method];
      if (method in vars.self) {
        vars.self[method](setting);
      }
    }
    return value;
  },
  value: {}
};


},{}],62:[function(require,module,exports){
var d3selection;

d3selection = require("../../util/d3selection.coffee");

module.exports = {
  accepted: [false, Array, Object, String],
  element: false,
  id: "default",
  process: function(value) {
    if (value === false) {
      return false;
    } else if (d3selection(value)) {
      return value;
    } else if (value instanceof Array) {
      return d3.select(value[0][0]);
    } else {
      return d3.select(value);
    }
  },
  value: false
};


},{"../../util/d3selection.coffee":82}],63:[function(require,module,exports){
module.exports = {
  accepted: [Boolean],
  value: false
};


},{}],64:[function(require,module,exports){
var print, stringFormat;

print = require("../../core/console/print.coffee");

stringFormat = require("../../string/format.js");

module.exports = {
  accepted: [void 0],
  process: function(value, vars) {
    var str;
    if (this.initialized === false) {
      return value;
    }
    if (vars.container.value === false) {
      str = vars.format.locale.value.dev.setContainer;
      print.warning(str, "container");
    } else if (vars.container.value.empty()) {
      str = vars.format.locale.value.dev.noContainer;
      print.warning(stringFormat(str, "\"" + vars.container.value + "\""), "container");
    } else {
      if (vars.dev.value) {
        print.time("total draw time");
      }
      vars.container.value.call(vars.self);
    }
    return value;
  },
  value: void 0
};


},{"../../core/console/print.coffee":21,"../../string/format.js":50}],65:[function(require,module,exports){
var locale, mergeObject;

locale = require("../../core/locale/locale.coffee");

mergeObject = require("../../object/merge.coffee");

module.exports = {
  accepted: [Function, String],
  locale: {
    accepted: function() {
      return d3.keys(locale);
    },
    process: function(value) {
      var defaultLocale, returnObject;
      defaultLocale = "en_US";
      returnObject = locale[defaultLocale];
      if (value !== defaultLocale) {
        returnObject = mergeObject(returnObject, locale[value]);
      }
      this.language = value;
      return returnObject;
    },
    value: "en_US"
  },
  process: function(value, vars) {
    if (this.initialized && typeof value === "string") {
      vars.self.format({
        locale: value
      });
    } else {
      if (typeof value === "function") {
        return value;
      }
    }
    return this.value;
  },
  value: "en_US"
};


},{"../../core/locale/locale.coffee":36,"../../object/merge.coffee":48}],66:[function(require,module,exports){
module.exports = {
  accepted: [false, Number],
  value: false
};


},{}],67:[function(require,module,exports){
module.exports = {
  accepted: [false, Number],
  value: false
};


},{}],68:[function(require,module,exports){
module.exports = {
  accepted: [Boolean],
  value: false
};


},{}],69:[function(require,module,exports){
module.exports = {
  accepted: [-180, -90, 0, 90, 180],
  value: 0
};


},{}],70:[function(require,module,exports){
module.exports = {
  accepted: ["circle", "square"],
  value: false
};


},{}],71:[function(require,module,exports){
module.exports = {
  accepted: [Array, false],
  value: false
};


},{}],72:[function(require,module,exports){
module.exports = {
  accepted: [false, Array, Number, String],
  html: {
    accepted: [Boolean],
    value: false
  },
  init: function(vars) {
    var s;
    s = this.split.value;
    this["break"] = new RegExp("[^\\s\\" + s.join("\\") + "]+\\" + s.join("?\\") + "?", "g");
    return false;
  },
  split: {
    accepted: [Array],
    value: ["-", "/", ";", ":", "&"]
  }
};


},{}],73:[function(require,module,exports){
module.exports = {
  accepted: [false, "top", "middle", "bottom"],
  value: false
};


},{}],74:[function(require,module,exports){
module.exports = {
  accepted: [false, Number],
  value: false
};


},{}],75:[function(require,module,exports){
module.exports = {
  accepted: [false, Number],
  value: false
};


},{}],76:[function(require,module,exports){
module.exports = {
  accepted: [false, Number],
  value: false
};


},{}],77:[function(require,module,exports){
var attach, print, sizes, text, wrap;

attach = require("../core/methods/attach.coffee");

sizes = require("./helpers/parseSize.coffee");

print = require("../core/console/print.coffee");

text = require("./helpers/parseText.coffee");

wrap = require("./helpers/wrap.coffee");

module.exports = function() {
  var vars;
  vars = {
    self: function(selection) {
      selection.each(function() {
        sizes(vars);
        if (vars.size.value[0] <= vars.height.inner) {
          text(vars);
          wrap(vars);
        } else {
          vars.container.value.html("");
        }
        if (vars.dev.value) {
          print.timeEnd("total draw time");
        }
      });
      return vars.self;
    }
  };
  attach(vars, {
    align: require("./methods/align.coffee"),
    config: require("./methods/config.coffee"),
    container: require("./methods/container.coffee"),
    dev: require("./methods/dev.coffee"),
    draw: require("./methods/draw.coffee"),
    format: require("./methods/format.coffee"),
    height: require("./methods/height.coffee"),
    padding: require("./methods/padding.coffee"),
    resize: require("./methods/resize.coffee"),
    rotate: require("./methods/rotate.coffee"),
    text: require("./methods/text.coffee"),
    shape: require("./methods/shape.coffee"),
    size: require("./methods/size.coffee"),
    valign: require("./methods/valign.coffee"),
    width: require("./methods/width.coffee"),
    x: require("./methods/x.coffee"),
    y: require("./methods/y.coffee")
  });
  return vars.self;
};


},{"../core/console/print.coffee":21,"../core/methods/attach.coffee":37,"./helpers/parseSize.coffee":56,"./helpers/parseText.coffee":57,"./helpers/wrap.coffee":59,"./methods/align.coffee":60,"./methods/config.coffee":61,"./methods/container.coffee":62,"./methods/dev.coffee":63,"./methods/draw.coffee":64,"./methods/format.coffee":65,"./methods/height.coffee":66,"./methods/padding.coffee":67,"./methods/resize.coffee":68,"./methods/rotate.coffee":69,"./methods/shape.coffee":70,"./methods/size.coffee":71,"./methods/text.coffee":72,"./methods/valign.coffee":73,"./methods/width.coffee":74,"./methods/x.coffee":75,"./methods/y.coffee":76}],78:[function(require,module,exports){
module.exports = function(arr, n) {
  var buckets, step;
  buckets = [];
  step = 1 / (n - 1) * (arr[1] - arr[0]);
  return d3.range(arr[0], arr[1] + step, step);
};


},{}],79:[function(require,module,exports){
var d3selection;

d3selection = require("./d3selection.coffee");

module.exports = function(parent, child) {
  var node;
  if (!parent || !child) {
    return false;
  }
  if (d3selection(parent)) {
    parent = parent.node();
  }
  if (d3selection(parent)) {
    child = child.node();
  }
  node = child.parentNode;
  while (node !== null) {
    if (node === parent) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
};


},{"./d3selection.coffee":82}],80:[function(require,module,exports){
module.exports = function(arr, value) {
  var closest, i;
  if (value.constructor === String) {
    i = arr.indexOf(value);
    if (i > -1) {
      return arr[i];
    } else {
      return arr[0];
    }
  }
  closest = arr[0];
  arr.forEach(function(p) {
    if (Math.abs(value - p) < Math.abs(value - closest)) {
      return closest = p;
    }
  });
  return closest;
};


},{}],81:[function(require,module,exports){
var copy, objectMerge, objectValidate;

objectMerge = require("../object/merge.coffee");

objectValidate = require("../object/validate.coffee");

copy = function(variable) {
  var ret;
  if (objectValidate(variable)) {
    return objectMerge(variable);
  } else if (variable instanceof Array) {
    ret = [];
    variable.forEach(function(o) {
      return ret.push(copy(o));
    });
    return ret;
  } else {
    return variable;
  }
};

module.exports = copy;


},{"../object/merge.coffee":48,"../object/validate.coffee":49}],82:[function(require,module,exports){
var ie;

ie = require("../client/ie.js");

module.exports = function(elem) {
  if (ie) {
    return typeof elem === "object" && elem instanceof Array && "size" in elem && "select" in elem;
  } else {
    return elem instanceof d3.selection;
  }
};


},{"../client/ie.js":7}],83:[function(require,module,exports){
module.exports = function(url, callback) {
  var img;
  img = new Image();
  img.src = url;
  img.crossOrigin = "Anonymous";
  img.onload = function() {
    var canvas, context;
    canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    context = canvas.getContext("2d");
    context.drawImage(this, 0, 0);
    callback.call(this, canvas.toDataURL("image/png"));
    canvas = null;
  };
};


},{}],84:[function(require,module,exports){
var objectValidate, uniques;

objectValidate = require("../object/validate.coffee");

uniques = function(data, value, fetch, vars, depth) {
  var check, d, i, j, k, len, len1, len2, len3, lookups, m, v, val, vals;
  if (data === void 0) {
    return [];
  }
  if (vars && depth === void 0) {
    depth = vars.id.value;
  }
  if (!(data instanceof Array)) {
    data = [data];
  }
  lookups = [];
  if (value === void 0) {
    return data.reduce(function(p, c) {
      var lookup;
      lookup = JSON.stringify(c);
      if (lookups.indexOf(lookup) < 0) {
        if (p.indexOf(c) < 0) {
          p.push(c);
        }
        lookups.push(lookup);
      }
      return p;
    }, []);
  }
  vals = [];
  check = function(v) {
    var l;
    if (v !== void 0 && v !== null) {
      l = JSON.stringify(v);
      if (lookups.indexOf(l) < 0) {
        vals.push(v);
        return lookups.push(l);
      }
    }
  };
  if (typeof fetch === "function" && vars) {
    for (i = 0, len = data.length; i < len; i++) {
      d = data[i];
      val = uniques(fetch(vars, d, value, depth));
      for (j = 0, len1 = val.length; j < len1; j++) {
        v = val[j];
        check(v);
      }
    }
  } else if (typeof value === "function") {
    for (k = 0, len2 = data.length; k < len2; k++) {
      d = data[k];
      val = value(d);
      check(val);
    }
  } else {
    for (m = 0, len3 = data.length; m < len3; m++) {
      d = data[m];
      if (objectValidate(d)) {
        val = d[value];
        check(val);
      }
    }
  }
  return vals.sort(function(a, b) {
    return a - b;
  });
};

module.exports = uniques;


},{"../object/validate.coffee":49}]},{},[46]);

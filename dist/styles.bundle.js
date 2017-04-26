webpackJsonp([1,3],{

/***/ 263:
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function() {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		var result = [];
		for(var i = 0; i < this.length; i++) {
			var item = this[i];
			if(item[2]) {
				result.push("@media " + item[2] + "{" + item[1] + "}");
			} else {
				result.push(item[1]);
			}
		}
		return result.join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};


/***/ }),

/***/ 273:
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
var stylesInDom = {},
	memoize = function(fn) {
		var memo;
		return function () {
			if (typeof memo === "undefined") memo = fn.apply(this, arguments);
			return memo;
		};
	},
	isOldIE = memoize(function() {
		return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
	}),
	getHeadElement = memoize(function () {
		return document.head || document.getElementsByTagName("head")[0];
	}),
	singletonElement = null,
	singletonCounter = 0,
	styleElementsInsertedAtTop = [];

module.exports = function(list, options) {
	if(typeof DEBUG !== "undefined" && DEBUG) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (typeof options.singleton === "undefined") options.singleton = isOldIE();

	// By default, add <style> tags to the bottom of <head>.
	if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

	var styles = listToStyles(list);
	addStylesToDom(styles, options);

	return function update(newList) {
		var mayRemove = [];
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			domStyle.refs--;
			mayRemove.push(domStyle);
		}
		if(newList) {
			var newStyles = listToStyles(newList);
			addStylesToDom(newStyles, options);
		}
		for(var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];
			if(domStyle.refs === 0) {
				for(var j = 0; j < domStyle.parts.length; j++)
					domStyle.parts[j]();
				delete stylesInDom[domStyle.id];
			}
		}
	};
}

function addStylesToDom(styles, options) {
	for(var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];
		if(domStyle) {
			domStyle.refs++;
			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}
			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];
			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}
			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles(list) {
	var styles = [];
	var newStyles = {};
	for(var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};
		if(!newStyles[id])
			styles.push(newStyles[id] = {id: id, parts: [part]});
		else
			newStyles[id].parts.push(part);
	}
	return styles;
}

function insertStyleElement(options, styleElement) {
	var head = getHeadElement();
	var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
	if (options.insertAt === "top") {
		if(!lastStyleElementInsertedAtTop) {
			head.insertBefore(styleElement, head.firstChild);
		} else if(lastStyleElementInsertedAtTop.nextSibling) {
			head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			head.appendChild(styleElement);
		}
		styleElementsInsertedAtTop.push(styleElement);
	} else if (options.insertAt === "bottom") {
		head.appendChild(styleElement);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement(styleElement) {
	styleElement.parentNode.removeChild(styleElement);
	var idx = styleElementsInsertedAtTop.indexOf(styleElement);
	if(idx >= 0) {
		styleElementsInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement(options) {
	var styleElement = document.createElement("style");
	styleElement.type = "text/css";
	insertStyleElement(options, styleElement);
	return styleElement;
}

function createLinkElement(options) {
	var linkElement = document.createElement("link");
	linkElement.rel = "stylesheet";
	insertStyleElement(options, linkElement);
	return linkElement;
}

function addStyle(obj, options) {
	var styleElement, update, remove;

	if (options.singleton) {
		var styleIndex = singletonCounter++;
		styleElement = singletonElement || (singletonElement = createStyleElement(options));
		update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
		remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
	} else if(obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function") {
		styleElement = createLinkElement(options);
		update = updateLink.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
			if(styleElement.href)
				URL.revokeObjectURL(styleElement.href);
		};
	} else {
		styleElement = createStyleElement(options);
		update = applyToTag.bind(null, styleElement);
		remove = function() {
			removeStyleElement(styleElement);
		};
	}

	update(obj);

	return function updateStyle(newObj) {
		if(newObj) {
			if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
				return;
			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;
		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag(styleElement, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = styleElement.childNodes;
		if (childNodes[index]) styleElement.removeChild(childNodes[index]);
		if (childNodes.length) {
			styleElement.insertBefore(cssNode, childNodes[index]);
		} else {
			styleElement.appendChild(cssNode);
		}
	}
}

function applyToTag(styleElement, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		styleElement.setAttribute("media", media)
	}

	if(styleElement.styleSheet) {
		styleElement.styleSheet.cssText = css;
	} else {
		while(styleElement.firstChild) {
			styleElement.removeChild(styleElement.firstChild);
		}
		styleElement.appendChild(document.createTextNode(css));
	}
}

function updateLink(linkElement, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	if(sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = linkElement.href;

	linkElement.href = URL.createObjectURL(blob);

	if(oldSrc)
		URL.revokeObjectURL(oldSrc);
}


/***/ }),

/***/ 463:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(734);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(273)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":false,\"importLoaders\":1}!../../../node_modules/postcss-loader/index.js!./loading-bars.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":false,\"importLoaders\":1}!../../../node_modules/postcss-loader/index.js!./loading-bars.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 464:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(735);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(273)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":false,\"importLoaders\":1}!../../../node_modules/postcss-loader/index.js!./riliwan-rabo.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":false,\"importLoaders\":1}!../../../node_modules/postcss-loader/index.js!./riliwan-rabo.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 465:
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(736);
if(typeof content === 'string') content = [[module.i, content, '']];
// add the styles to the DOM
var update = __webpack_require__(273)(content, {});
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":false,\"importLoaders\":1}!../../../node_modules/postcss-loader/index.js!./style.css", function() {
			var newContent = require("!!../../../node_modules/css-loader/index.js?{\"sourceMap\":false,\"importLoaders\":1}!../../../node_modules/postcss-loader/index.js!./style.css");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),

/***/ 734:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(263)();
// imports


// module
exports.push([module.i, ".splash {\n    position: absolute;\n    z-index: 2000;\n    background: white;\n    color: gray;\n    top: 0;\n    bottom: 0;\n    left: 0;\n    right: 0\n}\n\n.splash-title {\n    text-align: center;\n    max-width: 500px;\n    margin: 15% auto;\n    padding: 20px\n}\n\n.splash-title h1{\n    font-size: 26px\n}\n\n.color-line {\n    border-radius:4px 4px 0 0\n}", ""]);

// exports


/***/ }),

/***/ 735:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(263)();
// imports
exports.push([module.i, "@import url(http://fonts.googleapis.com/css?family=Roboto+Condensed:400,700);", ""]);

// module
exports.push([module.i, "/* written by riliwan balogun http://www.facebook.com/riliwan.rabo*/\r\n.board{\r\n    width: 85%;\r\n    margin: 60px auto;\r\n    height: 700px;\r\n    background: #fff;\r\n    /*box-shadow: 10px 10px #ccc,-10px 20px #ddd;*/\r\n}\r\n.board .nav-tabs {\r\n    position: relative;\r\n    /* border-bottom: 0; */\r\n    /* width: 80%; */\r\n    margin: 40px auto;\r\n    margin-bottom: 0;\r\n    box-sizing: border-box;\r\n\r\n}\r\n\r\n.board > div.board-inner{\r\n    background: #fafafa url(http://subtlepatterns.com/patterns/geometry2.png);\r\n    background-size: 30%;\r\n}\r\n\r\np.narrow{\r\n    width: 60%;\r\n    margin: 10px auto;\r\n}\r\n\r\n.liner{\r\n    height: 2px;\r\n    background: #ddd;\r\n    position: absolute;\r\n    width: 80%;\r\n    margin: 0 auto;\r\n    left: 0;\r\n    right: 0;\r\n    top: 50%;\r\n    z-index: 1;\r\n}\r\n\r\n.nav-tabs > li.active > a, .nav-tabs > li.active > a:hover, .nav-tabs > li.active > a:focus {\r\n    color: #555555;\r\n    cursor: default;\r\n    /* background-color: #ffffff; */\r\n    border: 0;\r\n    border-bottom-color: transparent;\r\n}\r\n\r\nspan.round-tabs{\r\n    width: 70px;\r\n    height: 70px;\r\n    line-height: 70px;\r\n    display: inline-block;\r\n    border-radius: 100px;\r\n    background: white;\r\n    z-index: 2;\r\n    position: absolute;\r\n    left: 0;\r\n    text-align: center;\r\n    font-size: 25px;\r\n}\r\n\r\nspan.round-tabs.one{\r\n    color: rgb(34, 194, 34);border: 2px solid rgb(34, 194, 34);\r\n}\r\n\r\nli.active span.round-tabs.one{\r\n    background: #fff !important;\r\n    border: 2px solid #ddd;\r\n    color: rgb(34, 194, 34);\r\n}\r\n\r\nspan.round-tabs.two{\r\n    color: #febe29;border: 2px solid #febe29;\r\n}\r\n\r\nli.active span.round-tabs.two{\r\n    background: #fff !important;\r\n    border: 2px solid #ddd;\r\n    color: #febe29;\r\n}\r\n\r\nspan.round-tabs.three{\r\n    color: #3e5e9a;border: 2px solid #3e5e9a;\r\n}\r\n\r\nli.active span.round-tabs.three{\r\n    background: #fff !important;\r\n    border: 2px solid #ddd;\r\n    color: #3e5e9a;\r\n}\r\n\r\nspan.round-tabs.four{\r\n    color: #f1685e;border: 2px solid #f1685e;\r\n}\r\n\r\nli.active span.round-tabs.four{\r\n    background: #fff !important;\r\n    border: 2px solid #ddd;\r\n    color: #f1685e;\r\n}\r\n\r\nspan.round-tabs.five{\r\n    color: mediumvioletred;border: 2px solid #ddd;\r\n}\r\n\r\nli.active span.round-tabs.five{\r\n    background: #fff !important;\r\n    border: 2px solid #ddd;\r\n    color: mediumvioletred;\r\n}\r\n\r\n.nav-tabs > li.active > a span.round-tabs{\r\n    background: #fafafa;\r\n}\r\n.nav-tabs > li {\r\n    /*width: 20%;*/\r\n    width: 20%;\r\n}\r\n/*li.active:before {\r\n    content: \" \";\r\n    position: absolute;\r\n    left: 45%;\r\n    opacity:0;\r\n    margin: 0 auto;\r\n    bottom: -2px;\r\n    border: 10px solid transparent;\r\n    border-bottom-color: #fff;\r\n    z-index: 1;\r\n    transition:0.2s ease-in-out;\r\n}*/\r\n.nav-tabs > li:after {\r\n    content: \" \";\r\n    position: absolute;\r\n    left: 45%;\r\n   opacity:0;\r\n    margin: 0 auto;\r\n    bottom: 0px;\r\n    border: 5px solid transparent;\r\n    border-bottom-color: #ddd;\r\n    -webkit-transition: 0.1s ease-in-out;\r\n    transition:0.1s ease-in-out;\r\n    \r\n}\r\n.nav-tabs > li.active:after {\r\n    content: \" \";\r\n    position: absolute;\r\n    left: 45%;\r\n   opacity:1;\r\n    margin: 0 auto;\r\n    bottom: 0px;\r\n    border: 10px solid transparent;\r\n    border-bottom-color: #ddd;\r\n    \r\n}\r\n.nav-tabs > li a{\r\n   width: 70px;\r\n   height: 70px;\r\n   margin: 20px auto;\r\n   border-radius: 100%;\r\n   padding: 0;\r\n}\r\n\r\n.nav-tabs > li a:hover{\r\n    background: transparent;\r\n}\r\n\r\n.tab-content .tab-pane{\r\n   position: relative;\r\n/*padding-top: 50px;*/\r\n}\r\n.tab-content .head{\r\n    font-family: 'Roboto Condensed', sans-serif;\r\n    font-size: 25px;\r\n    text-transform: uppercase;\r\n    padding-bottom: 10px;\r\n}\r\n.btn-outline-rounded{\r\n    padding: 10px 40px;\r\n    margin: 20px 0;\r\n    border: 2px solid transparent;\r\n    border-radius: 25px;\r\n}\r\n\r\n.btn.green{\r\n    background-color:#5cb85c;\r\n    /*border: 2px solid #5cb85c;*/\r\n    color: #ffffff;\r\n}\r\n\r\n\r\n\r\n@media( max-width : 585px ){\r\n    \r\n    .board {\r\nwidth: 90%;\r\nheight:auto !important;\r\n}\r\n    span.round-tabs {\r\n        font-size:16px;\r\nwidth: 50px;\r\nheight: 50px;\r\nline-height: 50px;\r\n    }\r\n    .tab-content .head{\r\n        font-size:20px;\r\n        }\r\n    .nav-tabs > li a {\r\nwidth: 50px;\r\nheight: 50px;\r\nline-height:50px;\r\n}\r\n\r\n.nav-tabs > li.active:after {\r\ncontent: \" \";\r\nposition: absolute;\r\nleft: 35%;\r\n}\r\n\r\n.btn-outline-rounded {\r\n    padding:12px 20px;\r\n    }\r\n}\r\n", ""]);

// exports


/***/ }),

/***/ 736:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(263)();
// imports


// module
exports.push([module.i, ".btn-default {\r\n    border-color: #ccc;\r\n}\r\n\r\n.tab-content .choice {\r\n  text-align: center;\r\n  cursor: pointer;\r\n  margin-top: 38px;\r\n}\r\n\r\n.tab-content .choice i {\r\n    font-size: 32px;\r\n    line-height: 55px;\r\n}\r\n\r\n.btn-radio {\r\n\twidth: 100%;\r\n}\r\n.img-radio {\r\n\topacity: 0.8;\r\n\tmargin-bottom: 5px;\r\n}\r\n\r\n.space-20 {\r\n    margin-top: 20px;\r\n}\r\n\r\n/* active buttons */\r\n#status-buttons a.active span.round-tabs.one { \r\n    background: rgb(34, 194, 34); \r\n    color: #fff\r\n}\r\n\r\n#status-buttons a.active span.round-tabs.two { \r\n    background: #febe29; \r\n    color: #fff\r\n}\r\n\r\n#status-buttons a.active span.round-tabs.three { \r\n    background: #3e5e9a; \r\n    color: #fff\r\n}\r\n\r\n#status-buttons a.active span.round-tabs.four { \r\n    background: #f1685e; \r\n    color: #fff\r\n}\r\n#status-buttons a.active span.round-tabs.five { \r\n    background: mediumvioletred; \r\n    color: #fff\r\n}\r\n\r\n.iradio_buttons {\r\n    display: inline-block;\r\n    vertical-align: middle;\r\n    margin: 0;\r\n    padding: 0;\r\n    width: 22px;\r\n    height: 22px;\r\n    background: #febe29 no-repeat;\r\n    border: none;\r\n    cursor: pointer;\r\n}\r\n.iradio_buttons {\r\n    background-position: -120px 0;\r\n}\r\n.iradio_buttons.hover {\r\n    background-position: -144px 0;\r\n}\r\n.iradio_buttons.checked {\r\n    background-position: -168px 0;\r\n}\r\n.form-group{\r\n    margin-bottom: 3px;\r\n}\r\n\r\n.navbar-nav a.active {\r\n    background-color: #e7e7e7 !important;\r\n    color: #555 !important;\r\n}\r\n\r\n.ng2-pagination li span, .ng2-pagination li a {\r\n    font-size: 22px;\r\n}\r\n\r\nspan.link {\r\n  color: blue;\r\n  cursor: pointer;\r\n  text-decoration: underline;\r\n}", ""]);

// exports


/***/ }),

/***/ 820:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(465);
__webpack_require__(464);
module.exports = __webpack_require__(463);


/***/ })

},[820]);
//# sourceMappingURL=styles.bundle.js.map
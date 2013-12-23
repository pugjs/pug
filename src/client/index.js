'use strict';

var CodeMirror = require('code-mirror');
require('code-mirror/mode/htmlmixed');
require('jade-code-mirror');
var uglify = require('uglify-js')
var jadeLib = require('jade/lib/jade.js')

function $(selector, parent) {
  return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
}
function _(selector, parent) {
  return (parent || document).querySelector(selector)
}
function on(element, event, handler) {
  if (element && element.addEventListener) {
    element.addEventListener(event, handler, false)
  } else if (element.length) {
    for (var i = 0; i < element.length; i++) {
      on(element[i], event, handler);
    }
  }
}
function cm(el, mode, readonly) {
  if (el.parentNode) {
    var div = document.createElement('div');
    el.parentNode.replaceChild(div, el);
    return CodeMirror(div, {
      value: el.textContent,
      mode: mode,
      readOnly: readonly || false,
      viewportMargin: Infinity
    });
  } else {
    return {
      on: function (event, handler) {},
      getValue: function () { return el.textContent; },
      setValue: function (src) { el.textContent = ''; }
    };
  }
}

$('[data-control="interactive"]').forEach(function (control) {
  var jade = _('[data-control="input-jade"]', control);
  var js = _('[data-control="input-js"]', control) || {textContent: '{ pageTitle: "Jade", youAreUsingJade: true }'};
  var html = _('[data-control="output-html"]', control) || {};
  var jsOut = _('[data-control="output-js"]', control) || {};
  var editable = false;
  on(jade, 'click', makeEditable);
  on(js, 'click', makeEditable);
  if (!jsOut.innerText && !html.innerText) makeEditable();
  function makeEditable() {
    if (editable) return;
    editable = true;
    handleChanges(cm(jade, 'jade'), cm(js, 'javascript'), cm(html, 'htmlmixed', true), cm(jsOut, 'javascript', true));
  }
});

function handleChanges(jade, js, html, jsOut) {
  jade.on('change', update);
  js.on('change', update);
  update();
  function update() {
    var jadeSrc = jade.getValue();
    var jsSrc = js.getValue();
    
    var jsObjA, jsObjB, jsObjC;
    try {
      jsObjA = Function('', 'return ' + js.getValue())() || {};
      jsObjB = Function('', 'return ' + js.getValue())() || {};
      jsObjC = Function('', 'return ' + js.getValue())() || {};
      if (jsObjA.compileDebug === undefined) jsObjA.compileDebug = true;
      jadeLib.compileClient(jade.getValue(), jsObjA);
      if (jsObjB.compileDebug === undefined) jsObjB.compileDebug = false;
      var jsOutSrc = jadeLib.compileClient(jade.getValue(), jsObjB);
      try {
        jsOutSrc = uglify.minify(jsOutSrc, {
          fromString: true,
          mangle: false,
          output: {beautify: true},
          compress: false
        }).code
      } catch (ex) {}
      jsOut.setValue(jsOutSrc.trim());
    } catch (ex) {
      jsOut.setValue(ex.message || ex);
      html.setValue(ex.message || ex);
      return;
    }
    try {
      if (jsObjC.compileDebug === undefined) jsObjC.compileDebug = true;
      if (jsObjC.pretty === undefined) jsObjC.pretty = true;
      var htmlOutSrc = jadeLib.render(jade.getValue(), jsObjC);
      html.setValue(htmlOutSrc.trim());
    } catch (ex) {
      html.setValue(ex.message || ex);
      return;
    }
  }
}

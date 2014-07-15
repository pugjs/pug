'use strict';

if (!(typeof Function.prototype.bind === 'function' && typeof Array.isArray === 'function') ||
    /no-interactivity/.test(location.search)) {
  return;
}

var CodeMirror = require('code-mirror');
require('code-mirror/mode/htmlmixed');
require('jade-code-mirror');
var uglify = require('uglify-js')
var jade = require('../../')

function $(selector, parent) {
  return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
}
function _(selector, parent) {
  return (parent || document).querySelector(selector)
}

function betterTab(cm) {
  if (cm.somethingSelected()) {
    cm.indentSelection('add');
  } else {
    cm.replaceSelection('  ', 'end', '+input');
  }
}

function cm(el, mode, readonly) {
  if (el.parentNode) {
    var div = document.createElement('div');
    if (readonly) {
      div.setAttribute('class', 'read-only-code-mirror');
    }
    el.parentNode.replaceChild(div, el);
    return CodeMirror(div, {
      value: el.textContent,
      mode: mode,
      readOnly: readonly || false,
      viewportMargin: Infinity,
      indentWithTabs: false,
      extraKeys: {
        'Tab': betterTab,
        'Shift-Tab': function (cm) { CodeMirror.commands.indentLess(cm) }
      }
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
  if (editable) return;
  editable = true;
  handleChanges(cm(jade, 'jade'), cm(js, 'javascript'), cm(html, 'htmlmixed', true), cm(jsOut, 'javascript', true));
});

function handleChanges(jadeInput, js, html, jsOut) {
  jadeInput.on('change', update);
  js.on('change', update);
  update();
  function update() {
    var jadeSrc = jadeInput.getValue();
    var jsSrc = js.getValue();
    
    var jsObjA, jsObjB, jsObjC;
    try {
      jsObjA = Function('', 'return ' + js.getValue())() || {};
      jsObjB = Function('', 'return ' + js.getValue())() || {};
      jsObjC = Function('', 'return ' + js.getValue())() || {};
      if (jsObjA.compileDebug === undefined) jsObjA.compileDebug = true;
      jade.compileClient(jadeSrc, jsObjA);
      if (jsObjB.compileDebug === undefined) jsObjB.compileDebug = false;
      var jsOutSrc = jade.compileClient(jadeSrc, jsObjB);
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
      var htmlOutSrc = jade.render(jadeSrc, jsObjC);
      html.setValue(htmlOutSrc.trim());
    } catch (ex) {
      html.setValue(ex.message || ex);
      return;
    }
  }
}
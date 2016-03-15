'use strict';

if (!(typeof Function.prototype.bind === 'function' && typeof Array.isArray === 'function') ||
    /no-interactivity/.test(location.search)) {
  return;
}

var CodeMirror = require('code-mirror');
require('code-mirror/mode/htmlmixed');
require('pug-code-mirror');
var uglify = require('uglify-js')
var pug = require('../../')

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

var features = {
  'templatestrings': (function () {
    // Taken from Modernizr, which is MIT-licensed
    var supports;
    try {
      // A number of tools, including uglifyjs and require, break on a raw "`", so
      // use an eval to get around that.
      eval('``');
      supports = true;
    } catch (e) {}
    return !!supports;
  })()
};
function checkFeature(control) {
  var featureStr = control.dataset.features;
  if (!featureStr) return true;
  return featureStr.split(' ').every(function (feature) {
    return features[feature];
  });
}

$('[data-control="interactive"]').forEach(function (control) {
  if (!checkFeature(control)) return;
  var pug = _('[data-control="input-pug"]', control);
  var js = _('[data-control="input-js"]', control) || {textContent: '{ pageTitle: "Pug", youAreUsingPug: true }'};
  var html = _('[data-control="output-html"]', control) || {};
  var jsOut = _('[data-control="output-js"]', control) || {};
  var editable = false;
  if (editable) return;
  editable = true;
  handleChanges(cm(pug, 'pug'), cm(js, 'javascript'), cm(html, 'htmlmixed', true), cm(jsOut, 'javascript', true));
});

function handleChanges(pugInput, js, html, jsOut) {
  pugInput.on('change', update);
  js.on('change', update);
  update();
  function update() {
    var pugSrc = pugInput.getValue();
    var jsSrc = js.getValue();
    
    var jsObjA, jsObjB, jsObjC;
    try {
      jsObjA = Function('', 'return ' + js.getValue())() || {};
      jsObjB = Function('', 'return ' + js.getValue())() || {};
      jsObjC = Function('', 'return ' + js.getValue())() || {};
      if (jsObjA.compileDebug === undefined) jsObjA.compileDebug = true;
      pug.compileClient(pugSrc, jsObjA);
      if (jsObjB.compileDebug === undefined) jsObjB.compileDebug = false;
      var jsOutSrc = pug.compileClient(pugSrc, jsObjB);
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
      var htmlOutSrc = pug.render(pugSrc, jsObjC);
      html.setValue(htmlOutSrc.trim());
    } catch (ex) {
      html.setValue(ex.message || ex);
      return;
    }
  }
}

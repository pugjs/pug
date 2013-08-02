var uglify = require('uglify-js')
var jade = require('jade/lib/jade.js')
var hljs = require('highlight.js')
var hljade = require('../highlight-jade.js')
var highlighters = {
  javascript: function (src) {
    return hljs.highlight('javascript', src).value;
  },
  html: function (src) {
    return hljs.highlight('xml', src).value;
  },
  jade: hljade
}

function $(selector, parent) {
  return (parent || document).querySelectorAll(selector)
}
function _(selector, parent) {
  return (parent || document).querySelector(selector)
}
function on(element, event, handler) {
  if (element)
    element.addEventListener(event, handler, false)
}


function enableTab(el) {
  el.onkeydown = function(e) {
    if (e.keyCode === 9) {// tab was pressed

      // get caret position/selection
      var val = this.value
      var start = this.selectionStart
      var end = this.selectionEnd

      // set textarea value to: text before caret + '  ' + text after caret
      this.value = val.substring(0, start) + '  ' + val.substring(end);

      // put caret at right position again
      this.selectionStart = this.selectionEnd = start + 2;

      // prevent the focus lose
      e.preventDefault()
    }
  }
  return el
}
function makeEditable(pre, language, onUpdate) {
  if (!pre) return
  var src = pre.textContent
  var editMode = false
  on(pre, 'click', function () {
    if (!editMode) {
      editMode = true
      pre.innerHTML = ''
      var textarea = document.createElement('textarea')
      enableTab(textarea)
      textarea.textContent = src
      pre.appendChild(textarea)
      textarea.focus()
      on(textarea, 'blur', function () {
        editMode = false
        src = textarea.value
        pre.innerHTML = ''
        var code = document.createElement('code')
        try {
          code.innerHTML = highlighters[language](src)
        } catch (ex) {
          code.textContent = src
        }
        pre.appendChild(code)
        onUpdate(src)
      })
    }
  })
}
function makeInteractive(control) {
  var jade = _('[data-control="input-jade"]', control)
  var jadeSRC = jade.textContent
  var js = _('[data-control="input-js"]', control)
  var jsSRC = js ? js.textContent : '{ pageTitle: "Jade", youAreUsingJade: true }'
  makeEditable(jade, 'jade', function (jade) {
    jadeSRC = jade
    update(control, jadeSRC, jsSRC)
  })
  makeEditable(js, 'javascript', function (js) {
    jsSRC = js
    update(control, jadeSRC, jsSRC)
  })
  if (_('[data-control="output-html"]', control) && _('[data-control="output-html"]', control).textContent.trim() === '')
    update(control, jadeSRC, jsSRC)
}
function update(control, jadeSRC, js) {
  var jsOut = _('[data-control="output-js"]', control)
  var htmlOut = _('[data-control="output-html"]', control)
  var jsObjA = {}
  var jsObjB = {}
  try {
    jsObjA = Function('', 'return ' + js)()
    jsObjB = Function('', 'return ' + js)()
  } catch (ex) {

  }
  if (jsOut) {
    jsObjA.client = true
    if (jsObjA.compileDebug === undefined) jsObjA.compileDebug = false
    var jsOutSrc = jade.compile(jadeSRC, jsObjA).toString()
    try {
      jsOutSrc = uglify.minify(jsOutSrc, {
        fromString: true,
        mangle: false,
        output: {beautify: true},
        compress: false
      }).code
    } catch (ex) {}
    jsOut.innerHTML = ''
    var code = document.createElement('code')
    try {
      code.innerHTML = highlighters.javascript(jsOutSrc)
    } catch (ex) {
      code.textContent = jsOutSrc
    }
    jsOut.appendChild(code)
  }
  if (htmlOut) {
    if (jsObjB.compileDebug === undefined) jsObjB.compileDebug = true
    if (jsObjB.pretty === undefined) jsObjB.pretty = true
    var htmlOutSrc = jade.compile(jadeSRC, jsObjB)(jsObjB)
    htmlOut.innerHTML = ''
    var code = document.createElement('code')
    try {
      code.innerHTML = highlighters.html(htmlOutSrc)
    } catch (ex) {
      code.textContent = htmlOutSrc
    }
    htmlOut.appendChild(code)
  }
}
var interactives = $('[data-control="interactive"]')
for (var i = 0; i < interactives.length; i++) {
  makeInteractive(interactives[i])
}
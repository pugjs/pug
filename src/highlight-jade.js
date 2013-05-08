var Lexer = require('jade/lib/lexer');
var hljs = require('highlight.js');
 
function highlightJavaScript(js) {
  return hljs.highlight('javascript', js).value;
}
 
function escape(src) {
  return src.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
}
 
module.exports = highlightJade;
function highlightJade(jade) {
  var lexer = new Lexer(jade);
 
  var last = null;
  var tok = {};
  var buf = [];
  var textMode = false;
  var textIndent = 0;
  var textBuf = '';
  function enterTextMode() {
    textMode = true;
    textIndent = 0;
    textBuf = '';
  }
  function exitTextMode() {
    if (textMode) {
      textMode = false;
      textIndent = 0;
      buf.push(escape(textBuf));
    }
  }
 
  while (tok.type !== 'eos') {
    last = tok;
    var before = lexer.input;
    tok = lexer.next();
    var after = lexer.input;
    var src = before.substr(0, before.length - after.length);
    if (textIndent && tok.type != 'outdent') {
      buf.push(escape(src));
    } else {
      switch (tok.type) {
        case 'text':
          if (tok.val === '.') enterTextMode();
          buf.push(escape(src));
          break;
        case 'newline':
          buf.push(escape(src));
          if (textIndent <= 0) exitTextMode();
          break;
        case 'outdent':
          buf.push(escape(src));
          if (textMode) textIndent--;
          if (textIndent <= 0) exitTextMode();
          break;
        case 'indent':
          buf.push(escape(src));
          if (textMode) textIndent++;
          break;
        case 'filter':
          buf.push('<span class="keyword">' + escape(src) + '</span>');
          textMode = true;
          break;
        case 'code':
          buf.push(highlightJavaScript(src));
          break;
        case 'attrs':
          buf.push(highlightJavaScript(src).replace(/(<span[^<]+<\/)|(^\([^=]+=)|(,[^=]+=)/g, function (_, span, begin, mid) {
            if (span) return _;
            if (begin) {
              return '(<span class="attribute">' + begin.substr(1, begin.length - 2) + '</span>='
            }
            if (mid) {
              return ',<span class="attribute">' + mid.substr(1, begin.length - 2) + '</span>='
            }
          }));
          break;
        case 'include':
          buf.push('<span class="keyword">include</span><span class="string">' + escape(src.replace(/^include/, '')) + '</span>');
          break;
        case 'extends':
          buf.push('<span class="keyword">extends</span><span class="string">' + escape(src.replace(/^extends/, '')) + '</span>');
          break;
        case 'block':
          buf.push('<span class="keyword">block</span>' + escape(src.replace(/^block/, '')));
          break;
        case 'mixin':
          buf.push('<span class="keyword">mixin</span>' + highlightJavaScript(src.replace(/^mixin/, '')));
          break;
        case 'call':
          buf.push('<span class="keyword">+</span>' + highlightJavaScript(src.replace(/^\+/, '')));
          break;
        case 'eos':
          break;
        default:
          buf.push('<span class="' + tok.type + '">' + escape(src) + '</span>');
      }
    }
  }
  return buf.join('');
};
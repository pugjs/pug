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

var inputs = document.getElementsByClassName('input')

console.dir(inputs)
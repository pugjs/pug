var t = require('babel-types');
var stringify = require('js-stringify');

function isPugAssignment(path) {
  if (!t.isAssignmentExpression(path)) {
    return;
  }
  if (!t.isIdentifier(path.get('left')) ||
      path.get('left.name').node !== 'pug_html') {
    return;
  }
  if (!t.isBinaryExpression(path.get('right')) ||
      !t.isIdentifier(path.get('right.left')) ||
       path.get('right.left.name').node !== 'pug_html') {
    return;
  }
  return true;
}

module.exports = function () {
  return {
    visitor: {
      ExpressionStatement(path) {
        // only lists of assignments need compaction
        if (!path.inList) {
          return;
        }
        let first = path.get('expression');
        
        // compaction is started only upon a specific pug buffer assignment
        if (!isPugAssignment(first)) {
          return;
        }
        
        // the first assignment in a list was found.
        // compact siblings (max N)
        let N = 100;
        let fragment = [t.identifier('pug_html')];
        let litSerie = false
        let litValue = '';
        let bufferNode = first.get('right.right').node;
        if (t.isStringLiteral(bufferNode)) {
          litSerie = true;
          litValue = bufferNode.value;
        } else {
          fragment.push(bufferNode);
        }

        let sibling = path.getSibling(path.key + 1);
        let count = 0;
        let expr;
        while (--N>0 &&t.isExpressionStatement(sibling) && isPugAssignment(expr = sibling.get('expression'))) {
          count++;
          bufferNode = expr.get('right.right').node;
          if (t.isStringLiteral(bufferNode)) {
            litSerie = true;
            litValue += bufferNode.value;
          } else {
            if (litSerie) {
              const lit = t.stringLiteral(litValue);
              lit.extra = { rawValue: litValue, raw: stringify(litValue)}
              fragment.push(lit);
              litSerie = false;
              litValue = '';
            }
            fragment.push(bufferNode)
          }
          sibling.remove();
          sibling = path.getSibling(path.key + 1);
        }

        if (count == 0) {
          return;
        }

        if (litSerie) {
          const lit = t.stringLiteral(litValue);
          lit.extra = { rawValue: litValue, raw: stringify(litValue)}
          fragment.push(lit);
        }

        let op = fragment.reduce(function(acc, val) {
          return t.binaryExpression('+', acc, val); 
        });

        first.get('right').replaceWith(op)

      }
    }
  };
}

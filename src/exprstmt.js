module homunculus from 'homunculus';

import join from './join';
import ignore from './ignore';

var Token = homunculus.getClass('token', 'css');
var Node = homunculus.getClass('node', 'css');

function exprstmt(node, fnHash, globalFn, varHash, globalVar) {
  return eqstmt(node, fnHash, globalFn, varHash, globalVar);
}

function eqstmt(node, fnHash, globalFn, varHash, globalVar) {
  if(node.name() == Node.EQSTMT) {
    var rel = relstmt(node.first(), fnHash, globalFn, varHash, globalVar);
    var next = node.leaf(1);
    var token = next.token();
    switch(token.content()) {
      case '==':
        return rel == relstmt(node.last(), fnHash, globalFn, varHash, globalVar);
      case '!=':
        return rel != relstmt(node.last(), fnHash, globalFn, varHash, globalVar);
    }
  }
  return relstmt(node, fnHash, globalFn, varHash, globalVar);
}

function relstmt(node, fnHash, globalFn, varHash, globalVar) {
  if(node.name() == Node.RELSTMT) {
    var add = addstmt(node.first(), fnHash, globalFn, varHash, globalVar);
    var next = node.leaf(1);
    var token = next.token();
    switch(token.content()) {
      case '>':
        return add > addstmt(node.last(), fnHash, globalFn, varHash, globalVar);
      case '>=':
        return add >= addstmt(node.last(), fnHash, globalFn, varHash, globalVar);
      case '<':
        return add < addstmt(node.last(), fnHash, globalFn, varHash, globalVar);
      case '<=':
        return add <= addstmt(node.last(), fnHash, globalFn, varHash, globalVar);
    }
  }
  return addstmt(node, fnHash, globalFn, varHash, globalVar);
}

function addstmt(node, fnHash, globalFn, varHash, globalVar) {
  if(node.name() == Node.ADDSTMT) {
    var mtpl = mtplstmt(node.first(), fnHash, globalFn, varHash, globalVar);
    var next = node.leaf(1);
    var token = next.token();
    switch(token.content()) {
      case '+':
        return mtpl + mtplstmt(node.last(), fnHash, globalFn, varHash, globalVar);
      case '-':
        return mtpl + mtplstmt(node.last(), fnHash, globalFn, varHash, globalVar);
    }
  }
  return mtplstmt(node, fnHash, globalFn, varHash, globalVar);
}

function mtplstmt(node, fnHash, globalFn, varHash, globalVar) {
  if(node.name() == Node.MTPLSTMT) {
    var postfix = postfixstmt(node.first(), fnHash, globalFn, varHash, globalVar);
    var next = node.leaf(1);
    var token = next.token();
    switch(token.content()) {
      case '*':
        return postfix * mtplstmt(node.last(), fnHash, globalFn, varHash, globalVar);
      case '/':
        return postfix / mtplstmt(node.last(), fnHash, globalFn, varHash, globalVar);
    }
  }
  return postfixstmt(node, fnHash, globalFn, varHash, globalVar);
}

function postfixstmt(node, fnHash, globalFn, varHash, globalVar) {
  if(node.name() == Node.POSTFIXSTMT) {
    var prmr = prmrstmt(node.first(), fnHash, globalFn, varHash, globalVar);
    var next = node.leaf(1);
    var token = next.token();
    switch(token.content()) {
      case '++':
        return prmr.value++;
      case '--':
        return prmr.value--;
    }
  }
  return prmrstmt(node, fnHash, globalFn, varHash, globalVar).value;
}

function prmrstmt(node, fnHash, globalFn, varHash, globalVar) {
  var token = node.first().token();
  var s = token.content();
  switch(token.type()) {
    case Token.VARS:
      var k = s.replace(/^[$@]\{?/, '').replace(/}$/, '');
      return varHash[k] || globalVar[k] || {};
    case Token.NUMBER:
      return { value: parseFloat(s) };
    case Token.STRING:
      return { value: s };
    default:
      if(s == '(') {
        return { value: exprstmt(node.leaf(1), fnHash, globalFn, varHash, globalVar) };
      }
      else if(s == '[') {
        var arr = [];
        node.leaves().forEach(function(item) {
          if(item.name() == Node.VALUE) {
            var token = item.first().token();
            var s = token.content();
            if(token.type() == Token.VARS) {
              arr.push(varHash[k] || globalVar[k] || {}).value;
            }
            else if(token.type() == Token.NUMBER) {
              arr.push(parseFloat(s));
            }
            else {
              arr.push(s);
            }
          }
        });
        return { value: arr };
      }
  }
}

export default exprstmt;
module homunculus from 'homunculus';

import join from './join';
import ignore from './ignore';
import exprstmt from './exprstmt';
import Tree from './Tree';
import preVar from './preVar';

var Token = homunculus.getClass('token', 'css');
var Node = homunculus.getClass('node', 'css');

export default function forstmt(node, ignores, index, varHash, globalVar, fnHash, globalFn, styleHash, styleTemp, selectorStack, map) {
  //循环引用fix
  if(Tree.hasOwnProperty('default')) {
    Tree = Tree.default;
  }
  //忽略掉整个for节点
  ignore(node, ignores, index);
  var temp = node.leaf(3);
  var isIn = temp && temp.isToken() && temp.token().content() == 'in';
  var isOf = !isIn && temp && temp.isToken() && temp.token().content() == 'of';
  var s;
  var block;
  var res;
  if(isIn) {
    //
  }
  else if(isOf) {
    //
  }
  else {
    //保存索引，存储空白符
    var temp = ignore(node.first(), ignores, index);
    s = temp.res;
    index = temp.index;
    temp = ignore(node.leaf(1), ignores, index);
    s += temp.res;
    index = temp.index;
    //执行for的3个语句，判断是否循环用最后1个
    //先进行第1个赋值语句，可能为空
    if(node.leaf(2).name() == Node.VARSTMT) {
      preVar(node.leaf(2), ignores, index, varHash, globalVar);
    }
    temp = ignore(node.leaf(2), ignores, index);
    s += temp.res;
    index = temp.index;
    //第2个判断语句可能为空，默认条件true
    temp = ignore(node.leaf(3), ignores, index);
    s += temp.res;
    index = temp.index;
    var loop = true;
    var lindex = 4;
    var no2 = true;
    if(node.leaf(3).name() != Node.TOKEN) {
      loop = exprstmt(node.leaf(3), fnHash, globalFn, varHash, globalVar);
      lindex = 5;
      temp = ignore(node.leaf(4), ignores, index);
      s += temp.res;
      index = temp.index;
      no2 = false;
    }
    //第3个循环执行语句也可能为空
    temp = ignore(node.leaf(lindex), ignores, index);
    s += temp.res;
    index = temp.index;
    var no3 = true;
    if(node.leaf(lindex).name() != Node.TOKEN) {
      lindex++;
      no3 = false;
    }
    //)
    temp = ignore(node.leaf(lindex), ignores, index);
    s += temp.res;
    index = temp.index;
    //{block}
    block = node.leaf(lindex + 1);
    //区分首次循环，后续忽略换行和初始化
    var first = true;
    while(loop) {
      if(first) {
        //block的{
        temp = ignore(block.first(), ignores, index);
        s += temp.res;
        index = temp.index;
        res = s;
      }
      //block内容
      for(var j = 1, len = block.size(); j < len - 1; j++) {
        var tree = new Tree(
          ignores,
          index,
          varHash,
          globalVar,
          fnHash,
          globalFn,
          styleHash,
          styleTemp,
          selectorStack,
          map,
          true
        );
        temp = tree.join(block.leaf(j));
        res += temp.res;
        index = temp.index;
      }
      //block的}
      temp = ignore(block.last(), ignores, index);
      res += temp.res;
      index = temp.index;
      //判断循环是否继续
      no3 || exprstmt(node.leaf(lindex - 1), fnHash, globalFn, varHash, globalVar);
      no2 || (loop = exprstmt(node.leaf(3), fnHash, globalFn, varHash, globalVar));
      first = false;
    }
  }
  return { res, index };
};
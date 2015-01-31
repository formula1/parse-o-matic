/*
Tests
-Output matches desired output
-Maximum amount of time
-JSHint
-Phantom
-Performance

Create a transform constructor
-Able to create properties in constructor

Create transform function
-Get a chunk
-do stuff to the chunk
--
-push a new chunk
-call done

Create flush function
-push a random chunk


Iterate 0 to BigLimit

for Each Item
-go from 0 to limit-1
--if current item > limit - 1
---create a new item

Next Try
-parent row ++
-if curpool > limiter , prev row++, rebuild

*/

var variable_types = [
  "Array",
  "String",
  "Number"
];
var properties = 	Object.keys(Array.prototype)
.concat(Object.keys(String.prototype))
.concat(Object.keys(Number.prototype));

var stateVariables = ["push"];

var variables = [
"chunk",
"encoding",
"parseInt"
];

var Pool = require("./pool");

var state = "fresh";
var rebuild = false;
var pool = new Pool();

function runIt(header, footer, newPool){
  if(newPool) pool.setPool(newPool);
  console.log(newPool);
  var ret = header+" chunk = chunk.toString(\"utf8\"); ";
  setNextItem("fresh");
  var l = pool.length;
  for(var i =0;i<l;i++){
    ret += " "+getNextItem()+" ";
  }
  ret += finisher()+footer;
  return {trial:ret,pool:pool};
}

function finisher(){
  var type;
  if(pool.getNext(2)){
    type = pool.getNext(variables.length);
    return "done("+variables[type]+");";
  }else{
    type = pool.getNext(stateVariables.length);
    return "done( this."+stateVariables[type]+");";
  }
}

function setNextItem(type){
  state = type;
}

function getNextItem(){
  switch(state){
    case "fresh": return doNextFresh();
    case "property": return doNextProperty();
    case "value": return doNextValue();
    case "part": return doNextPart();
    case "argument": return doNextArgument();
  }
}

function doNextFresh(){
  setNextItem("part");
  var type = pool.getNext(4);
  switch(type){
    case 0: return setStateVariable();
    case 1: return createVariable();
    case 2: return setVariable();
    case 4: return runFunction();
  }
}

function runFunction(){
  var type = pool.getNext(variables.length);
  var ret = variables[type];
  var len = pool.getNext(12);
  while(len--){
    ret += "."+doNextProperty();
  }
  ret += "(";
  setNextItem("arguments");
  return variables[type];
}


function doNextProperty(){
  var type = pool.getNext(properties.length);
  setNextItem("part");
  return properties[type];
}

function doNextPart(){
  var type = pool.getNext(10);
  switch(type){
    case 0: setNextItem("fresh"); return ";";
    case 1: setNextItem("property"); return ".";
    case 2: setNextItem("value"); return "+";
    case 4: setNextItem("value"); return "-";
    case 5: setNextItem("value"); return "==";
    case 6: setNextItem("value"); return "!=";
    case 7: setNextItem("value"); return "===";
    case 8: setNextItem("value"); return "!==";
    case 9: setNextItem("argument"); return "(";
  }
}

function doNextArgument(){
  var len = getNext(5);
  var ret = "";
  while(len--){
    ret += doNextValue()+(len?", ":" ");
  }
  setNextItem("part");
  return ret+")";
}

function doNextValue(){
  setNextItem("value");
  var type = pool.getNext(4);
  switch(type){
    case 0: return createString();
    case 1: return createNumber();
    case 2: return getStateVariable();
    case 3: return getVariable();
  }
}

function createString(){
  var len = pool.getNext(64);
  var ret = "\"";
  while(len--){
    if(pool.getNext(2) === 0){
      ret += "\\u00"+(33+pool.getNext(93)).toString(16);
    }else{
      ret += "\\u00"+(9+pool.getNext(2)).toString(16);
    }
  }
  return ret+"\"";
}

function createNumber(){
  return pool.getNext(64).toString();
}


//fresh only
function setStateVariable(){
  var type = pool.getNext(stateVariables.length);
  setNextItem("value");
  return "this."+stateVariables[type]+" =";
}

//function arguments, value,
function getStateVariable(){
  var which = pool.getNext(stateVariables.length);
  return "this."+stateVariables[which];
}


//fresh only
function createVariable(){
  var thevar = "";
  var l = variables.length;
  while(l--){thevar += "a";}
  variables.push(thevar);
  return "var "+thevar+";";
}

//fresh only
function setVariable(){
  var which = pool.getNext(variables.length);
  setNextItem("value");
  return variables[which]+" = ";
}

//function arguments, value,
function getVariable(){
  var which = pool.getNext(variables.length);
  return variables[which];
}

module.exports.runIt = runIt;

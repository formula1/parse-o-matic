var fs = require("fs");
var boilerplate = fs.readFileSync(__dirname+"/transform-boiler.js");
boilerplate = boilerplate.toString().split("//=====BreakPoint");
var id = Date.now()+" "+Math.floor(100000*Math.random());
var child_process = require("child_process");
var async = require("async");
var fun_things = require(__dirname+'/fun things.js');

var tests = [
  [
  "spawn",
  "jshint",
  [__dirname+"/temp/transform"+id+".js"]
  ]
];

console.log("ch");

function handleInfo(mess){
  if(mess.inputfile){
    tests = tests.concat([
      "fork",
      __dirname+"/temp/transform"+id+".js",
      [mess.inputfile,"transform"+id+"-test.js"]
    ]);
  }
  if(mess.testcmd){
    tests = tests.concat([
      "spawn",
      mess.testcmd,
      [__dirname+"/temp/transform"+id+"-test.js"]
    ]);
  }
  if(mess.validCopy){
    tests = tests.concat([
      "spawn",
      "cmp", [
      "--silent",
      __dirname+"/temp/transform"+id+"-test.js",
      mess.validCopy,
      "||",
      "error_exit \"files are different\""
      ]
    ]);
  }
}

function runChild(item,next){
  var ch = child_process[item[0]](item[1],item[2]);
  var to = setTimeout(function(){
    ch.kill("timeout");
    next("timedout");
  },1000);
  ch.stderr.on('data', function (data) {
    clearTimeout(to);
    next(e);
  });
  ch.on("error",function(e){
    clearTimeout(to);
    next(e);
  });
  ch.on("exit", function(code,signal){
    if(signal) return;
    next();
  });
}

process.on("message",function(mess){
  console.log(mess);
  if(mess.cmd == "info"){
    return handleInfo(mess);
  }
  var ret;
  if(mess.cmd == "init"){
    console.log("poo"+mess.pool);
    console.log("rec init");
    ret = fun_things.runIt(boilerplate[0],boilerplate[1],mess.pool);
    return process.send({cmd:"init",pool:ret.pool.getPool()});
  }
  if(mess.cmd == "pool"){
    try{
      ret = fun_things.runIt(boilerplate[0],boilerplate[1],mess.pool);
    }catch(e){
      return process.send({cmd:"fail"});
    }
    fs.writeFileSync(
      __dirname+"/temp/transform"+id+".js",
      ret.trial
    );
    async.eachSeries(tests,runChild,function(err,result){
      if(err){
        try{
          fs.unlinkSync(__dirname+"/temp/transform"+id+"-test.js");
        }catch(e){
          console.log(e);
        }
        return process.send({cmd:"fail",pool:ret.pool.getPool()});
      }
      fs.renameSync(
        __dirname+"/temp/transform"+id+"-test.js",
        __dirname+"/success/transform"+id+"-test.js"
      );
      process.send({cmd:"success"});
    });
  }
});

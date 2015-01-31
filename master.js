var Pool = require("./pool");
var pool = new Pool();
var fs = require("fs");
function run(cluster,inputfile,validcopy,testcommand){
// Fork workers.
cluster.on('exit', function(worker, code, signal) {
  if(signal == "did your duty"){
    console.log("we have a few successes");
  }
  if(Object.keys(cluster.workers).length===0){
    fs.writeFile(
      __dirname+"/poolCache.json",
      JSON.stringify(pool.getPool()),
      function(){
        console.log("done");
      }
    );
  }
});
var queue = [];
cluster.on('online', function(worker) {
  console.log("online");
  /*
  if(pool.needLimit){
    if(queue.length === 0){
      console.log("init");
      worker.send({cmd:"init",pool:pool.getPool()});
      queue.push(worker);
    }else{
      queue.push(worker);
    }
  }
  */
  worker.send({
    cmd:"pool",
    pool:pool.addIteration()
  });
  worker.on('message', function(mess){
    if(mess.cmd == "init"){
      pool.setPool(mess.pool);
      var w;
      while(queue.length){
        queue.pop().send({
          cmd:"pool",
          pool:pool.addIteration()
        });
      }
      return;
    }
    if(mess.cmd == "fail"){
      /*
      if(pool.needLimit){
        pool.setPool(mess.pool);
        if(pool.needLimit){
          queue.push(worker);
        }else{
          while(queue.length){
            queue.pop().send({
              cmd:"pool",
              pool:pool.addIteration()
            });
          }
        }
        return;
      }*/
      return worker.send({
        cmd:"pool",
        pool:pool.addIteration()
      });
    }
    if(mess.cmd == "success"){
      worker.kill("did your duty");
    }
  });
  worker.send({
    cmd:"info",
    inputfile:inputfile,
    testcmd:testcommand,
    validCopy:validcopy
  });
});
}

module.exports.run = run;
module.exports.pool = pool;

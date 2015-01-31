var cluster = require("cluster");
var numCPUs = require('os').cpus().length;
var fs = require("fs");
var master = require("./master");

function run(inputfile,validcopy,testcommand){
  if (cluster.isMaster) {
    for (var i = 0; i < numCPUs; i++) {
      cluster.fork();
      console.log("foking");
    }
    master.run(cluster,inputfile,validcopy,testcommand);
  } else {
    require("./child");
  }
}

module.exports = run;

if(!module.parent){
  if(cluster.isMaster){
    try{
      master.pool.setPool(JSON.parse(fs.readFileSync(__dirname+"/poolCache.json")));
    }catch(e){
      console.log(e);
    }
    run(process.argv[0],process.argv[1],process.argv[2]);
  }else{
    run();
  }
}

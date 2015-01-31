
function Pool(ari){
  this.pool = [];
  this.cursor = 0;
  this.iteration = 0;
  Object.defineProperty(this,"length",{
    get:function(){
      return this.pool.length;
    }
  });
  Object.defineProperty(this,"needLimit",{
    get:function(){

      return !this.pool.length || this.pool[this.pool.length-1].limit === false;
    }
  });
}
Pool.prototype.setPool = function(newpool){
  this.pool = newpool;
};

Pool.prototype.getPool = function(){
  return this.pool;
};

Pool.prototype.addIteration = function (){
  var l = 0;//this.pool.length;
  var overflow;
  do{
    overflow = false;
    if(!this.pool[l]){
      this.pool[l] = {item:0,limit:false};
      break;
    }
    this.pool[l].item++;
    if(this.pool[l].item == 100){//this.pool[l].limit){
      if(!this.pool[l+1]){
        this.pool.push({item:0,limit:false});
      }
      this.pool[l].item = 0;
      overflow = true;
      /*
      if(l===0){
        this.pool[l].item = 0;
      }else{
        this.pool[l] = {item:0,limit:false};
      }
      */
    }
    l++;
  }while(overflow);
  this.iteration++;
  return this.pool;
};


Pool.prototype.getNext = function(limiter){
  if(!this.pool[this.cursor]){
    this.pool[this.cursor] = {item:0,limit:limiter};
  }
  if(this.pool[this.cursor].limit !== limiter){
    this.pool[this.cursor].limit = limiter;
  }
  var ret = this.pool[this.cursor].item;
  this.cursor++;
  return ret;
};

module.exports = Pool;

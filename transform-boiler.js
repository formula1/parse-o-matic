var Transform = require("stream").Transform;
var util = require("util");

function transform(options){
	Transform.call(this,options);
}
util.extend(transform,Transform);

transform.prototype._transform = function (data, encoding, callback) {

//=====BreakPoint

}

module.exports = transform;

if(!module.parent){
	var fs = require("fs");
	var input = fs.createReadStream(process.argv[0]);
	var output = fs.createWriteStream(process.argv[1]);
	input.pipe(transform).pipe(output);
}

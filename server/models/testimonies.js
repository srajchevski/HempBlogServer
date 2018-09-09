//scheme for post
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var scheme = {
    name: {type:String, required:true},
    profession: {type:String, required:true},
    content: {type:String, required:true},
    age: {type:Number, required:true},
    date_added: {type:Date, default:Date.now()}
};
var TSchema   = new Schema(scheme);
TSchema.index({
    "name": "text",
    "profession": "text"
});
module.exports = mongoose.model('testimonies', TSchema);
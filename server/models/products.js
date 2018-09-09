//scheme for post
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var scheme = {
    name: {type:String, required:true},
    description: {type:String, required:true},
    image: {type:String, required:true},
    date_added: {type:Date, default:Date.now()}
};
var PSchema   = new Schema(scheme);
PSchema.index({
    "name": "text"
});
module.exports = mongoose.model('products', PSchema);
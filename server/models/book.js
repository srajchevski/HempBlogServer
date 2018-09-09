//scheme for post
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var scheme = {
    name: {type:String, required:true},
    email: {type:String, required:true},
    category: {type:String, default:"new"},
    date_added: {type:Date, default:Date.now()}
};
var BSchema   = new Schema(scheme);
BSchema.index({
    "name": "text",
    "email": "text"
});
module.exports = mongoose.model('books', BSchema);
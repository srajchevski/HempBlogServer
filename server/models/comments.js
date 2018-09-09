//scheme for post
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var scheme = {
    username: {type:String, required:true},
    content: {type:String, required:true},
    email: {type:String, required:true},
    category: {type:String, default:"new"},
    post_id: {type:String, required:true},
    date_added: {type:Date, default:Date.now()}
};
var CommentSchema   = new Schema(scheme);
CommentSchema.index({
    "username": "text"
});
module.exports = mongoose.model('comments', CommentSchema);
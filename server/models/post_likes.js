//scheme for post
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var scheme = {
    ip: {type:String, required:true},
    post_id: {type:String, required:true},
    date_added: {type:Date, default:Date.now()}
};
var LikeSchema   = new Schema(scheme);

module.exports = mongoose.model('post_likes', LikeSchema);
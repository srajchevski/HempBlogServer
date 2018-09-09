//scheme for post
var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var scheme = {
	title: {type:String, required:true},
	category: {type:String, required:true},
	url: {type:String, required:true},
	language: {type:String, required:true},
	content: {type:String, required: true},
	post_image: {type:String, required:true},
	tags: {type:[String], required: true},
    likes: {type:Number, default:0},
	shares: {type:Number, default:0},
	views: {type:Number, default:0},
	previous_post: {type:String, required:false},
	next_post: {type:String, required:false},
	date_added: {type:Date, default:Date.now()}
};
var PostSchema   = new Schema(scheme);
PostSchema.index({
	"title": "text",
	"category": "text",
	"url": "text"
});
module.exports = mongoose.model('posts', PostSchema);
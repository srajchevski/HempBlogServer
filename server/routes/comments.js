var express    = require('express');
var Comment = require('../models/comments');
var Post  = require('../models/post');
var mongoose = require('mongoose');
var router 	   = express.Router();
var emailCheck = require("email-check");
var validator = require('../additional_functions/validator');

//add comment
router.post('/', function(req, res) {
    var data = req.body;
    var valid = validator({
        username: {type: "string", required: true},
        content: {type: "string", required: true},
        email: {type: "string", required: true},
        post_id: {type: "string", required: true}
    }, data);

    if (valid != "") { // INVALID
        res.status(500).send({ error: valid });
    } else {
        // check if email is valid
        /*emailCheck(data.email)
        .then(function (r) {
            if (r) {*/
                var comment = new Comment();
                comment.username = data.username;
                comment.content  = data.content;
                comment.email    = data.email;
                comment.post_id  = data.post_id;

                comment.save(function (err, c) {
                    if (err)
                        res.status(500).send({error: err});
                    else
                        res.json(c); //success
                });
            /*} else {
                res.status(500).send({ error: "Invalid email!"});
            }
        }).catch(function (err) {
                res.status(500).send({ error: "Invalid mail!" });
        });*/
    }
});

// return all comments
router.get('/',function(req, res) {
    var find = {};
    var sort = {};
    if (req.query.url) {
        Post.findOne({url:req.query.url}).exec(function(err, p) {
            if (err)
                res.status(500).send({ error: err });
            else if (!p)
                res.status(500).send({ error: "Post doesn't exist" });
            else {
                Comment.find({post_id: p._id, category: "approved"}).sort({date_added:-1}).exec(function(err, c) {
                    if (err)
                        res.status(500).send({ error: err });
                    else
                        res.json(c);
                });
            }
        });
    } else {
        if (req.query.search) {
            find = { "$text": { "$search":  req.query.search}},{ score: { $meta: "textScore" }};
        }
        if (req.query.from && req.query.to) {
            find.date_added = {$gte: new Date(parseInt(req.query.from)*1000), $lte: new Date(parseInt(req.query.to)*1000)};
        }
        if (req.query.category) {
            find.category = req.query.category;
        }
        if (req.query.post_id) {
            find = {post_id: req.query.post_id, category: "approved"};
        }

        Comment.find(find).sort({date_added:-1}).exec(function(err, c) {
            if (err)
                res.status(500).send({ error: err })
            else
                res.json(c);
        });
    }
});


// dis/approve comment
router.put('/:c_id',function(req, res) {
    Comment.findById(req.params.c_id, function(err, c) {
        if (err)
            res.status(500).send({ error: err });
        else if (!c)
            res.status(500).send({error: "Comment doesn't exist"});
        else {
            if (req.body.approved==true)
                c.category = "approved";
            else
                c.category = "disapproved";

            c.save(function (err, com) {
                if (err)
                    res.status(500).send({error: err});
                else
                    res.json(com); //success
            });
        }
    });
});

//delete comment
router.delete('/:p_id', function(req,res){
    /*Post.findOne({"_id":req.params.p_id},function(err, p) {
        if (err)
            res.status(500).send({ error: err });
        else if(!p) {
            res.status(500).send({ error: "Post doesn't exist"});
        }
        else {
            //if (p._id == req.session.user._id || req.session.user.type == "admin") {
            p.remove(function (err) {
                if (err)
                    res.status(500).send({error: err});
                else {
                    res.json({status: 200,msg: "OK"});
                }
            });
        }
    });*/
});


module.exports=router;

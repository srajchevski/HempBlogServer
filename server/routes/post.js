var express    = require('express');
var Post  = require('../models/post');
var Likes = require('../models/post_likes');
var mongoose = require('mongoose');
var router 	   = express.Router();
var emailCheck = require("email-check");
var fs = require('fs');
var validator = require('../additional_functions/validator');
var Busboy = require('busboy');

//add post
router.post('/', function(req, res) {
    var data = {};
    var post=new Post();
    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        var path = "server/images/"+post._id + "_image"+"."+mimetype.split('/')[1];
        data.post_image = "http://localhost:8080/"+path;
        file.pipe(fs.createWriteStream(path));
    });
    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
        data[fieldname] = val;
    });
    busboy.on('finish', function() {
        /*emailCheck(data.email)//data.email
         .then(function (r) {
         if (r) {*/
        var q = Post.findOne({$or: [{'title': data.title}, {'url': data.url}]});
        q.exec(function (err, u) {
            if (err)
                res.send(err);
            else if (u == null) {
                //validate
                var valid = validator({
                    title: {type: "string", required: true},
                    category: {type: "string", required: true},
                    url: {type: "string", required: true},
                    content: {type:"string", required:true},
                    language: {type: "string", required: true},
                    tags: {type: "string", required: true},
                    post_image: {type: "string", required: true}
                }, data);

                if (valid != "") { // INVALID
                    res.status(500).send({error: valid});
                } else { // VALID
                    //upload pic
                    var tags = JSON.parse(data.tags);
                    data.tags = tags;

                    Object.keys(data).map(function(key) {
                            post[key] = data[key];
                    });

                    post.save(function (err, u) {
                        if (err)
                            res.status(500).send({error: err});
                        else
                            res.json(u); //success
                    });
                }
            }
            else
                res.status(500).send({error: "A post with this title/URL already exists!"});
        });
    });
    /*} else {
     res.status(500).send({ error: "Invalid email!"});
     }
     })
     .catch(function (err) {
     res.status(500).send({ error: "Invalid mail!" });
     });
     });*/
    req.pipe(busboy);
});

//update post
router.put('/:p_id',function(req, res) {
    Post.findById(req.params.p_id, function(err, post) {
        if (err)
            res.status(500).send({ error: err });
        else if (!post) {
            res.status(500).send({ error: "Post doesn't exist" });
        }
        else {
            var data = {};
            var busboy = new Busboy({ headers: req.headers });
            busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                var path = "server/images/"+req.params.p_id + "_image"+"."+mimetype.split('/')[1];
                data.mimetype = mimetype;
                data.post_image = "http://localhost:8080/"+path;
                file.pipe(fs.createWriteStream(path));
            });
            busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
                data[fieldname] = val;
            });
            busboy.on('finish', function() {
                var valid = validator({
                    title: {type: "string", required: true},
                    category: {type: "string", required: true},
                    url: {type: "string", required: true},
                    content: {type:"string", required:true},
                    tags: {type: "string", required: true},
                    language: {type: "string", required: true}
                }, data);

                if (valid != "") { // INVALID
                    res.status(500).send({ error: valid })
                } else { // VALID
                    var tags = JSON.parse(data.tags);
                    data.tags = tags;

                    Object.keys(data).map(function(key) {
                        if (key != "_id") {
                            post[key] = data[key];
                        }
                    });

                    post.save(function (err, p) {
                        if (err)
                            res.status(500).send({error: err});
                        else
                            res.json(p); //success
                    });
                }
            });
            req.pipe(busboy);
        }
    });
});

//increment post views
router.put('/views/:url',function(req, res) {
    Post.findOne({url:req.params.url}).exec(function(err, p) {
        if (err)
            res.status(500).send({ error: err });
        else if (!p)
            res.status(500).send({error: "Post doesn't exist"});
        else {
            p.views++;
            p.save(function (err, u) {
                if (err)
                    res.status(500).send({error: err});
                else
                    res.json(u); //success
            });
        }
    });
});
// like / dislike (by IP)
router.put('/likes/:p_id',function(req, res) {
    Post.findById(req.params.p_id, function(err, p) {
        if (err)
            res.status(500).send({ error: err });
        else if (!p)
            res.status(500).send({error: "Post doesn't exist"});
        else {
            // get IP and check if exists
            //var ip = req.connection.remoteAddress;
            var ip = "192.168.0.1";
            Likes.findOne({ip: ip, post_id: req.params.p_id}).exec(function(err, l) {
                if (err) {
                    res.status(500).send({error: err});
                } else if (!l) {
                    // create like
                    var like = new Likes();
                    like.ip = ip;
                    like.post_id = req.params.p_id;
                    like.save(function(err, lk) {
                       if (err)
                           res.status(500).send({error: err});
                       else {
                           p.likes++;
                           p.save(function (err, u) {
                               if (err) {
                                   res.status(500).send({error: err});
                               }
                               else
                                   res.json({status:200, msg:"OK"}); //success
                           });
                       }
                    });
                } else {
                    l.remove(function (err) {
                        if (err)
                            res.status(500).send({error: err});
                        else {
                            p.likes--;
                            p.save(function (err, u) {
                                if (err) {
                                    res.status(500).send({error: err});
                                }
                                else
                                    res.json({status:200, msg:"OK"}); //success
                            });
                        }
                    });
                }
            });
        }
    });
});

// return all posts
router.get('/',function(req, res) {
    var find = {};
    var sort = {};
    var limit= 0;
    if (req.query.search) {
        find = { "$text": { "$search":  req.query.search}}, { score: { $meta: "textScore" }};
    }
    if (req.query.from && req.query.to) {
        find.date_added = {$gte: new Date(parseInt(req.query.from)*1000), $lte: new Date(parseInt(req.query.to)*1000)};
    }
    if (req.query.category) {
        find.category = req.query.category;
    }
    if (req.query.limit) {
        limit = parseInt(req.query.limit);
    }

    Post.find(find).sort({date_added:-1}).limit(limit).exec(function(err, p) {
        if (err)
            res.status(500).send({ error: err });
        else
            res.json(p);
    });
});
// return single post
router.get('/:p_id',function(req, res) {
    Post.find().sort({date_added:-1}).exec(function(err, posts) {
        if (err)
            res.status(500).send({ error: err })
        else {
            var post = null;
            for (var i=0; i< posts.length; i++) {
                if (posts[i]._id == req.params.p_id) {
                    post = posts[i];
                    if (i==0) {
                        post.previous_post = posts[posts.length-1].url;
                        post.next_post = posts[i+1].url;
                    } else if (i==posts.length-1) {
                        post.previous_post = posts[i-1].url;
                        post.next_post = posts[0].url;
                    } else {
                        post.previous_post = posts[i-1].url;
                        post.next_post = posts[i+1].url;
                    }
                    break;
                }
            }
            if (!post) {
                res.status(500).send({error: "Post doesn't exist"});
            } else {
                res.json(post);
            }
        }
    });
});
// return single post by url
router.get('/url/:url',function(req, res) {
    Post.find().sort({date_added:-1}).exec(function(err, posts) {
        if (err)
            res.status(500).send({ error: err })
        else {
            var post = null;
            for (var i=0; i< posts.length; i++) {
                if (posts[i].url == req.params.url) {
                    post = posts[i];
                    if (i==0) {
                        post.previous_post = posts[posts.length-1].url;
                        post.next_post = posts[i+1].url;
                    } else if (i==posts.length-1) {
                        post.previous_post = posts[i-1].url;
                        post.next_post = posts[0].url;
                    } else {
                        post.previous_post = posts[i-1].url;
                        post.next_post = posts[i+1].url;
                    }
                    break;
                }
            }
            if (!post) {
                res.status(500).send({error: "Post doesn't exist"});
            } else {
                res.json(post);
            }
        }
    });
});

//delete post
router.delete('/:p_id', function(req,res){
    Post.findOne({"_id":req.params.p_id},function(err, p) {
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
            /*} else {
             res.status(500).send({ error: "Current user doesn't have permission for this action"});
             }*/
        }
    });
});


module.exports=router;

var express    = require('express');
var Questions  = require('../models/questions');
var mongoose = require('mongoose');
var router 	   = express.Router();
var emailCheck = require("email-check");
var fs = require('fs');
var validator = require('../additional_functions/validator');

//add question
router.post('/', function(req, res) {
    var data = req.body;
    var valid = validator({
        name: {type: "string", required: true},
        email: {type: "string", required: true},
        content: {type: "string", required: true},
    }, data);

    if (valid != "") { // INVALID
        res.status(500).send({ error: valid })
    } else {
        // check if email is valid
        /*emailCheck(data.email)
            .then(function (r) {
                if (r) {*/
                    var question = new Questions();
                    question.name     = data.name;
                    question.email    = data.email;
                    question.content  = data.content;

                    question.save(function (err, c) {
                        if (err)
                            res.status(500).send({error: err});
                        else
                            res.json(c); //success
                    });
               /* } else {
                    res.status(500).send({ error: "Invalid email!"});
                }
            }).catch(function (err) {
            res.status(500).send({ error: "Invalid mail!" });
        });*/
    }
});

//get questions
router.get('/', function(req, res) {
    var find = {};
    var sort = {};
    if (req.query.search) {
        find = { "$text": { "$search":  req.query.search}},{ score: { $meta: "textScore" }};
    }
    if (req.query.from && req.query.to) {
        find.date_added = {$gte: new Date(parseInt(req.query.from)*1000), $lte: new Date(parseInt(req.query.to)*1000)};
    }
    if (req.query.category) {
        find.category = req.query.category;
    }

    Questions.find(find).sort({date_added:-1}).exec(function(err, q) {
        if (err)
            res.status(500).send({ error: err });
        else
            res.json(q);
    });
});

// mark answered
router.put('/:q_id',function(req, res) {
    Questions.findById(req.params.q_id, function(err, q) {
        if (err)
            res.status(500).send({ error: err });
        else if (!q)
            res.status(500).send({error: "Question doesn't exist"});
        else {
            if (req.body.answered==true)
                q.category = "answered";

            q.save(function (err, qstn) {
                if (err)
                    res.status(500).send({error: err});
                else
                    res.json(qstn); //success
            });
        }
    });
});

module.exports=router;
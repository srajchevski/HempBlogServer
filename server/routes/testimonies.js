var express    = require('express');
var Testimonies  = require('../models/testimonies');
var mongoose = require('mongoose');
var router 	   = express.Router();
var emailCheck = require("email-check");
var fs = require('fs');
var validator = require('../additional_functions/validator');

// get all
router.get('/', function(req, res) {
    var find = {};
    var sort = {};
    if (req.query.search) {
        find = { "$text": { "$search":  req.query.search}},{ score: { $meta: "textScore" }};
    }
    if (req.query.from && req.query.to) {
        find.date_added = {$gte: new Date(parseInt(req.query.from)*1000), $lte: new Date(parseInt(req.query.to)*1000)};
    }

    Testimonies.find(find).sort({date_added:-1}).exec(function(err, t) {
        if (err)
            res.status(500).send({ error: err });
        else
            res.json(t);
    });
});
// get single / one
router.get('/:t_id', function(req, res) {
    Testimonies.findById(req.params.t_id).exec(function(err, t) {
        if (err)
            res.status(500).send({ error: err });
        if (!t)
            res.status(500).send({error: "Testimony doesn't exist."});
        else
            res.json(t);
    });
});
// create / add
router.post('/', function(req, res) {
    var data = req.body;
    if (data.age)
        data.age = parseInt(data.age);
    var valid = validator({
        name: {type: "string", required: true},
        profession: {type: "string", required: true},
        age: {type: "number", required: true},
        content: {type: "string", required: true}
    }, data);

    if (valid != "") { // INVALID
        res.status(500).send({ error: valid })
    } else {
        var t = new Testimonies();
        t.name = data.name;
        t.profession = data.profession;
        t.age = data.age;
        t.content = data.content;

        t.save(function (err, tst) {
            if (err)
                res.status(500).send({error: err});
            else
                res.json(tst); //success
        });
    }
});
// edit / update
router.put('/:t_id', function(req, res) {
    Testimonies.findById(req.params.t_id).exec(function(err, t) {
        if (err)
            res.status(500).send({ error: err });
        else if (!t)
            res.status(500).send({error: "Doesn't exist"});
        else {
            var data = req.body;
            if (data.age)
                data.age = parseInt(data.age);
            var valid = validator({
                name: {type: "string", required: true},
                profession: {type: "string", required: true},
                age: {type: "number", required: true},
                content: {type: "string", required: true}
            }, data);

            if (valid != "") { // INVALID
                res.status(500).send({ error: valid })
            } else {
                t.name = data.name;
                t.profession = data.profession;
                t.age = data.age;
                t.content = data.content;
                t.date_added = data.date_added;

                t.save(function (err, tst) {
                    if (err)
                        res.status(500).send({error: err});
                    else
                        res.json(tst); //success
                });
            }
        }
    });
});
// delete / remove
router.delete('/:t_id',function(req, res) {
    Testimonies.findById(req.params.t_id, function(err, t) {
        if (err)
            res.status(500).send({ error: err });
        else if (!t)
            res.status(500).send({error: "Doesn't exist"});
        else {
            t.remove(function (err) {
                if (err)
                    res.status(500).send({error: err});
                else
                    res.json({msg:"success"});
            });
        }
    });
});

module.exports=router;
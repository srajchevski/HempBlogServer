var express    = require('express');
var Book  = require('../models/book');
var mongoose = require('mongoose');
var router 	   = express.Router();
var emailCheck = require("email-check");
var fs = require('fs');
var validator = require('../additional_functions/validator');

//add
router.post('/', function(req, res) {
    var data = req.body;
    var valid = validator({
        name: {type: "string", required: true},
        email: {type: "string", required: true}
    }, data);

    if (valid != "") { // INVALID
        res.status(500).send({ error: valid })
    } else {
        // check if email is valid
        /*emailCheck(data.email)
         .then(function (r) {
         if (r) {*/
        var book = new Book();
        book.name     = data.name;
        book.email    = data.email;

        book.save(function (err, b) {
            if (err)
                res.status(500).send({error: err});
            else
                res.json(b); //success
        });
        /* } else {
         res.status(500).send({ error: "Invalid email!"});
         }
         }).catch(function (err) {
         res.status(500).send({ error: "Invalid mail!" });
         });*/
    }
});

//get
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

    Book.find(find).sort({date_added:-1}).exec(function(err, b) {
        if (err)
            res.status(500).send({ error: err });
        else
            res.json(b);
    });
});

// mark sent
router.put('/:b_id',function(req, res) {
    Book.findById(req.params.b_id, function(err, b) {
        if (err)
            res.status(500).send({ error: err });
        else if (!b)
            res.status(500).send({error: "Doesn't exist"});
        else {
            if (req.body.sent==true)
                b.category = "sent";

            b.save(function (err, bk) {
                if (err)
                    res.status(500).send({error: err});
                else
                    res.json(bk); //success
            });
        }
    });
});

module.exports=router;
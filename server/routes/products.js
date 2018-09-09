var express    = require('express');
var Product  = require('../models/products');
var mongoose = require('mongoose');
var router 	   = express.Router();
var emailCheck = require("email-check");
var fs = require('fs');
var validator = require('../additional_functions/validator');
var Busboy = require('busboy');

//add
router.post('/', function(req, res) {
    var data = {};
    var product=new Product();
    var busboy = new Busboy({ headers: req.headers });
    busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        var path = "server/images/"+product._id + "_image"+"."+mimetype.split('/')[1];
        data.image = "http://localhost:8080/"+path;
        file.pipe(fs.createWriteStream(path));
    });
    busboy.on('field', function(fieldname, val) {
        data[fieldname] = val;
    });
    busboy.on('finish', function() {
        Product.findOne({'name': data.title}).exec(function(err, p) {
            if (err)
                res.status(500).send(err);
            else if (!p) {
                //validate
                var valid = validator({
                    name: {type: "string", required: true},
                    description: {type: "string", required: true},
                    image: {type: "string", required: true}
                }, data);

                if (valid !== "") { // INVALID
                    res.status(500).send({error: valid});
                } else { // VALID
                    Object.keys(data).map(function(key) {
                        product[key] = data[key];
                    });

                    product.save(function (err, pd) {
                        if (err)
                            res.status(500).send({error: err});
                        else
                            res.json(pd); //success
                    });
                }
            }
            else
                res.status(500).send({error: "A product with this name already exists!"});
        });
    });
    req.pipe(busboy);
});

// edit / update
router.post('/:p_id', function(req, res) {
    Product.findById(req.params.p_id).exec(function(err, p) {
        if (err)
            res.status(500).send(err);
        else if (!p)
            res.status(500).send({ error: "Product doesn't exist" });
        else {
            var data = {};
            var busboy = new Busboy({ headers: req.headers });
            busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                var path = "server/images/"+product._id + "_image"+"."+mimetype.split('/')[1];
                data.image = "http://localhost:8080/"+path;
                file.pipe(fs.createWriteStream(path));
            });
            busboy.on('field', function(fieldname, val) {
                data[fieldname] = val;
            });
            busboy.on('finish', function() {
                var valid = validator({
                    name: {type: "string", required: true},
                    description: {type: "string", required: true}
                }, data);

                if (valid !== "") { // INVALID
                    res.status(500).send({error: valid});
                } else { // VALID
                    Object.keys(data).map(function(key) {
                        p[key] = data[key];
                    });

                    p.save(function (err, pd) {
                        if (err)
                            res.status(500).send({error: err});
                        else
                            res.json(pd); //success
                    });
                }
            });
            req.pipe(busboy);
        }
    });
});

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

    Product.find(find).sort({date_added:-1}).exec(function(err, p) {
        if (err)
            res.status(500).send({ error: err });
        else
            res.json(p);
    });
});

// get single / one
router.get('/:p_id', function(req, res) {
    Product.findById(req.params.p_id).exec(function(err, p) {
        if (err)
            res.status(500).send(err);
        else if (!p)
            res.status(500).send({error: "Product doesn't exist"});
        else
            res.json(p);
    });
});

// delete / remove
router.delete('/:p_id',function(req, res) {
    Product.findById(req.params.p_id, function(err, p) {
        if (err)
            res.status(500).send({ error: err });
        else if (!p)
            res.status(500).send({error: "Doesn't exist"});
        else {
            p.remove(function (err) {
                if (err)
                    res.status(500).send({error: err});
                else
                    res.json({msg:"success"});
            });
        }
    });
});

module.exports=router;
var express = require('express');
var tediousExpress = require('express4-tedious');
var connection = require("./secrets/db-config.json");
// var UserDataController = require("./services/UserDataController");
// var TYPES = require("express4-tedious").TYPES;
var TYPES = require("tedious").TYPES;
var jsonSQL = require("json-sql")({ valuesPrefix: "@" });

var app = express();
app.use(function (req, res, next) {
    req.sql = tediousExpress(connection);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});


var server = app.listen(process.env.PORT || 6969, function () {
    var port = server.address().port;
    console.log("asgard-data now running on port", port);
});


/**
 * Gets a user given an id.
 */
app.get("/users/:id/data", function (req, res) {
    // res.json({ yeet: "yote" });
    var userSelectSQL = jsonSQL.build(
        {
            type: "select",
            table: "Users",
            condition: [
                { YCA_ID: { $eq: req.params.id } }
            ]
        }
    );
    console.log("Getting user ", req.params.id);
    req.sql(userSelectSQL.query.replace(";", "") + " for json path, without_array_wrapper")
        .param('p1', req.params.id, TYPES.BigInt)
        .into(res, '{}');
});

// app.get("costcenters/:ccID", function(req, res) {
//     req.sql()
// });
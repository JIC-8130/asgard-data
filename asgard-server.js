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
    next();
});


var server = app.listen(process.env.PORT || 6969, function () {
    var port = server.address().port;
    console.log("asgard-data now running on port", port);
});


/**
 * Gets a user given an id.
 */
app.get("/user/:id", function (req, res) {
    // res.json({ yeet: "yote" });
    console.log("Getting user ", req.params.id);
    req.sql("select * from Users where YCA_ID = @id for json path, without_array_wrapper")
        .param('id', req.params.id, TYPES.BigInt)
        .into(res, '{}');

});
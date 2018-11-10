var express = require('express');
var tediousExpress = require('express4-tedious');
var connection = require("./secrets/db-config.json");
var TYPES = require("tedious").TYPES;
var jsonSQL = require("json-sql")({ valuesPrefix: "@" });
var bodyParser = require("body-parser");

var app = express();
app.use(function (req, res, next) {
    req.sql = tediousExpress(connection);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))



var server = app.listen(process.env.PORT || 6969, function () {
    var port = server.address().port;
    console.log("asgard-data now running on port", port);
});


/**
 * Gets a user given an id.
 */
app.get("/users/:id", function (req, res) {
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

/**
 * Creates a new user. Users headers of type application/x-www-form-urlencoded.
 */
app.post("/users/new-user", function (req, res) {

    var addStmt1 = jsonSQL.build({
        type: "insert",
        table: "Users",
        values: req.body
    });
    req.sql(addStmt1.query)
        .param("p1", req.body.YCA_ID, TYPES.BigInt)
        .param("p2", req.body.FirstName, TYPES.VarChar)
        .param("p3", req.body.LastName, TYPES.VarChar)
        .param("p4", req.body.Email, TYPES.VarChar)
        .param("p5", req.body.UsrType, TYPES.VarChar)
        .param("p6", req.body.password, TYPES.VarChar)
        .exec(res);

    res.json({ status: "user added!" });

});

/**
 * Gets all data from a given cost center.
 */
app.get("/costcenters/:id", function (req, res) {
    var date = req.query.date;
    if (date != null) {
        console.log("Fetching data from " + date + "...");
        var dateGetStmt = jsonSQL.build({
            type: "select",
            table: req.params.id,
            condition: [
                { InputDate: { $eq: date } }
            ]
        });

        req.sql(dateGetStmt.query.replace(";", "") + " for json path, without_array_wrapper")
            .param('p1', date, TYPES.Date)
            .into(res, "{}");
    } else {
        var getStmt = jsonSQL.build({
            type: "select",
            table: req.params.id
        });
        req.sql(getStmt.query.replace(";", "") + " for json path, without_array_wrapper").into(res, "{}");
    }

});

/**
 * Creates a new entry for a given date in a cost center.
 */
app.post("/costcenters/:id/add", function (req, res) {
    var addCCStmt = jsonSQL.build({
        type: "insert",
        table: req.params.id,
        values: req.body
    });

    req.sql(addCCStmt.query)
        .param("p1", req.body.InputDate, TYPES.Date)
        .param("p2", req.body.UnitsProduced, TYPES.Int)
        .param("p3", req.body.Defects, TYPES.Int)
        .param("p4", req.body.WorkerTotal, TYPES.Int)
        .param("p5", req.body.SInc_Num, TYPES.Int)
        .param("p6", req.body.QInc_Num, TYPES.Int)
        .param("p7", req.body.SInc_Reason, TYPES.Text)
        .param("p8", req.body.QInc_Reason, TYPES.Text)
        .param("p9", req.body.HighUtil, TYPES.Text)
        .param("p10", req.body.LoUtil, TYPES.Text)
        .param("p11", req.body.Overtime, TYPES.Int)
        .param("p12", req.body.Downtime, TYPES.Int)
        .exec(res);
    res.json({ status: "Cost Center data added successfully!" });
    // res.sendStatus();


});


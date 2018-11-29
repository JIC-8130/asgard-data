/**
 * TODO:
 *     - Error handling
 *     - Error reporting (ie if the server crashes let someone know)
 *     - 
 */

var express = require('express');
var tediousExpress = require('express4-tedious');
var connection = require("./secrets/db-config.json");
var TYPES = require("tedious").TYPES;
var jsonSQL = require("json-sql")({ valuesPrefix: "@" });
var bodyParser = require("body-parser");
var jdCrypto = require("./encryption.js");
var calc = require("./services/asgardCalc");

// Declare our app with Express.
var asgardDataAPI = express();
asgardDataAPI.use(function (req, res, next) {
    req.sql = tediousExpress(connection);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});

/**
 * This lets us actually be able to access the body of 
 * the request, which contains the data to be added to the db.
 */
asgardDataAPI.use(bodyParser.json());
asgardDataAPI.use(bodyParser.urlencoded({ extended: true }))


// We need these strings to format the data from the SQL Server as JSON.
// The first one returns JSON objects plainly, not in an array.
// The second (which we need in case of having more than one object in the response)
// adds the array wrapper around the response.
const JSON_FRMT_STR_NO_WRAP = " for json path, without_array_wrapper";
const JSON_FRMT_STR_WRAP = " for json path"



var server = asgardDataAPI.listen(process.env.PORT || 6969, function () {
    var port = server.address().port;
    console.log("asgard-data now running on port", port);
});


// NOTE: all of these endpoints expect bodies to be in headers of type application/x-www-form-urlencoded.


asgardDataAPI.get("/", function (req, res) {
    res.json("Hello! Welcome to the ASGARD API.");
});

/**
 * Gets a user given an id.
 */
asgardDataAPI.get("/users/:id", function (req, res) {
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
    req.sql(userSelectSQL.query.replace(";", "") + JSON_FRMT_STR_NO_WRAP)
        .param('p1', req.params.id, TYPES.BigInt)
        .into(res, '{}');
});

/**
 * Creates a new user. 
 */
asgardDataAPI.post("/users/new-user", function (req, res) {
    req.body["Salt"] = "";
    var addStmt1 = jsonSQL.build({
        type: "insert",
        table: "Users",
        values: req.body
    });
    // Create the hash and salt for this password
    var passwordData = jdCrypto.saltHashPassword(req.body.password);
    req.sql(addStmt1.query)
        .param("p1", req.body.YCA_ID, TYPES.BigInt)
        .param("p2", req.body.FirstName, TYPES.VarChar)
        .param("p3", req.body.LastName, TYPES.VarChar)
        .param("p4", req.body.Email, TYPES.VarChar)
        .param("p5", req.body.UsrType, TYPES.VarChar)
        .param("p6", passwordData.passwordHash, TYPES.VarChar)
        .param("p7", passwordData.salt, TYPES.NVarChar)
        .exec(res);

    // res.json({ status: "user added!" });

});

/**
 * Handles a GET request for a cost center. If no date is given,
 * returns all rows for that cost center. If a date param is passed,
 * returns only the data from that specific row.
 */
asgardDataAPI.get("/costcenters/:id", function (req, res) {
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

        req.sql(dateGetStmt.query.replace(";", "") + JSON_FRMT_STR_NO_WRAP)
            .param('p1', date, TYPES.Date)
            .into(res, "{}");
    } else {
        var getStmt = jsonSQL.build({
            type: "select",
            table: req.params.id
        });
        req.sql(getStmt.query.replace(";", "") + JSON_FRMT_STR_WRAP).into(res, "{}");
    }

});

/**
 * Creates a new entry for a given date in a cost center.
 */
asgardDataAPI.post("/costcenters/:id/add", function (req, res) {
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
});

/**
 * Updates a given record in a cost center's data.
 */
asgardDataAPI.post("/costcenters/:id/update", function (req, res) {
    var ta = calc.timeAvailable(parseInt(req.body.WorkerTotal));
    var prod = calc.mhProductivity(parseInt(req.body.UnitsProduced), ta);
    var updateStmt = jsonSQL.build({
        type: "update",
        table: req.params.id,
        condition: {
            InputDate: req.query.date
        },
        modifier: {
            InputDate: req.body.InputDate,
            UnitsProduced: req.body.UnitsProduced,
            Defects: req.body.Defects,
            WorkerTotal: req.body.WorkerTotal,
            SInc_Num: req.body.SInc_Num,
            QInc_Num: req.body.QInc_Num,
            SInc_Reason: req.body.SInc_Reason,
            QInc_Reason: req.body.QInc_Reason,
            HighUtil: req.body.HighUtil,
            LoUtil: req.body.LoUtil,
            Overtime: req.body.Overtime,
            Downtime: req.body.Downtime,
            mhProd: prod
        }
    });


    req.sql(updateStmt.query)
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
        .param("p13", req.query.date, TYPES.Date)
        .param("p14", prod, TYPES.BigInt)
        .exec(res);
});


asgardDataAPI.get("/jackets", function (req, res) {
    res.json({ good_word: "To HELL with georgia!", them_dawgs: "piss on 'em!" });
});

// Test thingy
asgardDataAPI.post("/calc", function (req, res) {
    var ta = calc.timeAvailable(parseInt(req.body.workers));
    var prod = calc.mhProductivity(parseInt(req.body.quantity), ta);
    res.json(`Manhour Productivity: ${prod}`);
});
const express = require("express");
const sql = require("mssql");
const DB_CONFIG = require("./secrets/db-config.json");
const jsonSQL = require("json-sql")({ valuesPrefix: "@" });

var testServer = express();

testServer.use(function(req, res, next) {
    // req.sql = tediousExpress(connection);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization"
    );
    next();
});
var server = testServer.listen(process.env.PORT || 8000, () =>
    console.log("Server running on " + server.address().port)
);

const JSON_FRMT_STR_NO_WRAP = " for json path, without_array_wrapper";

async function retrieveData(query) {
    sql.close();
    // sql.connect(
    //     DB_CONFIG.testConfig,
    //     err => {
    //         if (err) {
    //             console.log("ERROR: " + err);
    //             result.send(err);
    //         } else {
    //             var request = new sql.Request();
    //             request.query(query, (err, rs) => {
    //                 if (err) {
    //                     console.log("ERROR ON 33: " + err);
    //                     result.send(err);
    //                 } else {
    //                     result.send(rs.recordsets);
    //                 }
    //             });
    //         }
    //     }
    // );
    try {
        let pool = await sql.connect(DB_CONFIG.testConfig);
        let result = await pool
            .request()
            // .input()
            .query(query);
        return result;
    } catch (err) {
        return { db_err: err };
    }
}

testServer.get("/users/:id", async (req, res) => {
    // var userSelectSQL = jsonSQL.build({
    //     type: "select",
    //     table: "Users",
    //     condition: [{ YCA_ID: { $eq: req.params.id } }]
    // });

    // console.log(userSelectSQL.query);
    // let userResult;
    let usrRes = await retrieveData(
        `select * from "Users" where "YCA_ID" =${req.params.id}`
    );
    sql.on("error", err => {
        res.text("<h1>That's a 500 server error ");
    });
    console.log(usrRes);
    let response = { status: 200, data: usrRes.recordset[0] };
    res.json(response);
    // res.json("working");
});

//Initiallising node modules
var express = require("express");
var bodyParser = require("body-parser");
// var sql = require("mssql");
var app = express();
var UserDataController = require("./services/CreateAccountDataController");

// Body Parser Middleware
app.use(bodyParser.json());

//CORS Middleware
app.use(function (req, res, next) {
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});

//Setting up server
var server = app.listen(process.env.PORT || 6969, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});

//Initiallising connection string
var dbConfig = require("./secrets/db-config.json");

//Function to connect to database and execute query
// var executeQuery = function (res, query) {
//     sql.connect(dbConfig, function (err) {
//         if (err) {
//             console.log("Error while connecting database :- " + err);
//             res.send(err);
//         }
//         else {
//             // create Request object
//             var request = new sql.Request();
//             // query to the database
//             request.query(query, function (err, res) {
//                 if (err) {
//                     console.log("Error while querying database :- " + err);
//                     res.send(err);
//                 }
//                 else {
//                     res.send(res);
//                 }
//             });
//         }
//     });
// }

//GET API
app.get("/api/user", function (req, res) {
    // var query = "select * from [user]";
    // executeQuery(res, query);
    UserDataController.getUser("12345678");
});

//POST API
app.post("/api/user", function (req, res) {
    // var query = "INSERT INTO [user] (Name,Email,Password) VALUES (req.body.Name,req.body.Email,req.body.Password)";
    // executeQuery(res, query);
    UserDataController.addUser(
        {
            values: {
                YCA_ID: "4444",
                FirstName: "Allan",
                LastName: "Serna",
                Email: "allan.serna@us.yokogawa.com",
                UsrType: "LM",
                password: "password"
            }
        }
    );
});

//PUT API
app.put("/api/user/:id", function (req, res) {
    // var query = "UPDATE [user] SET Name= " + req.body.Name + " , Email=  " + req.body.Email + "  WHERE Id= " + req.params.id;
    // executeQuery(res, query);
});

// DELETE API
app.delete("/api/user /:id", function (req, res) {
    // var query = "DELETE FROM [user] WHERE Id=" + req.params.id;
    // executeQuery(res, query);
});
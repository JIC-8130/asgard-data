var express = require('express');
var tediousExpress = require('express4-tedious');
var app = express();
var connection = require("./secrets/db-config.json");
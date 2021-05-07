const http = require('http');
const express = require("express");
var bodyParser = require('body-parser');
var bodyParserJSON = bodyParser.json();
var bodyParserURLEncoded = bodyParser.urlencoded({extended:true});
const app = express();
let config = require('./config/config');
const hostname = config.hostname;
const port = config.port;
let authRoutes = require('./router/route');
app.use(bodyParserJSON);
app.use(bodyParserURLEncoded);
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
     res.setHeader("Access-Control-Allow-Credentials", "true");
     res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH");
     res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Origin,Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,Authorization");
   next();
 });
 var router = express.Router();
 app.use('/api',router);
 authRoutes(router); 

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
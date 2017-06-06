/*jslint node: true*/
"use strict";

var bodyParser = require('body-parser');

//Services
var HomeService = require("../services/HomeService");
HomeService = new HomeService();

module.exports = function (express) {

  var router = express.Router();
  router.use(bodyParser.json());
  router.use(bodyParser.urlencoded({ extended: false }));// parse application/x-www-form-urlencoded


	router.get('/', function (req, res) {
	   console.log("GET /")
	    var ssl = false;
	    if (req.headers['x-forwarded-proto'] === "https") {
	        ssl = true;
	    }
	    ssl = true;//Local
	    if (ssl) {
	    	console.log("Redirect to /auth");
	      res.redirect('/auth');
	    } else {
	      console.log("No https");
	    }
	});

	router.get('/home', function (req, res) {

		console.log("GET /home/")

		var endpoint = "";
		var username = "";
		var password = "";
		var homeResult = null;

  	try {
      const api = req.api;
      const authorization = req.authorization;
      HomeService.setEndpoint(api);
      HomeService.setToken(authorization);
        return HomeService.getOrganizations().then(function (result) {
        	homeResult = result;
       		res.json({pageData: {username: username, data: homeResult}});
        }).catch(function (reason) {
            console.log(reason);
            res.json({pageData: {error: reason, back:back}});
        });

  	} catch (error){
  		handleError(res.error);
  	}
	});
  return router;
};

/*jslint node: true*/
"use strict";

var bodyParser = require('body-parser');

//Services
var SpaceService = require("../services/SpaceService");
SpaceService = new SpaceService();
var AppServices = require("../services/AppService");
AppServices = new AppServices();

module.exports = function (express) {

    var router = express.Router();
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({ extended: false }));// parse application/x-www-form-urlencoded

    function nocache(req, res, next) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
    }

    function validateApiToken(req, res, next) {
      const api = req.headers.api;
      const authorization = req.headers.authorization;

      if (!api || !authorization) {
        res.status(400).send("Missing api endpoint or token");
        return;
      }
      req.api = api;
      req.authorization = authorization;

      next();
    }


	router.get('/:guid/apps', nocache, validateApiToken,  function (req, res) {

		console.log("GET /spaces/:guid/apps");

		var endpoint = "";
		var username = "";
		var password = "";
		var spaceResult = null;

    var space_guid = req.params.guid;
    console.log("space_guid: " + space_guid);

    try {
      const api = req.api;
      const authorization = req.authorization;

      SpaceService.setEndpoint(api);
      SpaceService.setToken(authorization);

      return SpaceService.getApps(space_guid).then(function (result) {
      	spaceResult = result;
        //res.json(spaceResult.apps.resources);
     		res.json({pageData: {username: username, apps: spaceResult.apps.resources, space_guid:space_guid}});
        }).catch(function (reason) {
            console.log(reason);
            res.json({pageData: {error: reason, back:back}});
        });
    } catch (error){
        handleError(res.error);
    }
  });

    router.post('/apps/add', nocache, validateApiToken, function (req, res) {

    	console.log("POST /spaces/apps/add");

        const api = req.api;
        const authorization = req.authorization;

        AppServices.setEndpoint(api);
        AppServices.setToken(authorization);

        var space_guid = req.body.space_guid;
        var appName = req.body.appname;
        var buildPack = req.body.buildpack;

        console.log("space_guid: " + space_guid);
        console.log("App: " + appName);
        console.log("Buildpack: " + buildPack);

        return AppServices.add(space_guid, appName, buildPack).then(function () {
            res.redirect('/spaces/' + space_guid + "/apps");
        }).catch(function (reason) {
            console.log(reason);
	        var back = {
	            path:"/spaces/" + space_guid + "/apps",
	            text:"Space"
	        };
            res.json({pageData: {error: reason, back:back}});
        });

    });

    return router;
};

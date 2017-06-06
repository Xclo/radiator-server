/*jslint node: true*/
"use strict";

var bodyParser = require('body-parser');
var multer = require('multer');

//Services
var ServicesService = require("../services/ServicesService");
ServicesService = new ServicesService();

module.exports = function (express) {

    var router = express.Router();
    var upload = multer({ dest: 'uploads/' });
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

    router.get('/', nocache, validateApiToken,  function (req, res) {
        const api = req.api;
        const authorization = req.authorization;
        ServicesService.setEndpoint(api);
        ServicesService.setToken(authorization);

        console.log("GET Services");

        return ServicesService.getServices().then(function (result) {
            //console.log(result.resources);
            res.json({pageData: {services : result.resources}});
        }).catch(function (reason) {
            res.json({"error": reason});
        });


    });

    router.get('/view/:guid', nocache, validateApiToken, function (req, res) {

        const api = req.api;
        const authorization = req.authorization;
        ServicesService.setEndpoint(api);
        ServicesService.setToken(authorization);

        console.log("GET Service");

        var app_guid = req.params.guid;
        console.log(app_guid);

        return ServicesService.getService(app_guid).then(function (result) {
            res.json({pageData: {credentials : result.entity.credentials}});
        }).catch(function (reason) {
            res.json({"error": reason});
        });

    });

    //TODO: Change to POST
    router.get('/remove/:guid', nocache, validateApiToken, function (req, res) {

        const api = req.api;
        const authorization = req.authorization;
        ServicesService.setEndpoint(api);
        ServicesService.setToken(authorization);

        console.log("GET Service / Remove");

        var app_guid = req.params.guid;
        console.log(app_guid);

        return ServicesService.removeService(app_guid).then(function (result) {
            res.redirect('/services/');
        }).catch(function (reason) {
            res.json({"error": reason});
        });

    });


    router.post('/add/', nocache, validateApiToken, function (req, res) {

        const api = req.api;
        const authorization = req.authorization;
        ServicesService.setEndpoint(api);
        ServicesService.setToken(authorization);

        console.log("POST Service / Add");

        var serviceName = req.body.servicename;
        var host = req.body.host;
        var port = req.body.port;
        var username = req.body.username;
        var password = req.body.password;
        var dbname = req.body.dbname;

        console.log(serviceName);
        console.log(host);
        console.log(port);
        console.log(username);
        console.log(password);
        console.log(dbname);

        return ServicesService.addService(serviceName,host,port,username,password,dbname).then(function (result) {
            res.redirect('/services/');
        }).catch(function (reason) {
            res.json({"error": reason});
        });
    });

    router.get('/bindings/', nocache, validateApiToken, function (req, res) {

        const api = req.api;
        const authorization = req.authorization;
        ServicesService.setEndpoint(api);
        ServicesService.setToken(authorization);

        console.log("GET Bindings");

        return ServicesService.getServices().then(function (result) {
            //console.log(result.resources);
            res.json({pageData: {services : result.resources}});
        }).catch(function (reason) {
            res.json({"error": reason});
        });


    });

    router.get('/bindings/bind/step2/:service_guid', nocache, validateApiToken, function (req, res) {

        const api = req.api;
        const authorization = req.authorization;
        ServicesService.setEndpoint(api);
        ServicesService.setToken(authorization);

        console.log("GET Bindings // Bind");

        var service_guid = req.params.service_guid;
        console.log(service_guid);

        return ServicesService.getAppsAvailableToBind().then(function (result) {
            console.log(result.resources);
            res.json({pageData: {service_guid: service_guid , apps : result.resources}});
        }).catch(function (reason) {
            res.json({"error": reason});
        });


    });

    return router;
};

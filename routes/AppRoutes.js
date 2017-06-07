/*jslint node: true*/
"use strict";
var bodyParser = require('body-parser');
var multer = require('multer');
var request = require('request');
var rp = require('request-promise');

const async = require('async');
const Promise = require('bluebird');
const _ = require('lodash');
const axios = require('axios');

//Services
var AppServices = require("../services/AppService");
AppServices = new AppServices();

module.exports = function (express) {
    var router = express.Router();
    var upload = multer({dest: 'uploads/'});
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({extended: false}));// parse application/x-www-form-urlencoded

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

    function handleError(res, error) {
      console.log(error);
      console.log(error.response)
      if (error.response && error.response.status === 401) {
          res.status(401).send("unauthorized");
      } else {
          res.status(500).send("error");
      }

    }


    function getAppSummaries(api, authorization, apps) {
      return new Promise((resolve, reject) => {
        let summaryPromises = [];
        apps.forEach((app) => {
          summaryPromises.push(AppServices.getAppSummary(api, authorization, app.metadata.guid));
        })

        Promise.all(summaryPromises).then((responses) => {
          // if (_.every(responses, {status: 200})) {
            responses.forEach((response) => {
              let app = _.find(apps, (app) => {
                  return app.metadata.guid === response.data.guid;
              });
              if (response.data.routes.length > 0) {
                app.route = `https://${response.data.routes[0].host}.${response.data.routes[0].domain.name}`
              }

              app.running_instances = response.data.running_instances;
              app.docker_image = response.data.docker_image;

              app.services = [];
              if (response.data.services.length > 0) {
                response.data.services.forEach((service) => {
                  let s = {
                    name: service.name
                  }
                  if (service.service_plan) {
                    s.plan = service.service_plan.name,
                    s.service = service.service_plan.service.label
                  }
                  app.services.push(s);
                });
              }
            });
            resolve(apps)
          // } else {
            // reject('bad');
          // }
        }).catch((error) => {
          reject(error);
        });
      });

    }

    function getApps(api, token,filter) {
      return new Promise((resolve, reject) => {
        AppServices.getApps(api, token,filter).then((response) => {
          let apps = response.resources.map((app) => {
            return {
              api: api,
              metadata: app.metadata,
              name: app.entity.name,
              buildpack: app.entity.buildpack,
              instances: app.entity.instances,
              memory: app.entity.memory,
              disk_quota: app.entity.disk_quota,
              state: app.entity.state,
              health_check_type: app.entity.health_check_type,
              health_check_http_endpoint: app.entity.health_check_http_endpoint
            }
          });
          resolve(apps);
        }).catch((error) => {
          reject(error);
        });
      });
    }



    // GET /apps

    router.get('/', validateApiToken, (req, res) => {
      const api = req.api;
      const authorization = req.authorization;
      //const filter = req.q;
      //const filter = "q=name:canary-java";
      const filter =
        { "q":"name:canary-java"
        }

      AppServices.setEndpoint(api);
      AppServices.setToken(authorization);

      getApps(api, authorization,filter).then((apps) => {
        return getAppSummaries(api, authorization, apps);
      }).then((apps) => {
        res.json(apps);
      }).catch((error) => {
        handleError(res, error);
      });
  	});


    // GET /apps/:guid
    router.get('/:guid', validateApiToken, function (req, res) {
        const api = req.api;
        const authorization = req.authorization;

        AppServices.setEndpoint(api);
        AppServices.setToken(authorization);

        console.log("GET /apps/:guid");
        var summary;

        try {
            var app_guid = req.params.guid;
            console.log("app_guid: " + app_guid);
            return AppServices.view(api,authorization, app_guid).then(function (result) {
                summary = result;
                var myUrl;
                myUrl = AppServices.open(api,authorization,app_guid).then(function (result) {
                    return result;
                }).catch(function (reason) {
                    console.log (reason);
                    return "";
                });
                return myUrl;
            }).then(function (result) {
                var url = result + "/health";
                var status ;
                status = rp(url,"application/json").then(function (result){
                  res.json({app: summary, address: url, status: result})
                  console.log("The fetch result " + JSON.stringify(result));
                  //return result;
                }).catch (function (reason) {
                  console.log(reason);
                });
            }).catch(function (reason) {
                console.log(reason);
                res.json({pageData: {error: reason}});
            });

        } catch (error){
            handleError(res.error);

        }
    });

    // GET /apps/:guid/view/
    router.get('/:guid/view', validateApiToken, function (req, res) {

      console.log("GET /apps/:guid/view");

      try {
          const api = req.api;
          const authorization = req.authorization;

          AppServices.setEndpoint(api);
          AppServices.setToken(authorization);

          var app_guid = req.params.guid;
          console.log("app_guid: " + app_guid);

          return AppServices.view(app_guid).then(function (result) {
              res.json({pageData: {username: username, info: result}});
          }).catch(function (reason) {
              console.log(reason);
              res.json({pageData: {error: reason}});
          });

      } catch (error){
          handleError(res.error);

      }

    });

    router.get('/:guid/upload', validateApiToken, function (req, res) {
      console.log("GET /apps/:guid/upload");
      try {
          const api = req.api;
          const authorization = req.authorization;

          AppServices.setEndpoint(api);
          AppServices.setToken(authorization);
          var app_guid = req.params.guid;
          console.log("app_guid: " + app_guid);

          res.json({pageData: {username: username, app_guid: app_guid}});

      } catch (error){
          handleError(res.error);

      }

    });

    router.post('/upload', upload.single('file'), validateApiToken, function (req, res) {

      console.log("POST /apps/upload");

      var app_guid = null;

      const api = req.api;
      const authorization = req.authorization;

      AppServices.setEndpoint(api);
      AppServices.setToken(authorization);

      app_guid = req.body.app_guid;
      var zipPath = req.file.destination + req.file.filename;

      console.log("app_guid: " + app_guid);
      console.log(zipPath);

      return AppServices.upload(app_guid, zipPath).then(function (result) {
          res.json(result);
      }).catch(function (reason) {
        handleError(res.error);
      });

    });

    router.get('/:guid/stop', validateApiToken, function (req, res) {

        console.log("GET /apps/:guid/stop");

        const api = req.api;
        const authorization = req.authorization;

        AppServices.setEndpoint(api);
        AppServices.setToken(authorization);

        var app_guid = req.params.guid;
        console.log("app_guid: " + app_guid);

        return AppServices.stop(app_guid).then(function (result) {
            console.log(result);
            res.json({ result: 1 });
        }).catch(function (reason) {
            console.log(reason);
            res.json({ error: 1, reason:reason });
        });

    });

    router.get('/:guid/start', validateApiToken, function (req, res) {

        console.log("GET /apps/:guid/start");

        const api = req.api;
        const authorization = req.authorization;

        AppServices.setEndpoint(api);
        AppServices.setToken(authorization);

        var app_guid = req.params.guid;
        console.log("app_guid: " + app_guid);

        return AppServices.start(app_guid).then(function (result) {
            console.log(result);
            res.json({ result: 1 });
        }).catch(function (reason) {
            console.log(reason);
            res.json({ error: 1, reason:reason });
        });

    });

    router.get('/:guid/restage', validateApiToken, function (req, res) {

        console.log("GET /apps/:guid/restage");

        const api = req.api;
        const authorization = req.authorization;

        AppServices.setEndpoint(api);
        AppServices.setToken(authorization);

        var app_guid = req.params.guid;
        console.log("app_guid: " + app_guid);

        return AppServices.restage(app_guid).then(function (result) {
            console.log(result);
            res.json({ result: 1 });
        }).catch(function (reason) {
            console.log(reason);
            res.json({ error: 1, reason:reason });
        });

    });

    router.get('/:guid/remove', validateApiToken, function (req, res) {

        console.log("GET Apps Remove");

        const api = req.api;
        const authorization = req.authorization;

        AppServices.setEndpoint(api);
        AppServices.setToken(authorization);

        var app_guid = req.params.guid;
        console.log("app_guid: " + app_guid);

        return AppServices.remove(app_guid).then(function (result) {
            console.log(result);
            res.json({ result: 1 });
        }).catch(function (reason) {
            console.log(reason);
            res.json({ error: 1, reason:reason });
        });

    });

    router.get('/:guid/log', validateApiToken, function (req, res) {

        console.log("GET /apps/:guid/log");

        var username = "";

        try {

          const api = req.api;
          const authorization = req.authorization;

          AppServices.setEndpoint(api);
          AppServices.setToken(authorization);

          var app_guid = req.params.guid;
          console.log("app_guid: " + app_guid);

          return AppServices.getLogs(app_guid).then(function (result) {
              res.json({pageData: {username: username, log: result, guid: app_guid}});
          }).catch(function (reason) {
              res.json({pageData: {error: reason}});
          });

        } catch (error){
          handleError(res.error);
        }

    });

    router.post('/:guid/open', validateApiToken, function (req, res) {

        console.log("GET /apps/:guid/open");
        const api = req.api;
        const authorization = req.authorization;

        AppServices.setEndpoint(api);
        AppServices.setToken(authorization);

        var app_guid = req.params.guid;
        console.log("app_guid: " + app_guid);

        return AppServices.open(app_guid).then(function (result) {
            console.log(result);
            res.json({ result: 1 , url: result});
        }).catch(function (reason) {
            console.log(reason);
            res.json({ error: 1, reason:reason });
        });

    });

    router.get('/:guid/scale', validateApiToken, function (req, res) {
      console.log("GET /apps/:guid/scale");
      try {
          const api = req.api;
          const authorization = req.authorization;

          AppServices.setEndpoint(api);
          AppServices.setToken(authorization);

          return AppServices.view(app_guid).then(function (result) {
              //console.log(result);
              res.json({pageData: {username: username, app_guid: app_guid, summary: result}});
          }).catch(function (reason) {
              console.log(reason);
              res.json({pageData: {error: reason}});
          });
      } catch (error){
        handleError(res.error);
      }
    });

    router.post('/scale', validateApiToken, function (req, res) {

        console.log("GET /apps/:guid/scale");

        const api = req.api;
        const authorization = req.authorization;

        AppServices.setEndpoint(api);
        AppServices.setToken(authorization);

        var app_guid = req.body.app_guid;
        var buildpack = req.body.buildpack;
        var instances = parseInt(req.body.instances);
        var memory = parseInt(req.body.memory);
        var disk_quota = parseInt(req.body.disk_quota);
        var state = req.body.state;
        //var diego = req.body.diego;
        //var enable_ssh = req.body.enable_ssh;

        /*
        console.log("app_guid: " + app_guid);
        console.log("buildpack: " + buildpack);
        console.log("instances: " + instances);
        console.log("memory: " + memory);
        console.log("disk_quota: " + disk_quota);
        console.log("state: " + state);
        console.log("diego: " + diego);
        console.log("enable_ssh: " + enable_ssh);
        */

        var appOptions = {
            "buildpack": buildpack,
            "instances" : instances,
            "memory" : memory,
            "disk_quota" : disk_quota,
            "state" : state
        };

        console.log(appOptions);

        return AppServices.update(app_guid, appOptions).then(function (result) {
            console.log(result.metadata.guid);
            res.redirect('/apps/' + result.metadata.guid);
        }).catch(function (reason) {
            console.log(reason);
            res.json({ error: 1, reason:reason });
        });
        //res.json({ error: 1, reason:"OK" });

    });

    return router;
};

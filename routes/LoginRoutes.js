/*jslint node: true*/
"use strict"

var bodyParser = require('body-parser');

const Promise = require('bluebird');
const _ = require('lodash');
const axios = require('axios');

//Routes

var Login = require('../services/Login');
Login = new Login();

module.exports = function (express) {

    var router = express.Router();
    router.use(bodyParser.json());
    router.use(bodyParser.urlencoded({extended: false}));

    function nocache(req, res, next) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');
        next();
    }

    router.post('/login', nocache, (req, res) => {

        console.log("POST /login");

        const username = req.body.username;
        const password = req.body.password;
        const api = req.body.api;

        console.log("CC API: " + api);
        console.log("Username: " + username);
        console.log("Password: " + password);

        if (!username || !password || !api) {
          res.status(400).send("Missing username, password or api endpoint");
          return;
        }

        Login.auth(api, username, password).then(function (result) {
            console.log("Authentication process: Success");
            console.log(JSON.stringify(result));
            res.json(result);
        }).catch((error) => {
            console.log(error);
            res.send(error);
        });
    });

    router.get('/logout', nocache, function (req, res) {

        console.log("GET /logout");
        res.json(result);
    });

    router.post('/refreshToken', (req, res) => {
      const refreshToken = req.body.refresh_token;
      const api = req.body.api;

      if (!refreshToken || !api) {
        res.status(400).send("Missing refresh token or api endpoint");
        return;
      }

      Login.refresh(api, refreshToken).then(function (result) {
        res.json(result);
      }).catch((error) => {
        console.log(error);
        res.send(error);
      });
    });

    return router;
};

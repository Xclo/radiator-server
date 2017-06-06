/*jslint node: true*/
"use strict";
const axios = require('axios');
const tokenType = 'bearer';
const rp = require('request-promise');



var CloudController = require("cf-client").CloudController;
var CloudFoundryUsersUAA = require("cf-client").UsersUAA;
var request = require('request');


CloudController = new CloudController();
CloudFoundryUsersUAA = new CloudFoundryUsersUAA();

function Login() {
    return undefined;
}

Login.prototype.auth = function (api, username, password) {
  return new Promise(function (resolve, reject) {
    try {
      getInfo(api).then(function (result) {
        let authorization_endpoint = result.data.authorization_endpoint;
          return resolve(login(authorization_endpoint, username, password));
        }).catch(function (reason) {
          return reject(reason);
        });
    } catch (error) {
      console.log(error);
      return reject(error);
    }
  });
};



Login.prototype.refresh = function (endpoint, refresh_token) {
  return new Promise(function (resolve, reject) {
    try {
      getInfo(endpoint).then(function (result) {
        let authorization_endpoint = result.data.authorization_endpoint;
          return resolve(refreshToken(authorization_endpoint, refresh_token));
        }).catch(function (reason) {
          return reject(reason);
        });
    } catch (error) {
      console.log(error);
      return reject(error);
    }
  });
};



function login(api, username, password){

  const url = `${api}/oauth/token`;

  const options = {
    method: "POST",
    url: url,
    headers: {
      Authorization: "Basic Y2Y6",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    form: {
      grant_type: "password",
      client_id: "cf",
      username: username,
      password: password
    },
    json: true
  };
  return rp(options);
}

function refreshToken(api, refresh_token) {

  const url = `${api}/oauth/token`;

  const options = {
    method: "POST",
    url: url,
    headers: {
      Authorization: "Basic Y2Y6",
      "Content-Type": "application/x-www-form-urlencoded"
    },
    form: {
      grant_type: "refresh_token",
      refresh_token: refresh_token
    },
    json: true
  };
  return rp(options);
}

function getInfo(api) {
  const url = `${api}/v2/info`;
  return axios.get(url);
}





module.exports = Login;

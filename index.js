/*jslint node: true*/
"use strict";

var express = require('express');
var app = express();
var server = require('http').Server(app);
const config = require('./config');
var  clientActions = require('./actions/clientActions');

var io = require('socket.io')(server);

if (config.skipSSLValidation) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

//REST API

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, api, authorization");
  next();
});


app.use('/', require('./routes/GlobalRoutes')(express));
app.use('/api/auth/', require('./routes/LoginRoutes')(express));
app.use('/api/spaces/', require('./routes/SpacesRoutes')(express));
app.use('/api/apps/', require('./routes/AppRoutes')(express));
app.use('/api/services/', require('./routes/ServiceRoutes')(express));
app.use(express.static(__dirname + '/public'));




//Server
console.log("PORT " + process.env.PORT) // Diego
var localPort = process.env.PORT || 5000;
server.listen(localPort, function () {
    console.log('Listening on *:' + localPort);
});

io.on('connection', function (socket)
{
  socket.on("action", function (action) {
    switch (action.type) {
      case "FETCH_FOUNDATIONS_FULFILLED":
      {
          console.log(action);
          io.emit('logged in' + action, {type:'message', data:'good day!'});
      }
      default:
      {
        console.log(action);
        io.emit('default',{type:'message', data:'good day!'})
      }
    }
  })
});

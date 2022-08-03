/*
 * Title: Uptime Monitoring Application
 * Description: A RESTFul API monitoring up or down time of user defined links
 * Author: Kowshar Robin
 *Date: 1/08/2022
 *
 */

//Dependencies
const http = require('http');
const { handleReqRes } = require('./helpers/handleReqRes');
const environment = require('./helpers/environments');

//app object - module scaffolding
const app = {};

//configuration

//Create server
app.createServer = () => {
  const server = http.createServer(app.handleReqRes);
  server.listen(environment.port, () => {
    console.log(`listening to the port ${environment.port}`);
  });
};

//handle Request and Response
app.handleReqRes = handleReqRes;

//Start the server
app.createServer();

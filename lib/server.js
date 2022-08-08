/*
 * Title: Server Library
 * Description: Server related files
 * Author: Kowshar Robin
 *Date: 07/08/2022
 *
 */

//Dependencies
const http = require('http');
const { handleReqRes } = require('../helpers/handleReqRes');
const environment = require('../helpers/environments');

//server object - module scaffolding
const server = {};

//Create server
server.createServer = () => {
  const CreateServerVariable = http.createServer(server.handleReqRes);
  CreateServerVariable.listen(environment.port, () => {
    console.log(`listening to the port ${environment.port}`);
  });
};

//handle Request and Response
server.handleReqRes = handleReqRes;

//Start the server
server.init = () => {
  server.createServer();
};

// export

module.exports = server;

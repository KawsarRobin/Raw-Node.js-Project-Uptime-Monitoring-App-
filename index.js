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
const data = require('./lib/data');
const { sendTwilioSms } = require('./helpers/notification');

//app object - module scaffolding
const app = {};

//test('should first', () => { second })
sendTwilioSms('01610989169', 'Whats up?', (err) => {
  console.log(`this is the error, `, err);
});
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

/*
 * Title: handle Request and Response
 * Description: handle Request and Response
 * Author: Kowshar Robin
 *Date: 3/08/2022
 *
 */

//Dependencies
const url = require('url');
const { StringDecoder } = require('string_decoder');
const routes = require('../routes');
const { notFoundHandler } = require('../handlers/notFoundHandler');
const { parseJSON } = require('./utilities');

//module scaffolding
const handler = {};

//handle Request and Response
handler.handleReqRes = (req, res) => {
  //Request handling
  // get url and parse it
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.path;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '').split('?')[0]; //Regular expression to remove slash(/) from before or after path
  const method = req.method.toLowerCase();
  const queryStringObject = parsedUrl.query;
  const headerObject = req.headers;
  // console.log(queryStringObject.phone, trimmedPath);

  const requestProperties = {
    parsedUrl,
    path,
    trimmedPath,
    method,
    queryStringObject,
    headerObject,
  };

  //Decoding body data with core decoder
  const decoder = new StringDecoder('utf-8'); //to decode body data to real data
  let realData = '';

  const chosenHandler = routes[trimmedPath]
    ? routes[trimmedPath]
    : notFoundHandler;

  req.on('data', (Buffer) => {
    realData += decoder.write(Buffer);
  });

  req.on('end', () => {
    realData += decoder.end();
    requestProperties.body = parseJSON(realData);

    chosenHandler(requestProperties, (statusCode, payload) => {
      statusCode = typeof statusCode === 'number' ? statusCode : 500;
      payload = typeof payload === 'object' ? payload : {};

      // parsing the payload to json
      const payloadString = JSON.stringify(payload);

      //return the final response
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
    });
    // // response handle
    // res.end('hello world, Robin Here');
  });
};

module.exports = handler;

/*
 * Title: sample Handler
 * Description: sample Handler
 * Author: Kowshar Robin
 *Date: 2/08/2022
 *
 */

//  module scaffolding
const handler = {};

handler.sampleHandler = (requestProperties, callback) => {
  console.log(requestProperties);
  callback(200, {
    message: 'This is a simple url',
  });
};
module.exports = handler;

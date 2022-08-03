/*
 * Title: Not found handler
 * Description: 404 not found handler
 * Author: Kowshar Robin
 *Date: 2/08/2022
 *
 */

//  module scaffolding
const handler = {};

handler.notFoundHandler = (requestProperties, callback) => {
  callback(404, {
    message: 'Your requested url is not founded',
  });
};
module.exports = handler;

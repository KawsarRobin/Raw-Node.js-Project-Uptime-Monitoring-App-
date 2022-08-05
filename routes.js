/*
 * Title:Routes
 * Description: Application Routes
 * Author: Kowshar Robin
 *Date: 3/08/2022
 *
 */

//dependencies

const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');
const { userHandler } = require('./handlers/routeHandlers/userHandler');
const { tokenHandler } = require('./handlers/routeHandlers/tokenHandler');

const routes = {
  sample: sampleHandler,
  user: userHandler,
  token: tokenHandler,
};
module.exports = routes;

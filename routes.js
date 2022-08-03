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

const routes = {
  sample: sampleHandler,
  user: userHandler,
};
module.exports = routes;

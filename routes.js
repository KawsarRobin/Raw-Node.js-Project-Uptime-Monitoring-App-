/*
 * Title:Routes
 * Description: Application Routes
 * Author: Kowshar Robin
 *Date: 2/08/2022
 *
 */

//dependencies

const { sampleHandler } = require('./handlers/routeHandlers/sampleHandler');

const routes = {
  sample: sampleHandler,
};
module.exports = routes;

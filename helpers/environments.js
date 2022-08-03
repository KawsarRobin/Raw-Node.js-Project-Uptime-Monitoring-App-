/*
 * Title: Environments
 * Description: Handle all Environments related things
 * Author: Kowshar Robin
 * Date: 3/08/2022
 *
 */

// dependencies

//module scaffolding
const environments = {};

environments.staging = {
  port: 3000,
  envName: 'staging',
  secretKey: 'asldiukfsuhunasldfnb',
};
environments.production = {
  port: 5000,
  envName: 'production',
  secretKey: 'ltokgjherkjsbffsad',
};

// determine which environment was passed

const currentEnvironment =
  typeof process.env.NODE_ENV === 'string' ? process.env.NODE_ENV : 'staging';

//Export corresponding environment object
const environmentToExport =
  typeof environments[currentEnvironment] === 'object'
    ? environments[currentEnvironment]
    : environments.staging;

// module export

module.exports = environmentToExport;

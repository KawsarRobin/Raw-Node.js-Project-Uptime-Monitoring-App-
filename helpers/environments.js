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
  maxChecks: 5,
  twilio: {
    fromPhone: '+16693103531',
    accountSid: 'AC30a82596534e731fc17265c39dc68d2c',
    authToken: '33e30589b35cced3872b0bd39269b5b8',
  },
};
environments.production = {
  port: 5000,
  envName: 'production',
  secretKey: 'ltokgjherkjsbffsad',
  twilio: {
    fromPhone: '+16693103531',
    accountSid: 'AC30a82596534e731fc17265c39dc68d2c',
    authToken: '33e30589b35cced3872b0bd39269b5b8',
  },
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

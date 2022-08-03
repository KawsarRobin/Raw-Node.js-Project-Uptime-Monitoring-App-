/*
 * Title: Utilities
 * Description: important utilities function
 * Author: Kowshar Robin
 * Date: 4/08/2022
 *
 */

// dependencies

//module scaffolding
const crypto = require('crypto');
const environments = require('./environments');
const utilities = {};

//parse JSON string to object
utilities.parseJSON = (jsonString) => {
  let output;

  try {
    output = JSON.parse(jsonString);
  } catch {
    output = {};
  }
  return output;
};

//hash string
utilities.hash = (str) => {
  if (typeof str === 'string' && str.length > 0) {
    const hash = crypto
      .createHmac('sha256', environments.secretKey)
      .update(str)
      .digest('hex');
    return hash;
  } else {
    return false;
  }
};

// module export

module.exports = utilities;

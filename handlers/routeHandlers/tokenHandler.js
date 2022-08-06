/*
 * Title: Token Handler
 * Description: Handler to handle token
 * Author: Kowshar Robin
 *Date: 5/08/2022
 *
 */

//dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { createRandomString } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const { user } = require('../../routes');

//  module scaffolding
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._token = {};

handler._token.post = (requestProperties, callback) => {
  const phone =
    typeof requestProperties.body.phone === 'string' &&
    requestProperties.body.phone.trim().length === 11
      ? requestProperties.body.phone
      : false;

  const password =
    typeof requestProperties.body.password === 'string' &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phone && password) {
    data.read('users', phone, (userData, err) => {
      let hashedPassword = hash(password);
      if (hashedPassword === parseJSON(userData).password) {
        let tokenId = createRandomString(20);
        let expires = Date.now() * 60 * 60 * 1000;
        const tokenObject = {
          phone,
          id: tokenId,
          expires,
        };

        //Store the token
        data.create('tokens', tokenId, tokenObject, (err) => {
          if (!err) {
            callback(200, tokenObject);
          } else {
            callback(500, {
              error: 'There was a problem in the server side',
            });
          }
        });
      } else {
        callback(400, {
          error: 'password is not valid',
        });
      }
    });
  } else {
    callback(400, {
      error: 'You have a problem in your request',
    });
  }
};

handler._token.get = (requestProperties, callback) => {
  // check the id if valid
  const id =
    typeof requestProperties.queryStringObject.id === 'string' &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // lookup the token
    data.read('tokens', id, (tokenData, err) => {
      const token = { ...parseJSON(tokenData) };
      if (!err && token) {
        callback(200, token);
      } else {
        callback(404, {
          error: 'Requested token was not founded in Data!',
        });
      }
    });
  } else {
    callback(404, {
      error: 'Requested token was not found!',
    });
  }
};

handler._token.put = (requestProperties, callback) => {
  const id =
    typeof requestProperties.body.id === 'string' &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;
  const extend =
    typeof requestProperties.body.extend === 'boolean' &&
    requestProperties.body.extend === true
      ? requestProperties.body.extend
      : false;

  if (id && extend) {
    data.read('tokens', id, (tokenData, err) => {
      let tokenObject = parseJSON(tokenData);
      if (tokenObject.expires > Date.now()) {
        tokenObject.expires = Date.now() * 60 * 60 * 1000;
        //Store the Updated token
        data.update('tokens', id, tokenObject, (err) => {
          if (!err) {
            callback();
          } else {
            callback(500, {
              error: 'There was a server side error',
            });
          }
        });
      } else {
        callback(400, {
          error: 'Token already expired!',
        });
      }
    });
  } else {
    callback(400, {
      error: 'There was problem in your request',
    });
  }
};

handler._token.delete = (requestProperties, callback) => {
  const id =
    typeof requestProperties.queryStringObject.id === 'string' &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    data.read('tokens', id, (tokenData, err) => {
      if (!err && tokenData) {
        data.delete('tokens', id, (err) => {
          if (!err) {
            callback(200, {
              message: 'Token was successfully deleted',
            });
          } else {
            callback(500, {
              error: 'There was error deleting token',
            });
          }
        });
      } else
        callback(500, {
          error: 'There was a server side error bro',
        });
    });
  } else {
    callback(400, {
      error: 'There was a problem in your request',
    });
  }
};

// verify Token function
handler._token.verify = (id, phone, callback) => {
  data.read('tokens', id, (tknData, err) => {
    const tokenData = parseJSON(tknData);
    if (!err && tokenData) {
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

module.exports = handler;

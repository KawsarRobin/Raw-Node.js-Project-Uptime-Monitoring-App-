/*
 * Title: user Handler
 * Description: Handler to handle user related routes
 * Author: Kowshar Robin
 *Date: 3/08/2022
 *
 */

//dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');

//  module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._users = {};

handler._users.post = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === 'string' &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === 'string' &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

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

  const tosAgreement =
    typeof requestProperties.body.tosAgreement === 'boolean' &&
    requestProperties.body.tosAgreement
      ? requestProperties.body.tosAgreement
      : false;

  if (firstName && lastName && phone && password && tosAgreement) {
    //make sure that user doesn't exist already
    data.read('users', phone, (err) => {
      if (err) {
        const userObject = {
          firstName,
          lastName,
          phone,
          password: hash(password),
          tosAgreement,
        };
        //Store user to DB
        data.create('users', phone, userObject, (err) => {
          if (!err) {
            callback(200, { message: 'User was created successfully' });
          } else {
            callback(500, {
              error: 'Could not create user',
            });
          }
        });
      } else {
        callback(500, {
          error: 'There was a problem in server',
        });
      }
    });
  } else {
    callback(400, {
      error: 'you have a problem in your request',
    });
  }
};

handler._users.get = (requestProperties, callback) => {
  // check the phone number if valid
  const phone =
    typeof requestProperties.queryStringObject.phone === 'string' &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;
  if (phone) {
    //verify Token
    let token =
      typeof requestProperties.headerObject.token === 'string'
        ? requestProperties.headerObject.token
        : false;

    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        // lookup the user
        data.read('users', phone, (userData, err) => {
          const user = { ...parseJSON(userData) };
          if (!err && user) {
            delete user.password;
            callback(200, user);
          } else {
            callback(404, {
              error: 'Requested user was not founded in Data!',
            });
          }
        });
      } else {
        callback(403, {
          error: 'Authentication failed!',
        });
      }
    });
  } else {
    callback(404, {
      error: 'Requested user was not found!',
    });
  }
};

handler._users.put = (requestProperties, callback) => {
  const firstName =
    typeof requestProperties.body.firstName === 'string' &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === 'string' &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

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

  if (phone) {
    if (firstName || lastName || password) {
      //verify Token
      let token =
        typeof requestProperties.headerObject.token === 'string'
          ? requestProperties.headerObject.token
          : false;
      tokenHandler._token.verify(token, phone, (tokenId) => {
        if (tokenId) {
          // Look the user is exist in DB
          data.read('users', phone, (uData, err) => {
            const userData = { ...parseJSON(uData) };
            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.password = hash(password);
              }

              //store to database
              data.update('users', phone, userData, (err) => {
                if (!err) {
                  callback(200, {
                    message: 'user updated successfully',
                  });
                } else {
                  callback(500, {
                    error: 'There was an error on server side',
                  });
                }
              });
            } else {
              callback(400, {
                error: 'You have a problem in your request man',
              });
            }
          });
        } else {
          callback(403, {
            error: 'Authentication failed!',
          });
        }
      });
    }
  } else {
    callback(400, {
      error: 'Invalid phone number, please try again',
    });
  }
};

handler._users.delete = (requestProperties, callback) => {
  //check phone if valid
  const phone =
    typeof requestProperties.queryStringObject.phone === 'string' &&
    requestProperties.queryStringObject.phone.trim().length === 11
      ? requestProperties.queryStringObject.phone
      : false;
  if (phone) {
    //verify Token
    let token =
      typeof requestProperties.headerObject.token === 'string'
        ? requestProperties.headerObject.token
        : false;

    tokenHandler._token.verify(token, phone, (tokenId) => {
      if (tokenId) {
        data.read('users', phone, (userData, err) => {
          if (!err && userData) {
            data.delete('users', phone, (err) => {
              if (!err) {
                callback(200, {
                  message: 'User was successfully deleted',
                });
              } else {
                callback(500, {
                  error: 'There was error deleting user',
                });
              }
            });
          } else
            callback(500, {
              error: 'There was a server side error',
            });
        });
      } else {
        callback(403, {
          error: 'Authentication failed!',
        });
      }
    });
  } else {
    callback(400, {
      error: 'There was a problem in your request',
    });
  }
};
module.exports = handler;

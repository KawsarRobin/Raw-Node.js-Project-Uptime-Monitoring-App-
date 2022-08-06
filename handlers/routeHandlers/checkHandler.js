/*
 * Title: Checks Handler
 * Description: Handler to handle all the Checks
 * Author: Kowshar Robin
 *Date: 6/08/2022
 *
 */

//dependencies
const data = require('../../lib/data');
const { hash } = require('../../helpers/utilities');
const { parseJSON, createRandomString } = require('../../helpers/utilities');
const tokenHandler = require('./tokenHandler');
const { maxChecks } = require('../../helpers/environments');

//  module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler.checks[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler.checks = {};

handler.checks.post = (requestProperties, callback) => {
  //Validate inputs
  const protocol =
    typeof requestProperties.body.protocol === 'string' &&
    ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  const url =
    typeof requestProperties.body.url === 'string' &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  const method =
    typeof requestProperties.body.method === 'string' &&
    ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  const successCodes =
    typeof requestProperties.body.successCodes === 'object' &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  const timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === 'number' &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    //verify Token
    let token =
      typeof requestProperties.headerObject.token === 'string'
        ? requestProperties.headerObject.token
        : false;
    // Look up the user phone by reading token
    data.read('tokens', token, (tokenData, err) => {
      if (!err && tokenData) {
        let userPhone = parseJSON(tokenData).phone;
        // lookup the user data
        data.read('users', userPhone, (userData, err) => {
          if (!err && userData) {
            tokenHandler._token.verify(token, userPhone, (tokenIsValid) => {
              if (tokenIsValid) {
                let userObject = parseJSON(userData);
                const userChecks =
                  typeof userObject.checks === 'object' &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];
                if (userChecks.length < maxChecks) {
                  let checkId = createRandomString(20);
                  let checkObject = {
                    id: checkId,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeoutSeconds,
                  };
                  //Save the object to DB
                  data.create('checks', checkId, checkObject, (err) => {
                    if (!err) {
                      //Add check to the user's object
                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);

                      // Update the new data
                      data.update('users', userPhone, userObject, (err) => {
                        if (!err) {
                          // return the data about the new check
                          callback(200, checkObject);
                        } else {
                          callback(500, {
                            error: 'There was a problem in the server side',
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: 'There was a problem in the server side',
                      });
                    }
                  });
                } else {
                  callback(401, {
                    error: 'User has reached already max check limit!',
                  });
                }
              } else {
                callback(403, {
                  error: 'Authentication problem!',
                });
              }
            });
          } else {
            callback(403),
              {
                error: 'User not found',
              };
          }
        });
      } else {
        callback(403, {
          error: 'Authentication problem!!!!',
        });
      }
    });
  } else {
    callback(404, {
      error: 'You have a problem in your request!!!',
    });
  }
};

handler.checks.get = (requestProperties, callback) => {
  // check the id if valid
  const id =
    typeof requestProperties.queryStringObject.id === 'string' &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // Look up the check
    data.read('checks', id, (checkDetails, err) => {
      const checkData = parseJSON(checkDetails);
      if (!err && checkData) {
        //verify Token
        let token =
          typeof requestProperties.headerObject.token === 'string'
            ? requestProperties.headerObject.token
            : false;

        tokenHandler._token.verify(
          token,
          checkData.userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              callback(200, checkData);
            } else {
              callback(403, {
                error: 'Authentication Problem!',
              });
            }
          }
        );
      } else {
        callback(404, {
          error: 'You have a problem in your request!',
        });
      }
    });
  } else {
    callback(404, {
      error: 'You have a problem in your request!!!',
    });
  }
};

handler.checks.put = (requestProperties, callback) => {
  // check the id if valid
  const id =
    typeof requestProperties.body.id === 'string' &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;

  //Validate inputs
  const protocol =
    typeof requestProperties.body.protocol === 'string' &&
    ['http', 'https'].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  const url =
    typeof requestProperties.body.url === 'string' &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;

  const method =
    typeof requestProperties.body.method === 'string' &&
    ['GET', 'POST', 'PUT', 'DELETE'].indexOf(requestProperties.body.method) > -1
      ? requestProperties.body.method
      : false;

  const successCodes =
    typeof requestProperties.body.successCodes === 'object' &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;

  const timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === 'number' &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      data.read('checks', id, (checkData, err) => {
        if (!err && checkData) {
          let checkObject = parseJSON(checkData);
          //verify Token
          let token =
            typeof requestProperties.headerObject.token === 'string'
              ? requestProperties.headerObject.token
              : false;

          tokenHandler._token.verify(
            token,
            checkObject.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                if (protocol) {
                  checkObject.protocol = protocol;
                }
                if (url) {
                  checkObject.url = url;
                }
                if (method) {
                  checkObject.method = method;
                }
                if (successCodes) {
                  checkObject.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                  checkObject.timeoutSeconds = timeoutSeconds;
                }
                //Update the checkObject to store
                data.update('checks', id, checkObject, (err) => {
                  if (!err) {
                    callback(200);
                  } else {
                    callback(500, {
                      error: 'There was a server side error!',
                    });
                  }
                });
              } else {
                callback(403, {
                  error: 'Authentication Error!',
                });
              }
            }
          );
        } else {
          callback(500, {
            error: 'There was a problem in server side',
          });
        }
      });
    } else {
      callback(404, {
        error: 'You must provide at least one field to up',
      });
    }
  } else {
    callback(404, {
      error: 'You have a problem in your request!!!',
    });
  }
};

handler.checks.delete = (requestProperties, callback) => {
  // check the id if valid
  const id =
    typeof requestProperties.queryStringObject.id === 'string' &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;

  if (id) {
    // Look up the check
    data.read('checks', id, (checkDetails, err) => {
      const checkData = parseJSON(checkDetails);
      if (!err && checkData) {
        //verify Token
        let token =
          typeof requestProperties.headerObject.token === 'string'
            ? requestProperties.headerObject.token
            : false;

        tokenHandler._token.verify(
          token,
          checkData.userPhone,
          (tokenIsValid) => {
            if (tokenIsValid) {
              //delete the check data
              data.delete('checks', id, (err) => {
                if (!err) {
                  data.read('users', checkData.userPhone, (userData, err) => {
                    const userObject = parseJSON(userData);
                    if (!err && userData) {
                      const userChecks =
                        typeof userObject.checks === 'object' &&
                        userObject.checks instanceof Array
                          ? userObject.checks
                          : [];
                      //remove the deleted check id from user's list of checks
                      const checkPosition = userChecks.indexOf(id);
                      if (checkPosition > -1) {
                        userChecks.splice(checkPosition, 1);
                        userObject.checks = userChecks;
                        data.update(
                          'users',
                          userObject.phone,
                          userObject,
                          (err) => {
                            if (!err) {
                              callback(200);
                            } else {
                              callback(500, {
                                error: 'There was a server side error, okay!!',
                              });
                            }
                          }
                        );
                      } else {
                        callback(500, {
                          error:
                            'The check id that you are trying to remove is not found in user',
                        });
                      }
                    } else {
                      callback(500, {
                        error: 'There was a server side error bro!!',
                      });
                    }
                  });
                } else {
                  callback(500, {
                    error: 'There was a server side error man!!',
                  });
                }
              });
            } else {
              callback(403, {
                error: 'Authentication Problem!',
              });
            }
          }
        );
      } else {
        callback(404, {
          error: 'You have a problem in your request!',
        });
      }
    });
  } else {
    callback(404, {
      error: 'You have a problem in your request!!!',
    });
  }
};
module.exports = handler;

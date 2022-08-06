/*
 * Title:Notification library
 * Description: Important function to notify users
 * Author: Kowshar Robin
 *Date: 6/08/2022
 *
 */

//dependencies
const https = require('https');
const { twilio } = require('./environments');
const querystring = require('querystring');

//Module scaffolding
const notification = {};

//send sms to user using twilio Api

notification.sendTwilioSms = (phone, msg, callback) => {
  //input Validate

  const userPhone =
    typeof phone === 'string' && phone.trim().length === 11
      ? phone.trim()
      : false;

  const userMsg =
    typeof msg === 'string' &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (userPhone && userMsg) {
    //configure the request payload
    const payload = {
      From: twilio.fromPhone,
      To: `+88${userPhone}`,
      Body: userMsg,
    };
    //Stringify the payload
    const stringifyPayload = JSON.stringify(payload);

    // configure the request details
    const requestDetails = {
      hostname: 'api.twilio.com',
      method: 'POST',
      path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages.json`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      Headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };
    //Instantiate the request object
    const req = https.request(requestDetails, (res) => {
      // get the status of the sent request
      const status = res.statusCode;
      // callback successfully if the request went through
      if (status === 200 || status || 201) {
        callback(false);
      } else {
        callback(`Status code returned was ${status}`);
      }
    });
    req.on('error', (e) => {
      callback(e);
    });

    //Assigning payload to req object via write method
    req.write(stringifyPayload);
    req.end();
  } else {
    callback('Given parameters were missing or invalid!');
  }
};

//  export the module

module.exports = notification;

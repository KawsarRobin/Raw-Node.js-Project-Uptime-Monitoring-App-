/*
 * Title: Worker Library
 * Description: Worker related files
 * Author: Kowshar Robin
 *Date: 07/08/2022
 *
 */

//Dependencies
const url = require('url');
const data = require('./data');
const http = require('http');
const https = require('https');
const { parseJSON } = require('../helpers/utilities');
const { sendTwilioSms } = require('../helpers/notification');

//worker object - module scaffolding
const worker = {};

//Lookup all the checks
worker.gatherAllChecks = () => {
  //get al the checks
  data.list('checks', (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach((check) => {
        //read the check data
        data.read('checks', check, (originalCheckData, err) => {
          if (!err && originalCheckData) {
            //pass the data to the next process
            worker.validateCheckData(parseJSON(originalCheckData));
          } else {
            console.log(`Error: reading one of the checks data!`);
          }
        });
      });
    } else {
      console.log(`Error: could not find any checks to process`);
    }
  });
};

//Validate individual check data
worker.validateCheckData = (originalCheckData) => {
  if (originalCheckData && originalCheckData.id) {
    originalCheckData.state =
      typeof originalCheckData.state === 'string' &&
      ['up', 'down'].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state
        : 'down';

    originalCheckData.lastChecked =
      typeof originalCheckData.lastChecked === 'number' &&
      originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked
        : false;

    // pass to the next process
    worker.performCheck(originalCheckData);
  } else {
    console.log(`Error: check was invalid or not  properly formated!`);
  }
};
// perform Check
worker.performCheck = (originalCheckData) => {
  //prepare the initial check outcome
  let checkOutCome = {
    error: false,
    responseCode: false,
  };
  //mark the outcome has not been sent yet
  let outComeSent = false;
  // parse the hostname & full url from originalCheckData
  const parsedUrl = url.parse(
    `${originalCheckData.protocol}://${originalCheckData.url}`,
    true
  );
  const hostName = parsedUrl.hostname;
  const path = parsedUrl.path;

  // construct the request
  const requestDetails = {
    protocol: `${originalCheckData.protocol}:`,
    hostname: hostName,
    method: originalCheckData.method.toUpperCase(),
    path: path,
    timeout: originalCheckData.timeoutSeconds * 1000,
  };

  const protocolToUse = originalCheckData.protocol === 'http' ? http : https;

  let req = protocolToUse.request(requestDetails, (res) => {
    //grab the status of the response
    const status = res.statusCode;

    // update the check outcome and pass to the next process
    checkOutCome.responseCode = status;

    if (!outComeSent) {
      worker.processCheckOutCome(originalCheckData, checkOutCome);
      outComeSent = true;
    }
  });
  //listening to Error
  req.on('error', (e) => {
    checkOutCome = {
      error: true,
      value: e,
    };
    // update the check outcome and pass to the next process
    if (!outComeSent) {
      worker.processCheckOutCome(originalCheckData, checkOutCome);
      outComeSent = true;
    }
  });
  // listening to timeout
  req.on('timeout', (e) => {
    checkOutCome = {
      error: true,
      value: 'timeout',
    };
    // update the check outcome and pass to the next process
    if (!outComeSent) {
      worker.processCheckOutCome(originalCheckData, checkOutCome);
      outComeSent = true;
    }
  });
  //req send
  req.end();
};

//save outcome to database and send to next process
worker.processCheckOutCome = (originalCheckData, checkOutCome) => {
  // check outcome is up or down
  let state =
    !checkOutCome.error &&
    checkOutCome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutCome.responseCode) > -1
      ? 'up'
      : 'down';

  // decide weather we should alert the user or not
  let alertWanted =
    originalCheckData.lastChecked && originalCheckData.state !== state
      ? true
      : false;

  //update the check data
  let newCheckData = originalCheckData;
  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  //update the check to db
  data.update('checks', newCheckData.id, newCheckData, (err) => {
    if (!err) {
      if (alertWanted) {
        worker.alertUserToStatusChange(newCheckData);
      } else {
        console.log('alert is not needed as there is no state change');
      }
    } else {
      console.log('Error trying to save check data of one of the checks!');
    }
  });
};

//Send notification sms to  user if state changes
worker.alertUserToStatusChange = (newCheckData) => {
  let msg = `Alert: your check for ${newCheckData.method.toUpperCase()} ${
    newCheckData.protocol
  }://${newCheckData.url} is currently ${newCheckData.state}`;

  // Send twilio sms
  sendTwilioSms(newCheckData.userPhone, msg, (err) => {
    if (!err) {
      console.log(`User was alerted  to a status change via SMS: ${msg}`);
    } else {
      console.log('There was a problem sending sms to one of the user!');
    }
  });
};

// timer to execute the worker process once per minute
worker.loop = () => {
  setInterval(() => {
    worker.gatherAllChecks();
  }, 60 * 1000);
};

//Start the server
worker.init = () => {
  //execute all the Checks
  worker.gatherAllChecks();

  //   call the loop so that checks continue
  worker.loop();
};

// export
module.exports = worker;

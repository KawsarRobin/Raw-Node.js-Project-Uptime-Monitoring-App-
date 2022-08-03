/*
 * Title: Data Management
 * Description: handle data
 * Author: Kowshar Robin
 *Date: 3/08/2022
 *
 */

//dependencies
const fs = require('fs');
const path = require('path');

//module scaffolding
const lib = {};

//base directory of the data folder
lib.basedir = path.join(__dirname, './../.data/');

//write data to file
lib.create = (dir, file, data, callback) => {
  // open file for writing
  fs.open(`${lib.basedir + dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      const stingData = JSON.stringify(data);
      //Write data to file and then close it
      fs.writeFile(fileDescriptor, stingData, (err2) => {
        if (!err2) {
          fs.close(fileDescriptor, (err3) => {
            if (!err3) {
              callback(false);
            } else {
              callback('Error closing the new file');
            }
          });
        } else {
          callback('Error writing the new file!');
        }
      });
    } else {
      callback('could not create new file, it may already exist');
    }
  });
};

//Read Data from file
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.basedir + dir}/${file}.json`, 'utf8', (err, data) => {
    if (!err) {
      callback(data);
    } else {
      callback(err);
    }
  });
};

//Update existing file
lib.update = (dir, file, data, callback) => {
  //file open existing file for writing

  fs.open(`${lib.basedir + dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
    if (!err && fileDescriptor) {
      //convert the data to stingData
      const stringData = JSON.stringify(data);

      //truncate the file -> making empty the file
      fs.ftruncate(fileDescriptor, (err) => {
        if (!err) {
          fs.writeFile(fileDescriptor, stringData, (err) => {
            if (!err) {
              fs.close(fileDescriptor, (err) => {
                if (!err) {
                  callback(false);
                } else {
                  callback('error closing file');
                }
              });
            } else {
              callback('Error writing to the file');
            }
          });
        } else {
          callback('Error Truncating file!');
        }
      });
    } else {
      callback('error updating. file may not exist');
    }
  });
};

//Delete existing file
lib.delete = (dir, file, callback) => {
  // Unlink file
  fs.unlink(`${lib.basedir + dir}/${file}.json`, (err) => {
    if (!err) {
      callback(false);
    } else {
      callback('error deleting file');
    }
  });
};

module.exports = lib;

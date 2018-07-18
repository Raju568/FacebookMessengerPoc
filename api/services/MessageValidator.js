'use strict';
var Q = require('q');
var Isemail = require('isemail');
var pattern = /^([0-9]{2})\/([0-9]{2})\/([0-9]{4})$/;

module.exports = {
  validateMessageToDeliver: validateMessageToDeliver,
  validateUserPassword: validateUserPassword
};

function validateMessageToDeliver(messageReceived) {
  return Q.promise(function(resolve, reject) {

    if (Isemail.validate(messageReceived.message.text)) {
      User.validateUserByEmailId(messageReceived.message.text)
        .then(function(existingUser) {
          if (existingUser) {
            return resolve("Please enter password to procced furthur.");
          }
          return resolve("Record didn't matched in our database.Thank You!");
        }).catch(function(err) {
          return reject(err);
        });
    } else {
      return resolve("Hi, I would like to know your email");
    }
  });
}

function validateUserPassword(messageReceived) {
  return Q.promise(function(resolve, reject) {
    var is_date_of_birth = false;
    var input = messageReceived.message.text;
    // User.getUserBirthdayFlag(messageReceived.sender.id)
    //   .then(function(flag) {
    //     console.log(flag,"flag");
    //       if(flag===1){
    //         return resolve('Please provide birthday date in dd/mm/yyyy formate.');
    //       }
        if (pattern.test(input)) {
          is_date_of_birth = true;
        }
        UserChatLog.find({
            senderId: messageReceived.senderId
          })
          .sort('createdAt DESC')
          .then(function(userChatLog) {
            if (userChatLog.length) {
              return resolve(User.getUserByfacebookId(userChatLog, messageReceived, is_date_of_birth));
            } else {
              return resolve(null);
            }
          })
          .catch(function(err) {
            return reject(err);
          });
      // })
      // .catch(function(err) {
      //   return reject(err);
      // });
  });
}

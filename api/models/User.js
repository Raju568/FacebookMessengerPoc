var Q = require('q'),
  _ = require('lodash'),
  config = sails.config.config;
module.exports = {

  attributes: {
    name: {
      type: 'string',
      defaultsTo: ""
    },
    email: {
      type: 'string',
      unique: true
    },
    password: {
      type: 'string'
    },
    facebookId: {
      type: 'string'
    },
    dateOfBirth: {
      type: 'string',
      defaultsTo: ""
    },
    // stores thumbnail
    ProfilePicture: {
      type: 'string',
      defaultsTo: ""
    },
    isDeleted: {
      type: 'boolean',
      defaultsTo: false
    },
    isBlocked: {
      type: 'boolean',
      defaultsTo: false
    },
    date_of_birth_provided: {
      type: 'integer'
    },
  },
  validateUserByEmailId: validateUserByEmailId,
  createUser: createUser,
  getUserByfacebookId: getUserByfacebookId,
  getUserBirthdayFlag: getUserBirthdayFlag
};

function validateUserByEmailId(userEmail) {
  return Q.promise(function(resolve, reject) {
    var criteria = {};
    criteria.email = userEmail;
    User.findOne(criteria)
      .then(function(userdetail) {
        return resolve(userdetail);
      })
      .catch(function(merr) {
        return reject(err);
      });
  });
}


function createUser(userData) {
  return Q.promise(function(resolve, reject) {
    User.create(userData, function(err, data) {
      if (err) {
        sails.log.error("CreateUser:: Error: err:", err);
        return reject(err);
      }
      return resolve(data);
    });
  });
}

function getUserByfacebookId(userChatLog, messageReceived, is_date_of_birth) {
  return Q.promise(function(resolve, reject) {
    User.findOne({
        facebookId: userChatLog[0].senderId
      })
      .then(function(userData) {
        if (userData && is_date_of_birth) {
          userData.dateOfBirth = messageReceived.message.text;
          User.update({
              facebookId: userChatLog[0].senderId
            }, {
              dateOfBirth: messageReceived.message.text,
              date_of_birth_provided: 2
            })
            .then(resolve('Thanks for the response.'));
        } else {
          if (userData &&userData.date_of_birth_provided&& userData.date_of_birth_provided === 2) {
            return resolve(`Hi ${userData.name} welcome to bot!`);
          }
          if (userData && userData.date_of_birth_provided === 1) {
            return resolve(`Hi ${userData.name} \n\n Can you please help me with your DOB in dd/mm/yyyy formate`);
          }
          if (userData && userData.password === messageReceived.message.text) {
            User.update({
              facebookId: userChatLog[0].senderId
            }, {
              date_of_birth_provided: 1
            }, function(err, updatedUser) {
              return resolve(`Hi ${userData.name} \n\n Can you please help me with your DOB in dd/mm/yyyy formate`);
            });
          }
          let message = userData && userData.password === messageReceived.message.text ? `Hi, ${userData.name} welcome back to the bot!.\n\n` : null;
          if (message) {
            message = userData && userData.dateOfBirth === "" ? message + "Can you please help me with your DOB in dd/mm/yyyy formate" : message;
          }
          return resolve(message);
        }
      })
      .catch(function(err) {
        return reject(err);
      });

  });
}

function getUserBirthdayFlag(facebookId) {
  return Q.promise(function(resolve, reject) {
    User.findOne({
        facebookId: facebookId
      })
      .then(function(user) {
        console.log("userfound", user);
        let flag = user && user.date_of_birth_provided ? user.date_of_birth_provided : 3;
        return resolve(flag);
      })
      .catch(function(err) {
        return reject(err);
      });
  });
}

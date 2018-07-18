var Q = require('q'),
fs = require('fs');
module.exports = {

  attributes: {
    senderId: {
      type: 'string'
    },
    recipientId: {
      type: 'string'
    },
    messageText: {
      type: 'string',
      defaultsTo: ""
    },
    // stores thumbnail
    timestamp: {
      type: 'string',
      defaultsTo: ""
    },
    isDeleted: {
      type: 'boolean',
      defaultsTo: false
    }
  },
  storeUserConversation: storeUserConversationV1,
  getRecipientUserId: getRecipientUserId
};
// function to store log chat in db
function storeUserConversationV1(messageReceived) {
  return Q.promise(function(resolve, reject) {
    //formatting the data for storage
    var data = {};
    data.senderId = messageReceived.sender.id;
    data.recipientId = messageReceived.recipient.id;
    data.timestamp = messageReceived.timestamp;
    data.messageText = messageReceived.message.text;

    // UserChatLog reffers to be  mongo db --table
    UserChatLog.create(data)
      .then(function(data) {
        if (!data) {
          return reject({
            code: 400,
            message: 'Error while saving user chat log.'
          });
        }
      //  return resolve(storeUserConversationV2(data));
    return resolve();
      })
      .catch(function(err) {
        console.log("Error :: Something went wrong");
        return reject(err);
      });
  });
}

function storeUserConversationV2(data) {
  return Q.promise(function(resolve, reject) {

    fs.appendFile('userChatLog.txt', JSON.stringify(data), function(err) {

      if (err) {
        return reject(err);
      } else {
        console.log('A log of this chat has captured successfully.');
        return resolve();
      }
    });
  });
}

//get recipient id
function getRecipientUserId() {

  //define criteria
  var criteria = {};
  // TODO: define criteria to find user
  UserChatLog.findOne(criteria)
    .then(function(user) {
      return user.senderId;
    })
    .catch(function(err) {
      console.log("UserChatLog:: Error: while hetting userid");
      return err;
    });
}

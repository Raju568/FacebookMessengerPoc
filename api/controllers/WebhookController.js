'use strict';
// Imports dependencies and set up http server
const express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request'),
  app = express().use(bodyParser.json()), // creates express http server
  Q = require('q');
var config = sails.config.message;

module.exports = {

  setupWebhook: setupWebhookAction,
  sendMessages: sendMessagesAction
};

function setupWebhookAction(req, res) {
  // Your verify token. Should be a random string.

  let VERIFY_TOKEN = config.verficationToken;

  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      return res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      return res.sendStatus(403);
    }
  }
}

function sendMessagesAction(req, res) {
  var body = req.body;
  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      sendMessagePostBack(webhook_event);
      //store the user char info to db
      UserChatLog.storeUserConversation(webhook_event); //store log in text file
      return res.status(200).send('EVENT_RECEIVED');
    });
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    return res.sendStatus(404);
  }
}

function sendMessagePostBack(messageReceived) {
  return Q.promise(function(resolve, reject) {

    MessageValidator.validateUserPassword(messageReceived)
    .then(function(messageData){
      if(messageData){
        messageReceived.recipient.id = messageReceived.sender.id;
        messageReceived.sender.id = messageReceived.recipient.id;
        messageReceived.timestamp = new Date();
        messageReceived.message.text = messageData;
        UserChatLog.storeUserConversation(messageReceived)
          return resolve(sendResponseToUser(messageData));
      }
    else{
      MessageValidator.validateMessageToDeliver(messageReceived)
        .then(function(messageData) {
          messageReceived.recipient.id = messageReceived.sender.id;
          messageReceived.sender.id = messageReceived.recipient.id;
          messageReceived.timestamp = new Date();
          messageReceived.message.text = messageData;
          UserChatLog.storeUserConversation(messageReceived) //store log in db
          return resolve(sendResponseToUser(messageData));
        })
        .catch(function(err) {
          return reject(err);
        });
    }
  })
    .catch(function(err) {
      return reject(err);
    });
  });
}
// //send response
function sendResponseToUser(messageText) {
  return Q.promise(function(resolve, reject) {

    var url = 'https://graph.facebook.com/v2.6/me/messages?access_token=' + config.token;
    //   let id=getRecipientUserId();
    request({
        'url': url,
        'method': 'POST',
        'headers': {
          "Content-Type": "application/json"
        },
        "json": {
          "messaging_type": "RESPONSE",
          "recipient": {
            "id": config.userId
          },
          "message": {
            "text": messageText
          }
        }
      },
      function(error, response, body) {
        if (error) {
          sails.log.error("fbError :: Error :: ", error);
          return reject({
            code: 500,
            message: 'INTERNAL_SERVER_ERROR'
          });
        } else {
          return resolve();
        }
      });
  });
}

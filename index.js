'use strict';

// Imports dependencies and set up http server
const express = require('express'),
  bodyParser = require('body-parser'),
  request = require('request'),
  app = express().use(bodyParser.json()), // creates express http server
  Q = require('q');
//  config = require('./config/config.js');
  var readline = require('readline-sync');
  var fs = require('fs');
var config={
  token : "EAADfxppay2kBAAooWGKcKmnbEhYi3lZCtvsZAJEz0p6rT7ZBw35cMO8bkWWzZAcmWgzzPGyRnxumLSAH5Ws7nClj8ieWvMmLTDfB1aP4lD9oN2eVBhCgTEmTDvWRwz60AC7KOpDwLlj0itCra6IBCfEkEYW2uVuuHpKx4ZAHl0pUDFHZBj6NaFScV2ASTdwuYZD",
  verficationToken:"qwerty",
  port:1337,
  userId:"2075735892499668"
};
// Sets server port and logs message on success
// var email = readline.question("email?");
// var pass = readline.question("password?");


// login(email, pass)
//   .then(function() {
//     // app.listen(8445, function() {
//     //   console.log('webhook is listening:');
//     // });
//   })
//   .catch(function(err) {
//     console.log(err);
//   });

app.listen(config.port, function() {
  console.log('webhook is now listening......:');
});
app.post('/webhook', (req, res) => {

  var body = req.body;
  // Checks this is an event from a page subscription
  if (body.object === 'page') {

    // Iterates over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      sendResponseToUser()
        .then(function() {
         storeSenderInfoV2(webhook_event);//store log in text file
            res.status(200).send('EVENT_RECEIVED');
        });
      //store the user char info to db
    });
  } else {
    // Returns a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});


app.get('/webhook', (req, res) => {

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
      res.status(200).send(challenge);

    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

//store user chat log

function storeSenderInfoV2(messageReceived) {
  return Q.promise(function(resolve, reject) {

    //formatting the data for storage
    var data = {};
    data.senderId = messageReceived.sender.id;
    data.recipientId = messageReceived.recipient.id;
    data.timestamp = messageReceived.timestamp;
    data.messageText = messageReceived.message.text;
    fs.appendFile('userChatLog.txt', JSON.stringify(data), function (err) {

    if(err){
      return reject(err);
    }else{
      console.log('A log of this chat has captured successfully.');
      return resolve();
    }
    });
  });
 }
// function to store log chat in db
function storeSenderInfo(messageReceived) {
  return Q.promise(function(resolve, reject) {

    //formatting the data for storage
    var data = {};
    data.senderId = messageReceived.sender.id;
    data.recipientId = messageReceived.recipient.id;
    data.timestamp = messageReceived.timestamp.id;
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
        return resolve();
      })
      .catch(function(err) {
        console.log("Error :: Something went wrong");
        return reject(err);
      });
  });
}
//get recipient id
function getRecipientUserId() {

  //define criteria
  var criteria={};
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

// //send response
function sendResponseToUser() {
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
            "text": "I would like to know your name and email."
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

// function login(email, pass) {
//   return Q.promise(function(resolve, reject) {
//     if (email === 'raju@bot.com' && pass === 'password') {
//       console.log("Logged in successfully.");
//     } else {
//       console.log("Invalid credentials");
//       process.exit(0);
//     }
//   });
// }

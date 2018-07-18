# generate

a [Sails v1](https://sailsjs.com) application


### Links

+ [Get started](https://sailsjs.com/get-started)
+ [Sails framework documentation](https://sailsjs.com/documentation)
+ [Version notes / upgrading](https://sailsjs.com/documentation/upgrading)
+ [Deployment tips](https://sailsjs.com/documentation/concepts/deployment)
+ [Community support options](https://sailsjs.com/support)
+ [Professional / enterprise options](https://sailsjs.com/enterprise)


### Version info

This app was originally generated on Fri Jun 29 2018 20:27:52 GMT+0530 (IST) using Sails v1.0.2.

<!-- Internally, Sails used [`sails-generate@1.15.28`](https://github.com/balderdashy/sails-generate/tree/v1.15.28/lib/core-generators/new). -->

Create a facebook app and configure messagenger.

create a facebook page.

Setup the webhooks by giving callback url and verification token.

You can forward the request(callback url) to localhost with the following:

Download and install ngrok from https://ngrok.com/download

After installation run below cammand
./ngrok http 8445

Subscribe your page to the Webhooks using verify_token (random string) as "qwerty" and https://<your_ngrok_io>/webhook as callback URL.

Talk to your bot on Messenger!

DB and table need to be configured and created according to written code::
data should get stored to db table name: "UserChatLog"

const { Autohook } = require('twitter-autohook');
const http = require('http');
const url = require('url');
const Twit = require('twit');

const {
  createHmac,
} = require('crypto');

const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
console.log(TWITTER_CONSUMER_KEY)
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET;
const TWITTER_ID = process.env.TWITTER_ID;
const TWITTER_WEBHOOK_PORT = process.env.TWITTER_WEBHOOK_PORT;
const NGROK_TOKEN = process.env.NGROK_TOKEN;
const SERVER_PORT = process.env.SERVER_PORT;

let TwitClient;

const createTwitterClient = async (messageResponseHandler) => {
  if(!TWITTER_CONSUMER_SECRET || !TWITTER_CONSUMER_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_TOKEN_SECRET)
    return console.warn("No credentials for Twitter, skipping");

  const SendMessage = (id, twitterUserId, messageType, text) => {
    console.log('on SendMessage');
    console.log({ id, messageType, text });
    if (messageType === 'DM') {
      TwitClient.post('direct_messages/events/new', {
        "event": {
          "type": "message_create",
          "message_create": {
            "target": {
              "recipient_id": id
            },
            "message_data": {
              "text": text,
            }
          }
        }
      }, (error, data, response) => {
        console.log(response)
        if (error)
          console.log(error);
      });
    } else {
      TwitClient.post('statuses/update', { status: '@' + twitterUserId + ' ' + text, id, in_reply_to_status_id: id }, function (err, data, response) {
        console.log("Posted ", '@' + twitterUserId + ' ' + text);
      });
    }
  };


  const validateWebhook = (token, auth) => {
    console.log("token");
    const responseToken = createHmac('sha256', auth).update(token).digest('base64');
    return { response_token: `sha256=${responseToken}` };
  };
  TwitClient = new Twit({
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    access_token: TWITTER_ACCESS_TOKEN,
    access_token_secret: TWITTER_ACCESS_TOKEN_SECRET
  });

  const webhook = new Autohook({
    token: TWITTER_ACCESS_TOKEN,
    token_secret: TWITTER_ACCESS_TOKEN_SECRET,
    consumer_key: TWITTER_CONSUMER_KEY,
    consumer_secret: TWITTER_CONSUMER_SECRET,
    ngrok_secret: NGROK_TOKEN,
    env: 'dev',
    port: TWITTER_WEBHOOK_PORT
  });
  await webhook.removeWebhooks();
  webhook.on('event', event => {
    if (typeof (event.tweet_create_events) !== 'undefined' &&
      event.tweet_create_events[0].user.screen_name !== TWITTER_ID) {
      const id = event.tweet_create_events[0].user.id;
      const name = event.tweet_create_events[0].user.screen_name;
      const ReceivedMessage = event.tweet_create_events[0].text;
      const message = ReceivedMessage.replace("@" + TWITTER_ID + " ", "");

      console.log("Received message ", message, " from ", name);
      messageResponseHandler(name, message, (response) =>  SendMessage(id, name, 'Tweet', response.value));
    }

    if (typeof (event.direct_message_events) !== 'undefined') {
      if (event.users[event.direct_message_events[0].message_create.sender_id].screen_name !== TWITTER_ID) {
        const id = event.direct_message_events[0].message_create.sender_id;
        const name = event.users[event.direct_message_events[0].message_create.sender_id].screen_name;
        const message = event.direct_message_events[0].message_create.message_data.text;
        console.log("Received message ", message, " from ", name);
        messageResponseHandler(name, message, (response) => SendMessage(id, name, 'DM', response.value));
      }
    }
  });
  await webhook.start();
  await webhook.subscribe({ oauth_token: TWITTER_ACCESS_TOKEN, oauth_token_secret: TWITTER_ACCESS_TOKEN_SECRET, screen_name: TWITTER_ID });

  // handle this
  http.createServer((req, res) => {
    const route = url.parse(req.url, true);
    if (!route.pathname)
      return;

    if (route.query.crc_token) {
      console.log("Validating webhook");
      console.log(route.query.crc_token);
      const crc = validateWebhook(route.query.crc_token, TWITTER_CONSUMER_SECRET);
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(crc));
    }
  }).listen(SERVER_PORT);
};

module.exports = { createTwitterClient }

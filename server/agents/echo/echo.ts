import TelegramBot = require("node-telegram-bot-api");

const Discord = require('discord.js');
const {Util, Intents} = require('discord.js')
const config = require("./config.json");
const util = require('./util.ts')
const DISCORD_API_TOKEN = process.env.DISCORD_API_TOKEN;
const {Autohook} = require('twitter-autohook');
const http = require('http');
const url = require('url');
const Twit = require('twit');

const {
    createHmac,
} = require('crypto');

const token = process.env.TELEGRAM_BOT_TOKEN
const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY;
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET;
const TWITTER_ID = process.env.TWITTER_ID;
const TWITTER_WEBHOOK_PORT = process.env.TWITTER_WEBHOOK_PORT;
const NGROK_TOKEN = process.env.NGROK_TOKEN;
const SERVER_PORT = process.env.SERVER_PORT;


const createEcho = (messageResponseHandler) => {

    if (!DISCORD_API_TOKEN) return console.warn("No API token for Discord bot, skipping");
    //The discord client was crashing with intents, so i've added some Core Intents
    const client = new Discord.Client({intents: [Intents.FLAGS.GUILDS]});
    // We also need to make sure we're attaching the config to the CLIENT so it's accessible everywhere!
    client.on('ready', async function () {
        client.on('message', async (message) => {
            if (message.author.bot)
                return; // Skip own messages
            if (message.channel.type === 'GUILD_TEXT') {
                message.channel.startTyping();
                message.reply(message.content);
                message.channel.stopTyping()

            } else if (message.channel.type === 'DM') {
                message.channel.startTyping();
                message.reply(message.content);
                message.channel.stopTyping()
            }
        });
    });
    client.login(DISCORD_API_TOKEN);
};

const createTelegramEcho = (messageResponseHandler) => {
    if (!token) return console.warn("No API token for Telegram bot, skipping");
    const bot = new TelegramBot(token, {polling: true})

    bot.on('message', (msg) => {
        if (msg.from.is_bot) return
        else bot.sendMessage(msg.chat.id, msg.text)
    })
};


let TwitClient;

const createTwitterEcho = async (messageResponseHandler) => {
    if (!TWITTER_CONSUMER_SECRET || !TWITTER_CONSUMER_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_TOKEN_SECRET)
        return console.warn("No credentials for Twitter, skipping");

    const SendMessage = (id, twitterUserId, messageType, text) => {
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
                if (error) {
                    console.log(error);
                }
            });
        } else {
            TwitClient.post('statuses/update', {
                status: '@' + twitterUserId + ' ' + text,
                id,
                in_reply_to_status_id: id
            }, function (err, data, response) {
                console.log("Posted ", '@' + twitterUserId + ' ' + text);
            });
        }
    };


    const validateWebhook = (token, auth) => {
        console.log("token");
        const responseToken = createHmac('sha256', auth).update(token).digest('base64');
        return {response_token: `sha256=${responseToken}`};
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
            const receivedMessage = event.tweet_create_events[0].text;
            const message = receivedMessage.replace("@" + TWITTER_ID + " ", "");
            console.info("Received message ", message, " from ", name);
            SendMessage(id, name, 'Tweet', message);
        }

        if (typeof (event.direct_message_events) !== 'undefined') {
            if (event.users[event.direct_message_events[0].message_create.sender_id].screen_name !== TWITTER_ID) {
                const id = event.direct_message_events[0].message_create.sender_id;
                const name = event.users[event.direct_message_events[0].message_create.sender_id].screen_name;
                const message = event.direct_message_events[0].message_create.message_data.text;
                console.info("Received message ", message, " from ", name);
                SendMessage(id, name, 'DM', message);
            }
        }
    });
    await webhook.start();
    await webhook.subscribe({
        oauth_token: TWITTER_ACCESS_TOKEN,
        oauth_token_secret: TWITTER_ACCESS_TOKEN_SECRET,
        screen_name: TWITTER_ID
    });

    // handle this
    http.createServer((req, res) => {
        const route = url.parse(req.url, true);
        if (!route.pathname)
            return;

        if (route.query.crc_token) {
            console.log("Validating webhook");
            console.log(route.query.crc_token);
            const crc = validateWebhook(route.query.crc_token, TWITTER_CONSUMER_SECRET);
            res.writeHead(200, {'content-type': 'application/json'});
            res.end(JSON.stringify(crc));
        }
    }).listen(SERVER_PORT);
};
module.exports = {createEcho, createTelegramEcho, createTwitterEcho}

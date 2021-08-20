const Discord = require('discord.js');
const {Util, Intents} = require('discord.js')
const config = require("./config.json");
const util = require('./util.ts')
const DISCORD_API_TOKEN = process.env.DISCORD_API_TOKEN;


const createEcho = (messageResponseHandler) => {

    if (!DISCORD_API_TOKEN) return console.warn("No API token for Discord bot, skipping");
    //The discord client was crashing with intents, so i've added some Core Intents
    const client = new Discord.Client({intents: [Intents.FLAGS.GUILDS]});
    // We also need to make sure we're attaching the config to the CLIENT so it's accessible everywhere!
    client.on('ready', async function () {
        client.on('message', async (message) => {
            if (message.author.bot)
                return; // Skip own messages
            if (message.channel.type === 'text') {
                    message.channel.startTyping();
                    message.reply(message.content);
                    message.channel.stopTyping()

            } else if (message.channel.type === 'dm') {
                message.channel.startTyping();
                message.reply(message.content);
                message.channel.stopTyping()
            }
        });
    });
    client.login(DISCORD_API_TOKEN);
};

module.exports = {createEcho}

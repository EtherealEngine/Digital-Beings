const Discord = require('discord.js');
const {Util, Intents} = require('discord.js')
const config = require("./config.json");
const util = require('./util.ts')
const DISCORD_API_TOKEN = process.env.DISCORD_API_TOKEN;


const createDiscordClient = (messageResponseHandler) => {
    
    if (!DISCORD_API_TOKEN) return console.warn("No API token for Discord bot, skipping");
	//The discord client was crashing with intents, so i've added some Core Intents
    const client = new Discord.Client({ intents: [Intents.FLAGS.GUILDS] });
    // We also need to make sure we're attaching the config to the CLIENT so it's accessible everywhere!
    client.config = config;
    client.helpFields = util.helpFields;
    client._findCommand = util._findCommand;
    client._parseWords = util._parseWords;
    client.messageResponseHandler = messageResponseHandler

    const embed = new Discord.MessageEmbed()
    .setColor(0x00AE86)

    client.embed = embed;
    
    const fs = require('fs');
    fs.readdir(`${__dirname}/events/`, (err, files) => {
      if (err) return console.error(err);
      files.forEach(file => {
        const event = require(`${__dirname}/events/${file}`);
        let eventName = file.split(".")[0];
        client.on(eventName, event.bind(null, client));
      });
    });

    client.commands = new Discord.Collection();

    fs.readdir(`${__dirname}/commands/`, (err, files) => {
      if (err) return console.error(err);
      files.forEach(file => {
        if (!file.endsWith(".ts")) return;
        let props = require(`${__dirname}/commands/${file}`);
        let commandName = file.split(".")[0];
        console.log(`Attempting to load command ${commandName}`);
        client.commands.set(commandName, props);
      });
    });

    client.login(DISCORD_API_TOKEN);
};

module.exports = {createDiscordClient}

import { handleGuildMemberAdd } from './response-events/guildMemberAdd';
import { handleGuildMemberRemove } from './response-events/guildMemberRemove';
import { handleMessageReactionAdd } from './response-events/messageReactionAdd';
import { handleSlashCommand } from './slash_commands/handler';
import { initClient } from './tcpClient';
import { helpFields, _findCommand, _parseWords } from './util';

const Discord = require('discord.js');
const {Util, Intents} = require('discord.js')
const config = require("./config.json");
const DISCORD_API_TOKEN = process.env.DISCORD_API_TOKEN;

export let client = undefined

const createDiscordClient = (messageResponseHandler) => {

    if (!DISCORD_API_TOKEN) return console.warn("No API token for Discord bot, skipping");
    client = new Discord.Client({ intents: [ Intents.GUILDS, Intents.GUILD_MEMBERS, Intents.GUILD_PRESENCES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
    // We also need to make sure we're attaching the config to the CLIENT so it's accessible everywhere!
    client.config = config;
    client.helpFields = helpFields;
    client._findCommand = _findCommand;
    client._parseWords = _parseWords;
    client.messageResponseHandler = messageResponseHandler
    client.bot_name = config.bot_name
    client.name_regex = new RegExp(config.bot_name, 'ig')
    client.username_regex = new RegExp(process.env.BOT_NAME_REGEX, 'ig')
    client.edit_messages_max_count = process.env.EDIT_MESSAGES_MAX_COUNT

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
        console.log('registered event: ' + eventName)
      });
    });

    client.ws.on('INTERACTION_CREATE', async interaction => {
      handleSlashCommand(messageResponseHandler, client, interaction)
    });
    client.on('guildMemberAdd', async user => {
      handleGuildMemberAdd(messageResponseHandler, client, user);
    });
    client.on('guildMemberRemove', async user => {
      handleGuildMemberRemove(messageResponseHandler, client, user)
    });
    client.on('messageReactionAdd', async (reaction, user) => {
      handleMessageReactionAdd(messageResponseHandler, client, reaction, user)
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
        console.log(`Loaded command ${commandName}`)
      });
    });

    client.login(DISCORD_API_TOKEN);
    initClient('127.0.0.1', 7778)
};

module.exports = {createDiscordClient}
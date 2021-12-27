import { handleGuildMemberAdd } from './response-events/guildMemberAdd'
import { handleGuildMemberRemove } from './response-events/guildMemberRemove'
import { handleMessageReactionAdd } from './response-events/messageReactionAdd'
import { handleSlashCommand } from './slash_commands/handler'
import { initClient } from './loggingClient'
import { helpFields, _findCommand, _parseWords } from './util'
import { discordPackerHandler } from './discordPackerHandler'

const Discord = require('discord.js')
const {Util, Intents} = require('discord.js')
// required for message.lineReply
require('discord-inline-reply')
const config = require('./config.json')
const DISCORD_API_TOKEN = process.env.DISCORD_API_TOKEN 

export let client = undefined

const createDiscordClient = () => {
    if (!process.env.DISCORD_API_TOKEN) return console.warn('No API token for Discord bot, skipping');
    client = new Discord.Client({
      partials: ['MESSAGE', 'USER', 'REACTION'],
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]
    })
    //{ intents: [ Intents.GUILDS, Intents.GUILD_MEMBERS, Intents.GUILD_VOICE_STATES, Intents.GUILD_PRESENCES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });
    // We also need to make sure we're attaching the config to the CLIENT so it's accessible everywhere!
    console.log(JSON.stringify(client))
    client.config = config;
    client.helpFields = helpFields;
    client._findCommand = _findCommand;
    client._parseWords = _parseWords;
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
      handleSlashCommand(client, interaction)
    });
    client.on('guildMemberAdd', async user => {
      handleGuildMemberAdd(user);
    });
    client.on('guildMemberRemove', async user => {
      handleGuildMemberRemove(user)
    });
    client.on('messageReactionAdd', async (reaction, user) => {
      handleMessageReactionAdd(reaction, user)
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

    client.login(process.env.DISCORD_API_TOKEN);
    new discordPackerHandler(client)
    initClient('127.0.0.1', 7778)
};

module.exports = {createDiscordClient}
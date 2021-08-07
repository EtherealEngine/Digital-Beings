const Discord = require('discord.js');
const { Util } = require('discord.js')
const DISCORD_API_TOKEN = process.env.DISCORD_API_TOKEN;
const createDiscordClient = (messageResponseHandler) => {
  if(!DISCORD_API_TOKEN) return console.warn("No API token for Discord bot, skipping");
  const client = new Discord.Client();

  client.on('ready', async function () {
    console.log(`the client becomes ready to start`);
    console.log(`I am ready! Logged in as ${client.user.tag}!`);
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);

    client.on('message', async (message) => {
      if (message.author.bot)
        return; // Skip own messages
      if (message.channel.type === 'text') {
        if (message.mentions.has(client.user)) {
          message.channel.startTyping();
          let removeMentions= message.content.split(" ").slice(1).join(" ")
          message.content = removeMentions.replace(/<@[!&]?\d+>/, '[mention]');
          await messageResponseHandler(message.author.username, message.content, (response) => {
            message.channel.send(response.value)
            message.channel.stopTyping();
          });
        }
      } else if (message.channel.type === 'dm') {
        if (message.mentions.has(client.user)) {
          message.channel.startTyping();
          let removeMentions= message.content.split(" ").slice(1).join(" ")
          message.content = removeMentions.replace(/<@[!&]?\d+>/, '[mention]');
          await messageResponseHandler(message.author.username, message.content, (response) => {
            message.author.send(response.value)
            message.channel.stopTyping();
          });
        }
      }
    });
  });

  client.login(DISCORD_API_TOKEN);
};

module.exports = { createDiscordClient }
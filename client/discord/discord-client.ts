const Discord = require('discord.js');
const {Util} = require('discord.js')
const DISCORD_API_TOKEN = process.env.DISCORD_API_TOKEN;
const createDiscordClient = (messageResponseHandler) => {
    if (!DISCORD_API_TOKEN) return console.warn("No API token for Discord bot, skipping");
    const client = new Discord.Client();
    client.on('ready', async function () {
        client.on('message', async (message) => {
            if (message.author.bot)
                return; // Skip own messages
            if (message.channel.type === 'text') {
                if (message.mentions.has(client.user)) {
                    message.channel.startTyping();
                    let removeMentions = message.content.split(" ").slice(1).join(" ")
                    message.content = removeMentions.replace(/<@[!&]?\d+>/, '[mention]');
                    await messageResponseHandler(message.author.username, message.content, (response) => {
                        message.reply(response.value)
                        message.channel.stopTyping();
                    });
                } else {
                    message.reply(message.content);
                }
            } else if (message.channel.type === 'dm') {
                message.channel.startTyping();
                await messageResponseHandler(message.author.username, message.content, (response) => {
                    message.author.send(response.value)
                    message.channel.stopTyping();
                });
            }
        });
    });
    client.login(DISCORD_API_TOKEN);
};

module.exports = {createDiscordClient}

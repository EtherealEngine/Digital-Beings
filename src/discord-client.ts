const Discord = require('discord.js');
const DISCORD_API_TOKEN = process.env.DISCORD_API_TOKEN;
const createDiscordClient = (messageResponseHandler) => {
    if (!DISCORD_API_TOKEN) return console.warn("No API token for Discord bot, skipping");
    const client = new Discord.Client();

    client.on('ready', async function () {
        client.on('message', async (message) => {
            if (message.author.bot)
                return;
            if (message.channel.type === 'text') {
                if (message.content) {
                    message.reply(message.content);
                }
            }
        });
    });
    client.login(DISCORD_API_TOKEN);
};

module.exports = {createDiscordClient}

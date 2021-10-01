import { addMessageToHistory, wasHandled } from "../chatHistory";

module.exports = async (client) => {    
    await client.users.fetch(process.env.LOG_DM_USER_ID).then((user) => {
        client.log_user = user
    }).catch(console.error);

    await client.guilds.fetch(process.env.DISCORD_SERVER_ID).then((server) => {
        server.channels.cache.forEach((channel) => {
            if (channel.type === 'text' && channel.deleted === false) {
                channel.messages.fetch({limit: 100}).then(async messages => {
                    messages.forEach(function (msg) {
                        if (!wasHandled(channel.id, msg.id)) {
                            addMessageToHistory(channel.id, msg.id, msg.author, msg.content)
                        }
                    })
                })
            }
        })
        console.log('added unread messages to chat history')
    })
    
    console.log('client is ready')
}
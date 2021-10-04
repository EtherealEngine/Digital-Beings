import { addMessageInHistoryWithDate, addMessageToHistory, deleteMessageFromHistory, wasHandled } from "../chatHistory";

module.exports = async (client) => {    
    await client.users.fetch(process.env.LOG_DM_USER_ID).then((user) => {
        client.log_user = user
    }).catch(console.error);

    await client.guilds.fetch(process.env.DISCORD_SERVER_ID).then((server) => {
        server.channels.cache.forEach((channel) => {
            if (channel.type === 'text' && channel.deleted === false && channel.permissionsFor(client.user.id).has(['SEND_MESSAGES', 'VIEW_CHANNEL'])) {
                channel.messages.fetch({limit: 100}).then(async messages => {
                    messages.forEach(async function (msg) {
                        if (msg.deleted === true) await deleteMessageFromHistory(channel.id, msg.id)
                        else await wasHandled(channel.id, msg.id, msg.author.username, msg.content, msg.createdTimestamp)
                    })
                })
            } 
        })
    }).catch(err => console.log(err))
    
    console.log('client is ready')
}
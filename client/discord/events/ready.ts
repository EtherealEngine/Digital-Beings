import { tcpClient } from "../../tcpClient";
import { deleteMessageFromHistory, wasHandled } from "../chatHistory";
import { channelTypes } from "../util";

module.exports = async (client) => {
    await client.users.fetch(process.env.LOG_DM_USER_ID).then((user) => {
        client.log_user = user
    }).catch((error) => { console.log(error) });

    await client.guilds.cache.forEach((server) => {
        if (!server.deleted) {
            console.log('fetching messages from server: ' + server.name)
            client.api.applications(client.user.id).guilds(server.id).commands.post({
                data: {
                    name: "continue",
                    description: "makes the agent continue"
                }
            });
            client.api.applications(client.user.id).guilds(server.id).commands.post({
                data: {
                    name: "single_continue",
                    description: "test"
                }
            });
            client.api.applications(client.user.id).guilds(server.id).commands.post({
                data: {
                    name: "say",
                    description: "makes the agent say something",
                    options: [{
                        name: 'text',
                        description: 'text',
                        type: 3,
                        required: true
                    }]
                }
            });

            server.channels.cache.forEach(async (channel) => {
                if (channel.type === channelTypes['text'] && channel.deleted === false && channel.permissionsFor(client.user.id).has(['SEND_MESSAGES', 'VIEW_CHANNEL'])) {
                    tcpClient.getInstance.sendMetadata(channel.name, 'Discord', channel.id, channel.topic || 'none')
                    channel.messages.fetch({limit: 100}).then(async messages => {
                        messages.forEach(async function (msg) {
                            let _author = msg.author.username
                            if (msg.author.isBot || msg.author.username.toLowerCase().includes('digital being')) _author = process.env.BOT_NAME

                            if (msg.deleted === true) { await deleteMessageFromHistory(channel.id, msg.id); console.log('deleted message: ' + msg.content) }
                            else await wasHandled(channel.id, msg.id,_author, msg.content, msg.createdTimestamp)
                        })
                    })
                }
            })
        }
    });
    
    console.log('client is ready')
}
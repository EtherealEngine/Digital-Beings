import { deleteMessageFromHistory, getResponse, onMessageDeleted } from "../chatHistory";

module.exports = async (client, message) => {
    const {author, channel, id} = message; 
    await deleteMessageFromHistory(channel.id, id)
    if (author.id === client.user.id) return
    
    const oldResponse = getResponse(channel.id, id)
    if (oldResponse === undefined) return
    await deleteMessageFromHistory(channel.id, oldResponse)
    
    await channel.messages.fetch({limit: client.edit_messages_max_count}).then(async messages => { 
        messages.forEach(function(resp) {
            if (resp.id === oldResponse) {
                resp.delete()
            }
        })
    }).catch(err => console.log(err))

    onMessageDeleted(channel.id, id)
};
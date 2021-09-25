import { getResponse, onMessageDeleted } from "../chatHistory";

module.exports = (client, message) => {
    const {author, channel, content, id} = message; 
    if (author.id === client.user.id) return
    
    const oldResponse = getResponse(channel.id, id)
    if (oldResponse === undefined) return
    
    channel.messages.fetch({limit: client.edit_messages_max_count}).then(async messages => { 
        messages.forEach(function(resp) {
            if (resp.id === oldResponse) {
                resp.delete()
            }
        })
    })

    onMessageDeleted(channel.id, id)
};
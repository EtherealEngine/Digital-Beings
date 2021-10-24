import { chatFilter } from "../../chatFilter";
import { tcpClient } from "../../tcpClient";
import { userDatabase } from "../../userDatabase";
import { getRandomEmptyResponse } from "../../utils";
import { addMessageToHistory, getResponse, onMessageResponseUpdated, updateMessage } from "../chatHistory";
import { replacePlaceholders } from "../util";

module.exports = async (client, message) => {
    const {author, channel, content, id} = message;
    const oldText = content
    if (userDatabase.getInstance.isUserBanned(author.id, 'discord')) return
    if (author.id === client.user.id) {
        await channel.messages.fetch(id).then(async msg => {
            console.log('updating local msg to db')
            await updateMessage(channel.id, id, msg.content)
         });
         console.log('same author')
         return
    }

     const oldResponse = getResponse(channel.id, id)
     if (oldResponse === undefined) {
        await channel.messages.fetch(id).then(async msg => {
            await updateMessage(channel.id, id, msg.content)
         });
         console.log('message not found')
         return
     }
 
     channel.messages.fetch(oldResponse).then(async msg => { 
         channel.messages.fetch({limit: client.edit_messages_max_count}).then(async messages => {
             messages.forEach(async function(edited) {
                 if (edited.id === id) {
                    const date = new Date();
                    const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
                    const utcStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()

                    tcpClient.getInstance.sendMessageEdit(edited.content, edited.id, 'Discord', edited.channel.id, utcStr, false)
                 }
             })
            })
     }).catch(err => console.log(err + ' - ' + err.stack))
};
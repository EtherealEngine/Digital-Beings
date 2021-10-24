import { tcpClient } from "../../tcpClient";

const emoji = require("emoji-dictionary");

export async function handleMessageReactionAdd(reaction, user) {
    const { message } = reaction
    const emojiName = emoji.getName(reaction.emoji)    

    const dateNow = new Date();
    var utc = new Date(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), dateNow.getUTCHours(), dateNow.getUTCMinutes(), dateNow.getUTCSeconds());
    const utcStr = dateNow.getDate() + '/' + (dateNow.getMonth() + 1) + '/' + dateNow.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
    
    tcpClient.getInstance.sendMessageReactionAdd('Discord', message.channel.id, message.id, message.content, user.username, emojiName, utcStr)
};
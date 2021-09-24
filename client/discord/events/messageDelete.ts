import { channelHistory, chatHistory, getMessage, onMessageDeleted, perUserHistory, prevMessage, prevMessageTimers, pushMessageToChannelHistory } from "../chatHistory";

module.exports = (client, message) => {
    const {author, channel, content, mentions, id} = message; 
    onMessageDeleted(channel.id, id)
    console.log('on message deleted: ' + content)
};
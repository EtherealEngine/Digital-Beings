import { channelHistory, chatHistory, onMessageDeleted, perUserHistory, prevMessage, prevMessageTimers, pushMessageToChannelHistory } from "../chatHistory";

module.exports = (client, message) => {
    const {author, channel, content, mentions, id} = message; 
    console.log('on message edited: ' + content)
};
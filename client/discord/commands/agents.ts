import { pushMessageToChannelHistory } from "../chatHistory";

export async function run (client, message, args, author, addPing, channel) {
    await client.messageResponseHandler(args, (res) => {
        let str: string = ''
        Object.keys(res.response).map(function(key, index) {
            const label = res.response[key];
            const agent_name = key;
            str += 'name: ' + label + ', value: ' + agent_name + '\n'
        });
        const text = 'available agents: ' + str
        message.channel.send(text)
        pushMessageToChannelHistory(channel, message.id, text, client.user.id)

        message.channel.stopTyping();
    });
}
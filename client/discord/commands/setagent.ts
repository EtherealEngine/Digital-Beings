import { pushMessageToChannelHistory } from "../chatHistory";

exports.run = async (client, message, args, author, addPing, channel) => {
    if (args.grpc_args.message === undefined || args.grpc_args.message === '') {
        client.embed.description = 'Wrong format, !pingagent agent=agent context=value'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }
    const msg = args.grpc_args.message
    if (!msg.includes(',')) {
        client.embed.description = 'Wrong format, !pingagent agent=agent context=value'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }
    const data = msg.split(',')
    if (data.length !== 2) {
        client.embed.description = 'Wrong format, !pingagent agent=agent context=value'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }
    const nameData = data[0].split('=')
    if (nameData.length !== 2) {
        client.embed.description = 'Wrong format, !pingagent agent=agent context=value'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }
    const name = nameData[1].trim()
    const contextData = data[1].split('=')
    if (contextData.length !== 2) {
        client.embed.description = 'Wrong format, !pingagent agent=agent context=value'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }
    const context = contextData[1].trim()
    if (name === undefined || name === '' || context === undefined || context === '') {
        client.embed.description = 'Wrong format, !pingagent agent=agent context=value'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }
    await client.messageResponseHandler(args, (response) => {
        Object.keys(response.response).map(function(key, index) {
            if (response.response[key].length <= 2000 && response.response[key].length > 0) {
                client.embed
                .addFields({name: key, value: response.response[key]})
            }
        }); 
        if (client.embed.fields.length === 0) client.embed.description = 'empty response'
        message.channel.send(client.embed);
        client.embed.description = ''
        client.embed.fields = [];  // clear previous responses
        pushMessageToChannelHistory(channel, message.id, '{set agent}', client.user.id)
        message.channel.stopTyping();
    });
}
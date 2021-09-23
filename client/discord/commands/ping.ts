import { getRandomEmptyResponse, replacePlaceholders } from "../util";

exports.run = async (client, message, args) => {
    if ( args.grpc_args.message === undefined ||  args.grpc_args.message === '' || args.grpc_args.message.replace(/\s/g, '').length === 0) {
        client.embed.description = 'Wrong format, !ping message'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }
    await client.messageResponseHandler(args, (response) => {
        Object.keys(response.response).map(function(key, index) {
            console.log('response: ' + response.response[key])
            if (response.response[key] !== undefined && response.response[key].length <= 2000 && response.response[key].length > 0) {
                message.channel.send(key + ': ' + replacePlaceholders(response.response[key]))
            }
            else {
                const emptyResponse = getRandomEmptyResponse()
                console.log('sending empty response: ' + emptyResponse)
                message.channel.send(key + ': ' + emptyResponse)
            }
        });          
        message.channel.stopTyping();
    });
}
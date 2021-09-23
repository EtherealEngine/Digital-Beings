import { getRandomEmptyResponse, replacePlaceholders } from "../util";

exports.run = async (client, message, args) => {
    if (args.grpc_args.message === undefined || args.grpc_args.message === '' || args.grpc_args.message.replace(/\s/g, '').length === 0 
    || args.grpc_args.message.includes('agent=') || args.grpc_args.agent === undefined || args.grpc_args.agent === '' || args.grpc_Args.agent.replace(/\s/g, '').length === 0) {
        client.embed.description = 'Wrong format, !pingagent agent=agent message=value'
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
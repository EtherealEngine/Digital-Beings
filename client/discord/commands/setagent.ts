export async function run (client, message, args, author, addPing, channel) {
    if (args.grpc_args.message === undefined || args.grpc_args.message === '') {
        client.embed.description = 'Wrong format, !setagent agent=agent context=value'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }
    if (args.grpc_args['name'] === undefined || args.grpc_args['name'] === '' || args.grpc_args['context'] === undefined || args.grpc_args['context'] === '') {
        client.embed.description = 'Wrong format, !setagent agent=agent context=value'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }
    await client.messageResponseHandler(args, (response) => {
        console.log('setagents response: ' + JSON.stringify(response))
        let str = ''
        Object.keys(response.response).map(function(key, index) {
            if (response.response[key].length <= 2000 && response.response[key].length > 0) {
                str += key + ': ' + response.response[key] + '\n'
            }
        }); 
        if (str.length === 0 ) str = 'empty response'
        message.channel.send(str)
        message.channel.stopTyping();
    }).catch(err => console.log(err))
}
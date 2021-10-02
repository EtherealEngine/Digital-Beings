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
        message.channel.stopTyping();
    }).catch(err => console.log(err))
}
exports.run = async (client, message, args) => {
    if ( args.grpc_args.message === undefined ||  args.grpc_args.message === '') {
        client.embed.description = 'Wrong format, !ping message'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }
    await client.messageResponseHandler(args, (response) => {
        Object.keys(response.response).map(function(key, index) {
            if (response.response[key].length <= 2000) {
            client.embed
            .addFields({name: key, value: response.response[key]})
            }
        });          
        if (client.embed.fields.length === 0) client.embed.description = 'empty response'
        message.channel.send(client.embed);
        client.embed.description = ''
        client.embed.fields = [];  // clear previous responses
        message.channel.stopTyping();
    });
}
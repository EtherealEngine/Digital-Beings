exports.run = async (client, message, args) => {
    args['grpc_method'] = args.grpc_method;
    args['grpc_args'] = {};
    await client.messageResponseHandler(args, (response) => {  
        Object.keys(response).map(function(key, index) {
            client.embed
            .addFields({name: key, value: response[key]})
        });
        message.channel.send(client.embed);
        client.embed.fields = [];  // clear previous responses
        message.channel.stopTyping();
    });
}
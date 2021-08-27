exports.run = async (client, message, args) => {
    await client.messageResponseHandler(args, (response) => {
        Object.keys(response.responses).map(function(key, index) {
            client.embed
            .addFields({name: key, value: response.responses[key]})
        });          
        message.channel.send(client.embed);
        client.embed.fields = [];  // clear previous responses
        message.channel.stopTyping();
    });
}
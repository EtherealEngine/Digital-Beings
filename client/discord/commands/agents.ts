exports.run = async (client, message, args) => {
    await client.messageResponseHandler(args, (response) => {
        Object.keys(response.response).map(function(key, index) {
            index++
            client.embed
            .addFields({name: index, value: key})
        });
        message.channel.send(client.embed);
        client.embed.fields = [];  // clear previous responses
        message.channel.stopTyping();
    });
}
exports.run = async (client, message, args) => {
    await client.messageResponseHandler(args, (res) => {
        Object.keys(res.response).map(function(key, index) {
            const label = res.response[key];
            const agent_name = key;
            client.embed
            .addFields({name: label , value: agent_name})
            
        });
        message.channel.send(client.embed);
        client.embed.fields = [];  // clear previous responses

        message.channel.stopTyping();
    });
}
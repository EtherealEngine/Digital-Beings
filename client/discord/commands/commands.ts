exports.run = async (client, message, args) => {
    client.helpFields[0].commands.forEach(function (item, index) {
        client.embed
        .addFields({name: '!'+item[0] , value: item[3]})
    });       
    message.channel.send(client.embed);
    client.embed.fields = [];  // clear previous responses
    message.channel.stopTyping();
}
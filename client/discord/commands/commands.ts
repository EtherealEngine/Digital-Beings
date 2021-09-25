export async function run (client, message, args, author, addPing, channel) {
    client.helpFields[0].commands.forEach(function (item, index) {
        if (item[3].length <= 2000 && item[3].length > 0) {
        client.embed
        .addFields({name: '!'+item[0] , value: item[3]})
        }
    });       
    if (client.embed.fields.length === 0) client.embed.description = 'empty response'
    message.channel.send(client.embed);
    client.embed.description = ''
    client.embed.fields = [];  // clear previous responses
    message.channel.stopTyping();
}
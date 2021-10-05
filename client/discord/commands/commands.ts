export async function run (client, message, args, author, addPing, channel) {
    let str = ''
    client.helpFields[0].commands.forEach(function (item, index) {
        if (item[3].length <= 2000 && item[3].length > 0) {
            str += '!' + item[0] + ' - ' + item[3] + '\n'
        }
    });       
    if (str.length === 0) client.embed.description = 'empty response'
    message.channel.send(str);
    message.channel.stopTyping();
}
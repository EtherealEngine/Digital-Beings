exports.run = async (client, message, args) => {
    await client.messageResponseHandler(args, (res) => {
        let str: string = ''
        Object.keys(res.response).map(function(key, index) {
            const label = res.response[key];
            const agent_name = key;
            str += 'name: ' + label + ', value: ' + agent_name + '\n'
            
        });
        client.embed.description = str === '' ? 'not agents found' : str
        message.channel.send(client.embed)
        client.embed.fields = [];  // clear previous responses
        client.embed.description = ''

        message.channel.stopTyping();
    });
}
exports.run = async (client, message, args, author, addPing) => {
    await client.messageResponseHandler(args, (res) => {
        let str: string = ''
        Object.keys(res.response).map(function(key, index) {
            const label = res.response[key];
            const agent_name = key;
            str += 'name: ' + label + ', value: ' + agent_name + '\n'
        });
        message.channel.send('available agents: ' + str)

        message.channel.stopTyping();
    });
}
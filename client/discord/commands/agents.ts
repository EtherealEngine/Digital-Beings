export async function run (client, message, args, author, addPing, channel) {
    await client.messageResponseHandler(args, (res) => {
        let str: string = ''
        Object.keys(res.response).map(function(key, index) {
            const label = res.response[key];
            const agent_name = key;
            str += `name: ${agent_name}\n`
        });
        const text = 'available agents: \n' + str
        message.channel.send(text)

        message.channel.stopTyping();
    }).catch(err => console.log(err))
}
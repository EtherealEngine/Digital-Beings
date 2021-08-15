exports.run = async (client, message, args) => {
    await client.messageResponseHandler(args, (response) => {
        message.channel.send(Object.values(response).join().replace(",", "\n"))
        message.channel.stopTyping();
    });
}
exports.run = async (client, message, args) => {
    args['grpc_method'] = args.grpc_method;
    args['grpc_args'] = {};
    await client.messageResponseHandler(args, (response) => {
        message.channel.send(Object.values(response).join().replace(",", "\n"))
        message.channel.stopTyping();
    });
}
module.exports = (client, message) => {
    const args = {}
    args['grpc_args'] = {};

    const {author, channel, content, mentions} = message;

    // Ignore all bots
    if (author.bot) return;

    const isMention = (
        channel.type === 'text' ||
        channel.type === 'dm') && mentions.has(client.user);

    // This is not great, but if the start of a message is any mention,
    // and we are mentioned at all in this message, trim the mention at the start
    // of the message and continue processing
    const messageContent = isMention ? content.slice(content.indexOf('>') + 1).trim() : content;

    console.log(`DEBUG messageContent |${messageContent}| , isMention=${isMention}`);

    // Ignore messages not starting with the prefix (in config.json), unless a mention
    const containsPrefix = messageContent.indexOf(client.config.prefix) === 0;

    // If we are not being messaged and the prefix is not present, ignore message
    if(!containsPrefix && !isMention) return;

    // Our standard argument/command name definition.
    args['parsed_words'] = (containsPrefix
        ? messageContent.slice(client.config.prefix.length)
        : messageContent)
        .trim().split(/ +/g);
    const command = args['parsed_words'].shift().toLowerCase();

    // Grab the command data from the client.commands Enmap
    const cmd = client.commands.get(command);

    args['command_info'] = client._findCommand(command);
    args['grpc_args']['sender'] = author.username;
    if (args['command_info']) {
        args['command'] = args['command_info'][0];
        args['grpc_args']['message'] = messageContent.replace("!" + args['command'], "");  //remove .command from message
        args['grpc_method'] = args['command_info'][1][0];
        args['grpc_method_params'] = args['command_info'][2];
    }
    if (args['command'] == 'setagent' || args['command'] == 'pingagent') {
        const splitArgs = args['grpc_args']['message'].trim().split(",");
        splitArgs.forEach(element => {
            args['grpc_args'][element.trim().split("=")[0]] = element.trim().split("=")[1];
        });
    }

    // If that command doesn't exist, silently exit and do nothing
    if (!cmd) return;

    channel.startTyping();
    // Run the command
    cmd.run(client, message, args);
};

let botNameRegExp: RegExp = undefined

module.exports = (client, message) => {
    const args = {}
    args['grpc_args'] = {};

    let {author, channel, content, mentions} = message;

    // Ignore all bots
    if (author.bot) return;

    const botMention = '<@!' + client.user + '>';
    const isDM = channel.type === 'dm';
    const isMention = (channel.type === 'text' || isDM) && (mentions.has(client.user))
    const isDirectMethion = content.toLowerCase().includes(client.bot_name.toLowerCase()) 
    if (isDirectMethion) {
        if (botNameRegExp === undefined) botNameRegExp = new RegExp(client.bot_name, 'ig')
        content = '!ping ' + content.replace(botNameRegExp, '').trim()
    }
    

    // Set flag to true to skip using prefix if mentioning or DMing us
    const prefixOptionalWhenMentionOrDM = client.config.prefixOptionalWhenMentionOrDM

    const msgStartsWithMention = content.startsWith(botMention);

    const messageContent = (isMention && msgStartsWithMention) ? content.replace(botMention, '').trim() : content;

    const containsPrefix = messageContent.indexOf(client.config.prefix) === 0;

    // If we are not being messaged and the prefix is not present (or bypassed via config flag), ignore message,
    // so if msg does not contain prefix and either of
    //   1. optional flag is not true or 2. bot has not been DMed or mentioned,
    // then skip the message.
    if (!containsPrefix && (!prefixOptionalWhenMentionOrDM || (!isMention && !isDM))) return;

    // Our standard argument/command name definition.
    args['parsed_words'] = (containsPrefix
        ? messageContent.slice(client.config.prefix.length)
        : messageContent)
        .trim().split(/ +/g);
    const command = args['parsed_words'].shift().toLowerCase();

    // Grab the command data from the client.commands Enmap
    let cmd = client.commands.get(command);

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

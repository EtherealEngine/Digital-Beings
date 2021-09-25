import { exitConversation, isInConversation, prevMessage, prevMessageTimers, pushMessageToChannelHistory, sentMessage } from "../chatHistory";

module.exports = (client, message) => {
    const args = {}
    args['grpc_args'] = {};

    let {author, channel, content, mentions, id} = message;

    if (content === '') content = 'sent media'
    let _prev = undefined
    if (!author.bot) {
        _prev = prevMessage[channel.id]
        prevMessage[channel.id] = author
        if (prevMessageTimers[channel.id] !== undefined) clearTimeout(prevMessageTimers[channel.id])
        prevMessageTimers[channel.id] = setTimeout(() => prevMessage[channel.id] = '', 120000)
    }
    const addPing = _prev !== undefined && _prev !== '' && _prev !== author
    pushMessageToChannelHistory(channel.id, id, content, author.id)

    // Ignore all bots
    if (author.bot) return;

    const botMention = '<@!' + client.user + '>';
    const isDM = channel.type === 'dm';
    const isMention = (channel.type === 'text' || isDM) && (mentions.has(client.user))
    const otherMention = !isMention && mentions.members.size > 0
    if (otherMention) {
        exitConversation(author.id)
        mentions.members.forEach(pinged => exitConversation(pinged.id))
    }
    const isDirectMethion = !content.startsWith('!') && content.toLowerCase().includes(client.bot_name.toLowerCase()) 
    const isUserNameMention = (channel.type === 'text' || isDM) && content.toLowerCase().match(client.username_regex)
    const isInDiscussion = isInConversation(author.id)
    if (!content.startsWith('!ping') && !otherMention) {
        if (isMention) content = '!ping ' + content.replace(botMention, '').trim()
        else if (isDirectMethion) content = '!ping ' + content.replace(client.name_regex, '').trim()
        else if (isUserNameMention) {
            if (client.username_regex === undefined) client.username_regex = new RegExp('((?:digital|being)(?: |$))', 'ig')
            content = '!ping ' + content.replace(client.username_regex, '').trim()
        }
        else if (isInDiscussion) content = '!ping ' + content
    }

    if (content.startsWith('!ping')) sentMessage(author.id)

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
    cmd.run(client, message, args, author, addPing, channel.id);
};
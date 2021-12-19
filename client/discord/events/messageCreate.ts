import { exec } from 'child_process'
import { chatFilter, toxicityTest } from '../../chatFilter'
import { userDatabase } from '../../userDatabase'
import { startsWithCapital } from '../../utils'
import {
    addMessageToHistory, exitConversation, isInConversation,
    moreThanOneInConversation, prevMessage, prevMessageTimers,
    sentMessage
} from '../chatHistory'
const emojiRegex = require('emoji-regex')
const emoji = require('emoji-dictionary')
import * as fs from 'fs'
import { channelTypes } from '../util'

module.exports = async (client, message) => {
    const reg = emojiRegex();
    let match;
    let emojis: { name: string, emoji: any }[] = []
    while((match = reg.exec(message.content)) !== null) {
        emojis.push({ name: emoji.getName(match[0]), emoji: match[0] });
        message.content = message.content.replace(match[0], match[0] + ' :' + emoji.getName(match[0]) + ':');
    }
    const args = {}
    args['grpc_args'] = {};

    let {author, channel, content, mentions, id} = message;
    if (process.env.DIGITAL_BEINGS_ONLY === 'True' && !channel.topic.toLowerCase().includes('digital being')) {
        console.log('db only')
        return
    }
    if (userDatabase.getInstance.isUserBanned(author.id, 'discord')) {
        return
    }

    if (mentions !== null && mentions.members !== null && mentions.members.size > 0) {
        console.log('has mentions')
        const data = content.split(' ')
        for (let i = 0; i < data.length; i++) {
            if (data[i].startsWith('<@!') && data[i].charAt(data[i].length - 1) === '>') {
                try {
                    const x = data[i].replace('<@!', '').replace('>', '')
                    const user = await client.users.cache.find(user => user.id == x)
                    if (user !== undefined) {   
                        //const u = '@' + user.username + '#' + user.discriminator
                        const u = user.id == client.user ? process.env.BOT_NAME : user.username
                        content = content.replace(data[i], u)
                    }
                } catch(err) { console.log(err) }
            }
        }
    }

    // Warn an offending user about their actions
    let warn_offender = function(_user, ratings) {
        author.send(`You've got ${ratings} warnings and you will get blocked at 10!`)
    }
    // Ban an offending user
    let ban_offender = function (message, _user) {
        userDatabase.getInstance.banUser(author.id, 'discord')
        console.log(message)
        // TODO doesn't work with both discord-inline-reply and discord-reply
        // message.lineReply('blocked')
        author.send(`You've been blocked!`)
    }
    // Collect obscene words for further actions / rating
    const obscenities = chatFilter.getInstance.collectObscenities(content, author.id)
    // OpenAI obscenity detector
    let obscenity_count = obscenities.length
    if (parseInt(process.env.OPENAI_OBSCENITY_DETECTOR, 10) && !obscenity_count) {
        obscenity_count = await toxicityTest(message)
    }
    // Process obscenities
    if (obscenity_count > 0) {
        chatFilter.getInstance.handleObscenities(
            message,
            'discord',
            obscenity_count,
            warn_offender,
            ban_offender
        )
    }

    // ...
    if (obscenities !== undefined && obscenities.length > 0) {
        for(let word in obscenities) {
            content = content.replace(new RegExp(obscenities[word], 'ig'), '')
        }
    }

    if (content === '') return 
    let _prev = undefined
    if (!author.bot) {
        _prev = prevMessage[channel.id]
        prevMessage[channel.id] = author
        if (prevMessageTimers[channel.id] !== undefined) clearTimeout(prevMessageTimers[channel.id])
        prevMessageTimers[channel.id] = setTimeout(() => prevMessage[channel.id] = '', 120000)
    }
    const addPing = (_prev !== undefined && _prev !== '' && _prev !== author) || moreThanOneInConversation()
    // Ignore all bots
    if (author.bot) return
    addMessageToHistory(channel.id, id, author.username, content)

    const botMention = `<@!${client.user}>`;
    const isDM = channel.type === channelTypes['dm']
    const isMention = (channel.type === channelTypes['text'] && (mentions.has(client.user))) || isDM
    const otherMention = !isMention && mentions.members !== null && mentions.members.size > 0
    // TODO someone should document this section. I guess it's about detecting a conversation start,
    // but it ignores all the other starting words and I have no idea how it's used.
    // As usual with DigitalBeing code.
    let startConv = false
    let startConvName = ''
    if (!isMention && !otherMention) {
        const trimmed = content.trimStart()
        if (trimmed.toLowerCase().startsWith('hi')) {
            const parts = trimmed.split(' ')
            if (parts.length > 1) {
                if (!startsWithCapital(parts[1])) {
                    startConv = true
                }
                else {
                    startConv = false
                    startConvName = parts[1]
                }
            }
            else {
                if (trimmed.toLowerCase() === 'hi') {
                    startConv = true
                } 
            }
        }
    }
    if (otherMention) {
        exitConversation(author.id)
        mentions.members.forEach(pinged => exitConversation(pinged.id))
    }
    if (!startConv && !isMention) {
        if (startConvName.length > 0) {
            exitConversation(author.id)
            exitConversation(startConvName)
        }
    }
    const isDirectMethion = !content.startsWith('!') && content.toLowerCase().includes(client.bot_name.toLowerCase()) 
    const isUserNameMention = (channel.type === channelTypes['text'] || isDM) &&
                               content.toLowerCase().replace(',', '')
                               .replace('.', '').replace('?', '').replace('!', '')
                               .match(client.username_regex)
    const isInDiscussion = isInConversation(author.id)
    if (!content.startsWith('!') && !otherMention) {
        if (isMention) content = '!ping ' + content.replace(botMention, '').trim()
        else if (isDirectMethion) content = '!ping ' + content.replace(client.name_regex, '').trim()
        else if (isUserNameMention) {
            content = '!ping ' + content.replace(client.username_regex, '').trim()
        }
        else if (isInDiscussion || startConv) content = '!ping ' + content
    }

    if (content.startsWith('!ping')) {
        sentMessage(author.id)
        const mention = `<@!${client.user.id}>`;
        if (content.startsWith('!ping join') || content.startsWith('!ping ' + mention + ' join')) {
            const d = content.split(' ')
            const index = d.indexOf('join') + 1
            if (d.length > index) {
                const channelName = d[index]
                await message.guild.channels.cache.forEach(async (channel) => {
                    if (channel.type === channelTypes['voice'] && channel.name === channelName) {
                        const connection = await channel.join()
                        const receiver = connection.receiver
                        const userStream = receiver.createStream(author, {mode:'pcm', end: 'silence'})
                        const writeStream = fs.createWriteStream('recording.pcm', {})

                        const buffer = []
                        userStream.on('data', (chunk) => {
                            buffer.push(chunk)
                            console.log(chunk)
                            userStream.pipe(writeStream)
                        });
                        writeStream.on('pipe', console.log)
                        userStream.on('finish', () => {
                            channel.leave()
                            /*const cmd = 'ffmpeg -i recording.pcm recording.wav';
                            exec(cmd, (error, stdout, stderr) => {
                                if (error) {
                                    console.log(`error: ${error.message}`);
                                    return;
                                }
                                if (stderr) {
                                    console.log(`stderr: ${stderr}`);
                                    return;
                                }
                                console.log(`stdout: ${stdout}`);
                            });*/
                        });
                        return false
                    }
                })
                return
            }
        }
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
    if (channel.type === channelTypes['thread']) {
        args['grpc_args']['isThread'] = true
        args['grpc_args']['parentId'] = channel.parentId
    } else {
        args['grpc_args']['isThread'] = false
    }

    // If that command doesn't exist, silently exit and do nothing
    if (!cmd) return;

    channel.sendTyping();
    // Run the command
    cmd.run(client, message, args, author, addPing, channel.id).catch(err => console.log(err))
};
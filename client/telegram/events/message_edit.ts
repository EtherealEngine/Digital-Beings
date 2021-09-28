import { getRandomEmptyResponse } from "../../utils"
import { exitConversation, isInConversation, onMessageResponseUpdated, prevMessage, prevMessageTimers, sentMessage } from "../chatHistory"
import { username_regex } from "../telegram-client"

export function onMessageEdit(bot, msg, messageResponseHandler) {
    const date = Date.now() / 1000
    const msgDate = msg.date
    const diff = date - msgDate
    const hours_diff = Math.ceil(diff/3600)
    const mins_diff = Math.ceil((diff-hours_diff)/60)
    if (mins_diff > 12 || (mins_diff <= 12 && hours_diff > 1)) return
    let content = msg.text
    const _sender = msg.from.username === undefined ? msg.from.first_name : msg.from.username
    let addPing = false
    console.log(msg)
    if (msg.chat.type == 'supergroup') {
        if (content === '') content = '{sent media}'
        let _prev = undefined
        if (!msg.from.is_bot) {
            _prev = prevMessage[msg.chat.id]
            prevMessage[msg.chat.id] = msg.from.username
            if (prevMessageTimers[msg.chat.id] !== undefined) clearTimeout(prevMessageTimers[msg.chat.id])
            prevMessageTimers[msg.chat.id] = setTimeout(() => prevMessage[msg.chat.id] = '', 120000)
        }
        addPing = _prev !== undefined && _prev !== '' && _prev !== msg.from.username

        const isMention = msg.entities !== undefined && msg.entities.length === 1 && msg.entities[0].type === 'mention' && content.includes('@' + process.env.TELEGRAM_BOT_NAME)
        const otherMention = msg.entities !== undefined && msg.entities.length > 0 && msg.entities[0].type === 'mention'  && !content.includes('@' + process.env.TELEGRAM_BOT_NAME)
        if (otherMention) {
            exitConversation(msg.from.id)
            for(let i = 0; i < msg.entities.length; i++) {
                exitConversation(_sender)
                if (msg.entities[i].type === 'mention') {
                    const _user = msg.text.slice(msg.entities[i].offset + 1, msg.entities[i].length)
                    exitConversation(_user)
                }
            }
        }

        const isUserNameMention = content.toLowerCase().match(username_regex)
        const isInDiscussion = isInConversation(msg.from.username)
        if (!content.startsWith('!') && !otherMention) {
            if (isMention) content = '!ping ' + content.replace('!', '').trim()
            else if (isUserNameMention) content = '!ping ' + content.replace(username_regex, '').trim()
            else if (isInDiscussion) content = '!ping ' + content
        }

        if (content.startsWith('!ping')) sentMessage(msg.from.username)
    }
    else {
        content = '!ping ' + content
    }

    console.log(msg.chat.type + ' - ' + content)

    if (content === '!ping ' || !content.startsWith('!ping')) return

    const args = {}
    args['grpc_args'] = {};

    args['parsed_words'] = content.slice('!'.length).trim().split(/ +/g);

    args['command_info'] = [
        'ping',
        [ 'HandleMessage' ],
        [ 'sender', 'message' ],
        'ping all agents'
    ]
    args['grpc_args']['sender'] = _sender
    if (args['command_info']) {
        args['command'] = args['command_info'][0];
        args['grpc_args']['message'] = content.replace("!" + args['command'], "");
        args['grpc_method'] = args['command_info'][1][0];
        args['grpc_method_params'] = args['command_info'][2];
    }

    console.log(JSON.stringify(args))
    messageResponseHandler(args, (response) => {
        console.log(JSON.stringify(response))
        Object.keys(response.response).map(function(key, index) {
            console.log('response: ' + response.response[key])
            if (response.response[key] !== undefined && response.response[key].length <= 2000 && response.response[key].length > 0) {
                let text = response.response[key]
                while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                if (addPing) bot.sendMessage(msg.chat.id,`<a href="tg://user?id=${msg.from.id}">${msg.from.first_name}</a> ${text}`, {parse_mode: 'HTML'}).then(_resp => onMessageResponseUpdated(_resp.chat.id, msg.message_id, _resp.message_id))          
                else bot.sendMessage(msg.chat.id,text).then(_resp => onMessageResponseUpdated(_resp.chat.id, msg.message_id, _resp.message_id))          
            }
            else if (response.response[key].length > 2000) {
                const lines: string[] = []
                let line: string = ''
                for(let i = 0; i < response.response[key].length; i++) {
                    line+= response.response[key]
                    if (i >= 1980 && (line[i] === ' ' || line[i] === '')) {
                        lines.push(line)
                        line = ''
                    }
                }

                for (let i = 0; i< lines.length; i++) {
                    if (lines[i] !== undefined && lines[i] !== '' && lines[i].replace(/\s/g, '').length !== 0) {
                        if (i === 0) {
                            let text = lines[1]
                            while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                            if (addPing) bot.sendMessage(msg.chat.id,`<a href="tg://user?id=${msg.from.id}">${msg.from.first_name}</a> ${text}`, {parse_mode: 'HTML'}).then(_resp => onMessageResponseUpdated(_resp.chat.id, msg.message_id, _resp.message_id))          
                            else bot.sendMessage(msg.chat.id,text).then(_resp => onMessageResponseUpdated(_resp.chat.id, msg.message_id, _resp.message_id))          
                        }
                    }
                }
            }
            else {
                let emptyResponse = getRandomEmptyResponse()
                while (emptyResponse === undefined || emptyResponse === '' || emptyResponse.replace(/\s/g, '').length === 0) emptyResponse = getRandomEmptyResponse()
                if (addPing) bot.sendMessage(msg.chat.id,`<a href="tg://user?id=${msg.from.id}">${msg.from.first_name}</a> ${emptyResponse}`, {parse_mode: 'HTML'}).then(_resp => onMessageResponseUpdated(_resp.chat.id, msg.message_id, _resp.message_id))          
                else bot.sendMessage(msg.chat.id,emptyResponse).then(_resp => onMessageResponseUpdated(_resp.chat.id, msg.message_id, _resp.message_id))          
            }
        });          
    });
}
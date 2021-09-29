import { getRandomEmptyResponse } from "../../utils"
import { addMessageToHistory, exitConversation, getResponse, isInConversation, onMessageResponseUpdated, prevMessage, prevMessageTimers, sentMessage, updateEditedMessage } from "../chatHistory"
import { botName, username_regex } from "../telegram-client"

export function onMessageEdit(bot, msg, messageResponseHandler) {
    console.log('edited_message: ' + JSON.stringify(msg))
    const date = Date.now() / 1000
    const msgDate = msg.date
    const diff = date - msgDate
    const hours_diff = Math.ceil(diff/3600)
    const mins_diff = Math.ceil((diff-hours_diff)/60)
    if (mins_diff > 12 || (mins_diff <= 12 && hours_diff > 1)) return
    const _sender = msg.from.username === undefined ? msg.from.first_name : msg.from.username

    updateEditedMessage(msg.chat.id, msg.message_id, msg.text)
    if (msg.from.is_bot) return

    const oldResponse = getResponse(msg.chat.id, msg.message_id)
    if (oldResponse === undefined) return
    
    const newText = msg.text.startsWith('!ping') ? msg.text : '!ping ' + msg.text

    const args = {}
    args['grpc_args'] = {};

    args['parsed_words'] = newText.slice('!'.length).trim().split(/ +/g);

    args['command_info'] = [
        'ping',
        [ 'HandleMessage' ],
        [ 'sender', 'message' ],
        'ping all agents'
      ]
    args['grpc_args']['sender'] = _sender
    if (args['command_info']) {
        args['command'] = args['command_info'][0];
        args['grpc_args']['message'] = newText.replace("!" + args['command'], "");
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
                bot.sendMessage(msg.chat.id,`<a href="tg://user?id=${msg.from.id}">${msg.from.first_name}</a> ${text}`, {parse_mode: 'HTML'}).then(function (_resp) {
                    onMessageResponseUpdated(_resp.chat.id, msg.message_id, _resp.message_id)
                    addMessageToHistory(_resp.chat.id, _resp.message_id, botName, text)
                    })                
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
                            bot.sendMessage(msg.chat.id,`<a href="tg://user?id=${msg.from.id}">${msg.from.first_name}</a> ${text}`, {parse_mode: 'HTML'}).then(function (_resp) {
                                onMessageResponseUpdated(_resp.chat.id, msg.message_id, _resp.message_id)
                                addMessageToHistory(_resp.chat.id, _resp.message_id, botName, text)
                                })      
                        }
                    }
                }
            }
            else {
                let emptyResponse = getRandomEmptyResponse()
                while (emptyResponse === undefined || emptyResponse === '' || emptyResponse.replace(/\s/g, '').length === 0) emptyResponse = getRandomEmptyResponse()
                bot.sendMessage(msg.chat.id,`<a href="tg://user?id=${msg.from.id}">${msg.from.first_name}</a> ${emptyResponse}`, {parse_mode: 'HTML'}).then(function (_resp) {
                    onMessageResponseUpdated(_resp.chat.id, msg.message_id, _resp.message_id)
                    addMessageToHistory(_resp.chat.id, _resp.message_id, botName, emptyResponse)
                    })      
            }
        });          
    });
}
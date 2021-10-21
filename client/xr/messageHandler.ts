import { userDatabase } from "../userDatabase";
import { getRandomEmptyResponse, startsWithCapital } from "../utils";
import { addMessageToHistory, exitConversation, getChatHistory, isInConversation, moreThanOneInConversation, onMessageResponseUpdated, prevMessage, prevMessageTimers, saveIfHandled, sentMessage, wasHandled } from "./chatHistory";

export async function handleMessages(messageResponseHandler, messages, bot) {
    for (let i = 0; i < messages.length; i++) {
        if (messages[i].text.includes('[') && messages[i].text.includes(']')) continue
        else if (messages[i].text.includes('joined the layer') || messages[i].text.includes('left the layer') || messages[i].text.length === 0) continue
        else if (messages[i].text.includes('in harassment range with')) continue
        else if (messages[i].text.includes('in range with')) continue
        else if (messages[i].text.includes('looking at')) continue
        else if (messages[i].text.includes('in intimate range')) continue
        else if (messages[i].text.startsWith('/') || messages[i].text.startsWith(' /')) continue
        else if (messages[i].senderName === bot.name || 
            (messages[i].sender !== undefined && messages[i].sender.id === bot.userId) || 
            (messages[i].author !== undefined && messages[i].author[1] === bot.userId)) {
            addMessageToHistory(messages[i].channelId, messages[i].id, bot.name, messages[i].text)
            continue
        }
        else if (await wasHandled(messages[i].channelId, messages[i].id)) continue
        const date = Date.now() / 1000
        const msgDate = messages[i].updatedAt
        const diff = date - msgDate
        const hours_diff = Math.ceil(diff/3600)
        const mins_diff = Math.ceil((diff-hours_diff)/60)
        if (mins_diff > 12 || (mins_diff <= 5 && hours_diff > 1)) {
            const date = new Date(msgDate);
            const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
            const utcStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
            saveIfHandled(messages[i].channelId, messages[i].id, messages[i].senderName !== undefined ? messages[i].senderName : messages[i].sender.name, messages[i].text, utcStr)
            continue
        }

        const _sender = messages[i].senderName !== undefined ? messages[i].senderName : messages[i].sender.name
        let content = messages[i].text
        addMessageToHistory(messages[i].channelId, messages[i].id, _sender, content)
        let addPing = false
        let _prev = undefined
        _prev = prevMessage[messages[i].channelId]
        prevMessage[messages[i].channelId] = _sender
        if (prevMessageTimers[messages[i].channelId] !== undefined) clearTimeout(prevMessageTimers[messages[i].channelId])
        prevMessageTimers[messages[i].channelId] = setTimeout(() => prevMessage[messages[i].channelId] = '', 120000)
        
        addPing = (_prev !== undefined && _prev !== '' && _prev !== _sender) || moreThanOneInConversation()

        let startConv = false
        let startConvName = ''
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
        
        if (!startConv) {
            if (startConvName.length > 0) {
                exitConversation(_sender)
                exitConversation(startConvName)
            }
        }

        const isUserNameMention = content.toLowerCase().replace(',', '').replace('.', '').replace('?', '').replace('!', '').match(bot.username_regex)
        const isInDiscussion = isInConversation(_sender)
        if (!content.startsWith('!')) {
        if (isUserNameMention) { console.log('is user mention'); content = '!ping ' + content.replace(bot.username_regex, '').trim()  }
        else if (isInDiscussion || startConv) { console.log('isIndiscussion: ' + isInDiscussion + ' startConv: ' + startConv); content = '!ping ' + content}
        }

        if (content.startsWith('!ping')) sentMessage(_sender)
        else continue
        console.log('content: ' + content + ' sender: ' + _sender)
        const args = {}
        args['grpc_args'] = {};
    
        args['parsed_words'] = content.slice('!'.length).trim().split(/ +/g);
        
        args['command_info'] = [
            'ping',
            [ 'HandleMessage' ],
            [ 'sender', 'message', 'client_name', 'chat_id', 'createdAt' ],
            'ping all agents'
          ]
        args['grpc_args']['sender'] = _sender
        if (args['command_info']) {
            args['command'] = args['command_info'][0];
            args['grpc_args']['message'] = content.replace("!" + args['command'], "");
            args['grpc_method'] = args['command_info'][1][0];
            args['grpc_method_params'] = args['command_info'][2];
        }

        args['grpc_args']['client_name'] = 'xr-engine'
        args['grpc_args']['chat_id'] = messages[i].channelId

        const dateNow = new Date();
        var utc = new Date(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), dateNow.getUTCHours(), dateNow.getUTCMinutes(), dateNow.getUTCSeconds());
        const utcStr = dateNow.getDate() + '/' + (dateNow.getMonth() + 1) + '/' + dateNow.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
        args['grpc_args']['createdAt'] = utcStr
        
        await messageResponseHandler(args, (response) => {
            console.log(JSON.stringify(response))
            Object.keys(response.response).map(function(key, index) {
                console.log('response: ' + response.response[key])
                if (response.response[key] !== undefined && response.response[key].length <= 2000 && response.response[key].length > 0) {
                    let text = response.response[key]
                    while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                    if (addPing) text = _sender + ' ' + text
                    bot.sendMessage(text)         
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
                                if (addPing) { 
                                    text = _sender + ' ' + text
                                    addPing = false
                                }
                                bot.sendMessage(text)                  
                            }
                        }
                    }
                }
                else {
                    let emptyResponse = getRandomEmptyResponse()
                    while (emptyResponse === undefined || emptyResponse === '' || emptyResponse.replace(/\s/g, '').length === 0) emptyResponse = getRandomEmptyResponse()
                    if (addPing) emptyResponse = _sender + ' ' + emptyResponse
                    bot.sendMessage(emptyResponse)         
                }
            });          
        });
    }
}
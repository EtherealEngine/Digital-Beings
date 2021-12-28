import { tcpClient } from "../tcpClient";
import { userDatabase } from "../userDatabase";
import { getRandomEmptyResponse, startsWithCapital } from "../utils";
import { addMessageToHistory, exitConversation, getChatHistory, isInConversation, moreThanOneInConversation, onMessageResponseUpdated, prevMessage, prevMessageTimers, saveIfHandled, sentMessage, wasHandled } from "./chatHistory";

export async function handleMessages(messages, bot) {
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
            addMessageToHistory(messages[i].channelId, messages[i].id, process.env.BOT_NAME, messages[i].text)
            continue
        }
        await wasHandled(messages[i].channelId, messages[i].id, () => {
            return
        }, async () => {
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
                return
            }

            const _sender = messages[i].senderName !== undefined ? messages[i].senderName : messages[i].sender.name
            let content = messages[i].text
            console.log('handling message: ' + content)
            await addMessageToHistory(messages[i].channelId, messages[i].id, _sender, content)
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
                else if (isInDiscussion || startConv) content = '!ping ' + content
            }

            if (content.startsWith('!ping')) sentMessage(_sender)
            else return
            console.log('content: ' + content + ' sender: ' + _sender)
            
            const dateNow = new Date();
            var utc = new Date(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), dateNow.getUTCHours(), dateNow.getUTCMinutes(), dateNow.getUTCSeconds());
            const utcStr = dateNow.getDate() + '/' + (dateNow.getMonth() + 1) + '/' + dateNow.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()

            tcpClient.getInstance.sendMessage(content.replace('!ping', ''), messages[i].id, 'xr-engine', messages[i].channelId, utcStr, addPing, _sender, _sender)
        })
        
    }
}


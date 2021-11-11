import TelegramBot = require("node-telegram-bot-api");
import { getRandomEmptyResponse } from "../utils";
import { addMessageToHistory, onMessageResponseUpdated } from "./chatHistory";

export class telegramPacketHandler {
    static getInstance: telegramPacketHandler
    bot: TelegramBot
    botName: string

    constructor(bot: TelegramBot, botName: string) {
        telegramPacketHandler.getInstance = this
        this.bot = bot
        this.botName = botName
    }

    async handleMessage(chat_id, responses, message_id, addPing, args) { 
        let senderId = ''
        let senderName = ''
        if (args !== 'none' && args.startsWith('[') && args[args.length-1] === ']') {
            args = JSON.parse(args)
            senderId = args[0]
            senderName = args[1]
        }
        console.log(JSON.stringify(responses))
        Object.keys(responses).map(function(key, index) {
            console.log('response: ' + responses[key])
            if (responses[key] !== undefined && responses[key].length > 0) {
                let text = responses[key]
                while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                if (addPing) telegramPacketHandler.getInstance.bot.sendMessage(chat_id,`<a href="tg://user?id=${senderId}">${senderName}</a> ${text}`, {parse_mode: 'HTML'}).then(function (_resp) {
                    onMessageResponseUpdated(_resp.chat.id, message_id, _resp.message_id)
                    addMessageToHistory(_resp.chat.id, _resp.message_id, process.env.BOT_NAME, text)
                    }).catch(console.error)
                else telegramPacketHandler.getInstance.bot.sendMessage(chat_id,text).then(function (_resp) {
                    onMessageResponseUpdated(_resp.chat.id, message_id, _resp.message_id)
                    addMessageToHistory(_resp.chat.id, _resp.message_id, process.env.BOT_NAME, text)
                }).catch(console.error)       
        }
            else {
                let emptyResponse = getRandomEmptyResponse()
                while (emptyResponse === undefined || emptyResponse === '' || emptyResponse.replace(/\s/g, '').length === 0) emptyResponse = getRandomEmptyResponse()
                if (addPing) telegramPacketHandler.getInstance.bot.sendMessage(chat_id,`<a href="tg://user?id=${senderId}">${senderName}</a> ${emptyResponse}`, {parse_mode: 'HTML'}).then(function (_resp) {
                    onMessageResponseUpdated(_resp.chat.id, message_id, _resp.message_id)
                    addMessageToHistory(_resp.chat.id, _resp.message_id, process.env.BOT_NAME, emptyResponse)
                    }).catch(console.error)           
                else telegramPacketHandler.getInstance.bot.sendMessage(chat_id,emptyResponse).then(function (_resp) {
                    onMessageResponseUpdated(_resp.chat.id, message_id, _resp.message_id)
                    addMessageToHistory(_resp.chat.id, _resp.message_id, process.env.BOT_NAME, emptyResponse)
                    }).catch(console.error)
            }
        });          
    }

    async handleEditMessage(chat_id, message_id, responses, args) {
        let senderId = ''
        let senderName = ''
        if (args !== 'none' && args.startsWith('[') && args[args.length-1] === ']') {
            args = JSON.parse(args)
            senderId = args[0]
            senderName = args[1]
        }
        Object.keys(responses).map(function(key, index) {
            console.log('response: ' + responses[key])
            if (responses[key] !== undefined && responses[key].length <= 2000 && responses[key].length > 0) {
                let text = responses[key]
                while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                telegramPacketHandler.getInstance.bot.sendMessage(chat_id,`<a href="tg://user?id=${senderId}">${senderName}</a> ${text}`, {parse_mode: 'HTML'}).then(function (_resp) {
                    onMessageResponseUpdated(_resp.chat.id, message_id, _resp.message_id)
                    addMessageToHistory(_resp.chat.id, _resp.message_id, telegramPacketHandler.getInstance.botName, text)
                    }).catch(console.error)
            }
            else if (responses[key].length > 2000) {
                const lines: string[] = []
                let line: string = ''
                for(let i = 0; i < responses[key].length; i++) {
                    line+= responses[key]
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
                            telegramPacketHandler.getInstance.bot.sendMessage(chat_id,`<a href="tg://user?id=${senderId}">${senderName}</a> ${text}`, {parse_mode: 'HTML'}).then(function (_resp) {
                                onMessageResponseUpdated(_resp.chat.id, message_id, _resp.message_id)
                                addMessageToHistory(_resp.chat.id, _resp.message_id, telegramPacketHandler.getInstance.botName, text)
                                }).catch(console.error) 
                        }
                    }
                }
            }
            else {
                let emptyResponse = getRandomEmptyResponse()
                while (emptyResponse === undefined || emptyResponse === '' || emptyResponse.replace(/\s/g, '').length === 0) emptyResponse = getRandomEmptyResponse()
                telegramPacketHandler.getInstance.bot.sendMessage(chat_id,`<a href="tg://user?id=${senderId}">${senderName}</a> ${emptyResponse}`, {parse_mode: 'HTML'}).then(function (_resp) {
                    onMessageResponseUpdated(_resp.chat.id, message_id, _resp.message_id)
                    addMessageToHistory(_resp.chat.id, _resp.message_id, telegramPacketHandler.getInstance.botName, emptyResponse)
                }).catch(console.error)   
            }
        })
    }
}
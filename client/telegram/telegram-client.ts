import TelegramBot = require("node-telegram-bot-api")
import { getRandomEmptyResponse } from "../utils"

const token = process.env.TELEGRAM_BOT_TOKEN

export const createTelegramClient = (messageResponseHandler) => {
    if (!token) return console.warn("No API token for Telegram bot, skipping");
    const bot = new TelegramBot(token, {polling: true})

    bot.on('message', (msg) => {
        const chatId = msg.chat.id
        const message = '!ping ' + msg.text

        const args = {}
        args['grpc_args'] = {};

        args['parsed_words'] = message.slice('!'.length).trim().split(/ +/g);
        
        args['command_info'] = [
            'ping',
            [ 'HandleMessage' ],
            [ 'sender', 'message' ],
            'ping all agents'
          ]
        args['grpc_args']['sender'] = msg.chat.first_name
        if (args['command_info']) {
            args['command'] = args['command_info'][0];
            args['grpc_args']['message'] = message.replace("!" + args['command'], "");
            args['grpc_method'] = args['command_info'][1][0];
            args['grpc_method_params'] = args['command_info'][2];
        }
        if (args['command'] == 'setagent' || args['command'] == 'pingagent') {
            const splitArgs = args['grpc_args']['message'].trim().split(",");
            splitArgs.forEach(element => {
                args['grpc_args'][element.trim().split("=")[0]] = element.trim().split("=")[1];
            });
        }

        messageResponseHandler(args, (response) => {
            Object.keys(response.response).map(function(key, index) {
                console.log('response: ' + response.response[key])
                if (response.response[key] !== undefined && response.response[key].length <= 2000 && response.response[key].length > 0) {
                    let text = response.response[key]
                    while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                    bot.sendMessage(chatId, text)               
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
                                bot.sendMessage(chatId, 'Received message: ' + text)
                        }
                    }
                }
            }
                else {
                    let emptyResponse = getRandomEmptyResponse()
                    while (emptyResponse === undefined || emptyResponse === '' || emptyResponse.replace(/\s/g, '').length === 0) emptyResponse = getRandomEmptyResponse()

                    bot.sendMessage(chatId, 'Received message: ' + emptyResponse)
                }
            });          
        });
    })
    console.log('telegram client loaded')
}
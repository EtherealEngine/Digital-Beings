import { getRandomEmptyResponse } from "../utils";
import { onMessageResponseUpdated } from "./chatHistory";

export function handleMessages(messageResponseHandler, messages, bot) {
    console.log('messages')
    for (let i = 0; i < messages.length; i++) {
        const _sender = messages[i].sender.name
        const content = messages[i].text
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

        messageResponseHandler(args, (response) => {
            console.log(JSON.stringify(response))
            Object.keys(response.response).map(function(key, index) {
                console.log('response: ' + response.response[key])
                if (response.response[key] !== undefined && response.response[key].length <= 2000 && response.response[key].length > 0) {
                    let text = response.response[key]
                    while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
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
                                bot.sendMessage(text)                  
                            }
                        }
                    }
                }
                else {
                    let emptyResponse = getRandomEmptyResponse()
                    while (emptyResponse === undefined || emptyResponse === '' || emptyResponse.replace(/\s/g, '').length === 0) emptyResponse = getRandomEmptyResponse()
                    bot.sendMessage(emptyResponse)         
                }
            });          
        });
    }
    messageResponseHandler("replaceme", messages, (response) => this.sendMessage(response));
}
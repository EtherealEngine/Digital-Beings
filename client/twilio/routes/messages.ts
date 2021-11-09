import { Response } from 'express';
import { twiml } from 'twilio';
import twilio = require('twilio');
import { postgres } from '../../postgres';
import { tcpClient } from '../../tcpClient';
import { userDatabase } from '../../userDatabase';
import { getRandomEmptyResponse } from '../../utils';
import { addMessageToHistory } from '../chatHistory';
import { sendMessage } from '../twilio-client';
import { MessagingRequest } from '../types/request';

const { MessagingResponse } = twiml;

export async function message(req: MessagingRequest, res: Response<string>) {
    if (userDatabase.getInstance.isUserBanned(req.body.From, 'twilio')) return
    console.log('received message: ' + req.body.Body)
    await postgres.getInstance.getNewMessageId('twilio', req.body.From, async (msgId) => {
        addMessageToHistory(req.body.From, req.body.From, req.body.Body, msgId)   
        const message = '!ping ' + req.body.Body
          
        const args = {}
        args['grpc_args'] = {};
    
        args['parsed_words'] = message.slice('!'.length).trim().split(/ +/g);
        
        // Grab the command data from the client.commands Enmap
        args['command_info'] = [
            'ping',
            [ 'HandleMessage' ],
            [ 'sender', 'message', 'client_name', 'chat_id', 'createdAt' ],
            'ping all agents'
          ]
        args['grpc_args']['sender'] = req.body.From
        if (args['command_info']) {
            args['command'] = args['command_info'][0];
            args['grpc_args']['message'] = message.replace("!" + args['command'], "");  //remove .command from message
            args['grpc_method'] = args['command_info'][1][0];
            args['grpc_method_params'] = args['command_info'][2];
        }
    
        args['grpc_args']['client_name'] = 'twilio'
        args['grpc_args']['chat_id'] = req.body.From + ''
    
        const dateNow = new Date();
        var utc = new Date(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), dateNow.getUTCHours(), dateNow.getUTCMinutes(), dateNow.getUTCSeconds());
        const utcStr = dateNow.getDate() + '/' + (dateNow.getMonth() + 1) + '/' + dateNow.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
    
        tcpClient.getInstance.sendMessage(req.body.Body, msgId + '' || '1', 'Twilio', req.body.From, utcStr, false, req.body.From)
    })
}

export class handleTwilio {
    static getInstance: handleTwilio
    client: twilio.Twilio;

    constructor(client) {
        handleTwilio.getInstance = this
        this.client = client
    }

    async handleTwilioMsg(chat_id, responses) {
        Object.keys(responses).map(async function(key, index) {
            await postgres.getInstance.getNewMessageId('twilio', chat_id, async (msgId) => {
                console.log('response: ' + responses[key])
                if (responses[key] !== undefined && responses[key].length <= 2000 && responses[key].length > 0) {
                    let text = responses[key]
                    while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                    sendMessage(handleTwilio.getInstance.client, chat_id, text); 
                    addMessageToHistory(chat_id, process.env.BOT_NAME, text, msgId)                 
                }
                else if (responses[key].length > 160) {
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
                                sendMessage(handleTwilio.getInstance.client, chat_id, text); 
                                addMessageToHistory(chat_id, process.env.BOT_NAME, text, msgId)
                        }
                    }
                }
            }
                else {
                    let emptyResponse = getRandomEmptyResponse()
                    while (emptyResponse === undefined || emptyResponse === '' || emptyResponse.replace(/\s/g, '').length === 0) emptyResponse = getRandomEmptyResponse()
                    sendMessage(handleTwilio.getInstance.client, chat_id, emptyResponse); 
                    addMessageToHistory(chat_id, process.env.BOT_NAME, emptyResponse, msgId)
                }
            })
        })
    }
}
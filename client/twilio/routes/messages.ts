import { urlencoded, Response } from 'express';
import { twiml } from 'twilio';
import { getChatHistory } from '../../telegram/chatHistory';
import { getRandomEmptyResponse } from '../../utils';
import { addMessageToHistory } from '../chatHistory';
import { MessagingRequest } from '../types/request';

const { MessagingResponse } = twiml;

export async function message(messageResponseHandler, req: MessagingRequest, res: Response<string>) {
    console.log('received message: ' + req.body.Body)
    const message = '!ping ' + req.body.Body
      
    const _resp = new MessagingResponse();
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

    args['grpc_args']['client_name'] = 'telegram'
    args['grpc_args']['chat_id'] = req.body.From

    const dateNow = new Date();
    var utc = new Date(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), dateNow.getUTCHours(), dateNow.getUTCMinutes(), dateNow.getUTCSeconds());
    const utcStr = dateNow.getDate() + '/' + (dateNow.getMonth() + 1) + '/' + dateNow.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
    args['grpc_args']['createdAt'] = utcStr
    
    await messageResponseHandler(args, (response) => {
        Object.keys(response.response).map(function(key, index) {
            console.log('response: ' + response.response[key])
            if (response.response[key] !== undefined && response.response[key].length <= 2000 && response.response[key].length > 0) {
                let text = response.response[key]
                while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                _resp.message(text)
                res.set("Content-Type", "application/xml");
                res.send(_resp.toString())     
                addMessageToHistory(req.body.From, process.env.BOT_NAME, text)                 
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
                            _resp.message(text)
                            res.set("Content-Type", "application/xml");
                            res.send(_resp.toString()) 
                            addMessageToHistory(req.body.From, process.env.BOT_NAME, text)
                    }
                }
            }
        }
            else {
                let emptyResponse = getRandomEmptyResponse()
                while (emptyResponse === undefined || emptyResponse === '' || emptyResponse.replace(/\s/g, '').length === 0) emptyResponse = getRandomEmptyResponse()
                _resp.message(emptyResponse)
                res.set("Content-Type", "application/xml");
                res.send(_resp.toString()) 
                addMessageToHistory(req.body.From, process.env.BOT_NAME, emptyResponse)
            }
        });          
    });
}
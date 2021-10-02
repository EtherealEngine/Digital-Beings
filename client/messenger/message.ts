import { getRandomEmptyResponse } from "../utils";
import { getChatHistory } from "./chatHistory";

const request = require('request')

export async function handleMessage(senderPsid, receivedMessage, messageResponseHandler) {
  console.log('receivedMessage: ' + receivedMessage.text + ' from: ' + senderPsid)

  if (receivedMessage.text) {
    const message = '!ping ' + receivedMessage.text
      
    const args = {}
    args['grpc_args'] = {};

    args['parsed_words'] = message.slice('!'.length).trim().split(/ +/g);
    
    args['command_info'] = [
        'ping',
        [ 'HandleMessage' ],
        [ 'sender', 'message' ],
        'ping all agents'
      ]
    args['grpc_args']['sender'] = senderPsid
    if (args['command_info']) {
        args['command'] = args['command_info'][0];
        args['grpc_args']['message'] = message.replace("!" + args['command'], "");
        args['grpc_method'] = args['command_info'][1][0];
        args['grpc_method_params'] = args['command_info'][2];
    }

    console.log(JSON.stringify(args['grpc_args']['sender']))
    args['chat_history'] = await getChatHistory(receivedMessage.sender, 10)

    await messageResponseHandler(args, (response) => {
      console.log('response: ' + JSON.stringify(response))
        Object.keys(response.response).map(function(key, index) {
            console.log('response: ' + response.response[key])
            if (response.response[key] !== undefined && response.response[key].length <= 2000 && response.response[key].length > 0) {
                let text = response.response[key]
                while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                callSendAPI(senderPsid, { 'text': text });
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
                            callSendAPI(senderPsid, { 'text': text });
                    }
                }
            }
        }
            else {
                let emptyResponse = getRandomEmptyResponse()
                while (emptyResponse === undefined || emptyResponse === '' || emptyResponse.replace(/\s/g, '').length === 0) emptyResponse = getRandomEmptyResponse()
                callSendAPI(senderPsid, { 'text': emptyResponse });
            }
        });          
    });
  }
}

function callSendAPI(senderPsid, response) {

  console.log('sending response: ' + response)
  // The page access token we have generated in your app settings
  const PAGE_ACCESS_TOKEN = process.env.MESSENGER_TOKEN

  // Construct the message body
  let requestBody = {
    'recipient': {
      'id': senderPsid
    },
    'message': response
  };

  // Send the HTTP request to the Messenger Platform
  request({
    'uri': 'https://graph.facebook.com/v2.6/me/messages',
    'qs': { 'access_token': PAGE_ACCESS_TOKEN },
    'method': 'POST',
    'json': requestBody
  }, (err, _res, _body) => {
    if (!err) {
      console.log('Message sent!');
    } else {
      console.error('Unable to send message:' + err);
    }
  });
}
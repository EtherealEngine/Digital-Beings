import { postgres } from "../postgres";
import { tcpClient } from "../tcpClient";
import { userDatabase } from "../userDatabase";
import { getRandomEmptyResponse } from "../utils";
import { addMessageToHistory, getChatHistory } from "./chatHistory";

const request = require('request')

export async function handleMessage(senderPsid, receivedMessage) {
  if (userDatabase.getInstance.isUserBanned(senderPsid, 'messenger')) return
  
  console.log('receivedMessage: ' + receivedMessage.text + ' from: ' + senderPsid)

  if (receivedMessage.text) {
    await postgres.getInstance.getNewMessageId('messenger', senderPsid, async (msgId) => {
      addMessageToHistory(senderPsid, senderPsid, receivedMessage.text, msgId)
      const message = receivedMessage.text

      const date = new Date();
      const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
      const utcStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
      
      tcpClient.getInstance.sendMessage(message, senderPsid, 'Messenger', senderPsid, utcStr, false, senderPsid)
    })
  }
}

export async function handlePacketSend(senderPsid, responses) {
  Object.keys(responses).map(function(key, index) {
    console.log('response: ' + responses[key])
    if (responses[key] !== undefined && responses[key].length <= 2000 && responses[key].length > 0) {
        let text = responses[key]
        while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
        callSendAPI(senderPsid, { 'text': text }, text);
    }
    else if (responses[key].length > 20000) {
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
                    callSendAPI(senderPsid, { 'text': text }, text);
            }
        }
    }
}
    else {
        let emptyResponse = getRandomEmptyResponse()
        while (emptyResponse === undefined || emptyResponse === '' || emptyResponse.replace(/\s/g, '').length === 0) emptyResponse = getRandomEmptyResponse()
        callSendAPI(senderPsid, { 'text': emptyResponse }, emptyResponse);
    }
}); 
}

export async function callSendAPI(senderPsid, response, text) {
  await postgres.getInstance.getNewMessageId('messenger', senderPsid, async (msgId) => {
    addMessageToHistory(senderPsid, process.env.BOT_NAME, text, msgId)
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
  })
}
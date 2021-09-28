import { Twilio, twiml } from 'twilio'
import express = require('express');
import { init, router } from './routes/messages';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

let app = undefined
let client: Twilio = undefined

export const createTwilioClient = (messageResponseHandler) => {
    if (!accountSid || !authToken || !twilioNumber)  return console.warn("No API token for Twilio bot, skipping");
    app = express();
    init(messageResponseHandler)
    app.use("/messages", router);
    app.listen(3000, () => {
        console.log(`Server listening on http://localhost:${3000}`);
      });
    client = new Twilio(accountSid, authToken, {
        logLevel: 'debug',
    })
    console.log('twilio client created')
}

export function sendMessage(toNumber, body) {
    client.messages.create({from: twilioNumber,
        to: toNumber,
        body: body
    }).then((message) => console.log('sent message: ' + message.sid))
    console.log('send message to: ' + toNumber + ' body: ' + body)
}
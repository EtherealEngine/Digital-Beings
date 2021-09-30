import { Twilio, twiml } from 'twilio'
import express = require('express');
import { urlencoded, Response } from 'express';
import { MessagingRequest } from './types/request';
import { message } from './routes/messages';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioPort = process.env.TWILIO_PORT

let client: Twilio = undefined

export const createTwilioClient = (messageResponseHandler) => {
    console.log('init')
    if (!accountSid || !authToken || !twilioNumber)  return console.warn("No API token for Twilio bot, skipping");
    console.log('twilio client created')
    
    const router = express.Router();
    router.use(urlencoded({ extended: false }));
    const app = express()
    app.use('/sms', router.post("/", async (req: MessagingRequest, res: Response<string>) => {
        await message(messageResponseHandler, req, res)
      }))
    app.get('/', (req, res) => {
        res.send('Hello World I am running locally');
    });
    app.listen(twilioPort, () => { console.log(`Server listening on http://localhost:${twilioPort}`);
    })
    /*app = express();
    init(messageResponseHandler)
    app.use("/messages", router);
    app.listen(twilioPort, () => {
        console.log(`Server listening on http://localhost:${twilioPort}`);
      });
    client = new Twilio(accountSid, authToken, {
        logLevel: 'debug',
    })
    sendMessage('+44 7398 049513', 'test')*/
}

export function sendMessage(toNumber, body) {
    client.messages.create({from: twilioNumber,
        to: toNumber,
        body: body
    }).then((message) => console.log('sent message: ' + message.sid))
    console.log('send message to: ' + toNumber + ' body: ' + body)
}
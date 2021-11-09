import { Twilio, twiml } from 'twilio'
import express = require('express');
import { app, router } from '../webserver';
import { MessagingRequest } from './types/request';
import { Response } from 'express';
import { handleTwilio, message } from './routes/messages';
import { tcpClient } from '../tcpClient';
import { postgres } from '../postgres';
import { addMessageToHistory } from './chatHistory';


export const createTwilioClient = async () => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER;
    console.log('init')
    if (!accountSid || !authToken || !twilioNumber)  return console.warn("No API token for Twilio bot, skipping");
    console.log('twilio client created, sid: ' + accountSid + ' auth token: ' + authToken)

    const client: Twilio = new Twilio(accountSid, authToken);
    new handleTwilio(client)

    app.use('/sms', router.post("/", async (req: MessagingRequest, res: Response<string>) => {
        await message(req, res)
    }))

}

export function sendMessage(client, toNumber, body) {
    console.log('sending sms: ' + body)
    client.messages.create({from: process.env.TWILIO_PHONE_NUMBER,
        to: toNumber,
        body: body
    }).then((message) => console.log('sent message: ' + message.sid)).catch(console.error)
    console.log('send message to: ' + toNumber + ' body: ' + body)
}
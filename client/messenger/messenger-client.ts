import { MessengerClient } from "messaging-api-messenger"

const token = process.env.MESSENGER_TOKEN
const appId = process.env.MESSENGER_APP_ID
const appSecret = process.env.MESSENGER_APP_SECRET

let client: MessengerClient

export const createMessengerClient = async (messageResponseHandler) => {
    if (!token || !appId || !appSecret) return console.warn("No API tokens for Messenger bot, skipping");

    client = new MessengerClient({
        accessToken: token,
        appId: appId,
        appSecret: appSecret,
        version: '6.0',
        skipAppSecretProof: true,
    })

}

export function setTyping(userid, on: boolean) {
    client.sendSenderAction(userid, on ? 'typing_on' : 'typing_off')
}
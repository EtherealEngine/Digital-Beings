import WhatsAppBot from '@green-api/whatsapp-bot'
import { onMessage } from './events/message'

const token = process.env.WHATSAPP_TOKEN
export const username_regex = new RegExp('((?:digital|being)(?: |$))', 'ig')
export let botName = process.env.WHATSAPP_BOT_NAME

export const createWhatsappClient = async (messageResponseHandler) => {
    if (!token) return console.warn("No API token for Whatsapp bot, skipping");
    const bot = new WhatsAppBot(token)

    bot.on('message', async (msg) => {
        console.log(JSON.stringify(msg))
        await onMessage(msg, messageResponseHandler)
    });
    bot.launch()
}
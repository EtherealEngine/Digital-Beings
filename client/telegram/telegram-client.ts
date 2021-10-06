import TelegramBot = require("node-telegram-bot-api")
import { onMessage } from "./events/message"
import { onMessageEdit } from "./events/message_edit"

const token = process.env.TELEGRAM_BOT_TOKEN
export const username_regex = new RegExp(process.env.BOT_NAME_REGEX, 'ig')
export let botName = ''

export const createTelegramClient = (messageResponseHandler) => {
    if (!token) return console.warn("No API token for Telegram bot, skipping");
    const bot = new TelegramBot(token, {polling: true})
    bot.getMe().then(info => botName = info.username).catch(console.error)

    bot.on('message', async (msg) => {
        await onMessage(bot, msg, messageResponseHandler)
    })
    bot.on('edited_message', async (msg) => {
        await onMessageEdit(bot, msg, messageResponseHandler)
    });
    console.log('telegram client loaded')
}
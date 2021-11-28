import TelegramBot = require("node-telegram-bot-api")
import { onMessage } from "./events/message"
import { onMessageEdit } from "./events/message_edit"
import { telegramPacketHandler } from "./telegramPacketHandler"

export const createTelegramClient = () => {
    const token = process.env.TELEGRAM_BOT_TOKEN

    if (!token) return console.warn("No API token for Telegram bot, skipping");
    const username_regex = new RegExp(process.env.BOT_NAME_REGEX, 'ig')
    let botName = ''

    const bot = new TelegramBot(token, {polling: true})
    bot.getMe().then(info => botName = info.username).catch(console.error)

    bot.on('message', async (msg) => {
        await onMessage(bot, msg, botName, username_regex)
    })
    bot.on('edited_message', async (msg) => {
        await onMessageEdit(bot, msg, botName)
    });
    new telegramPacketHandler(bot, botName)
    console.log('telegram client loaded')
}
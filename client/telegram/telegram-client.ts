import TelegramBot = require("node-telegram-bot-api")
import { getRandomEmptyResponse } from "../utils"
import { exitConversation, getResponse, isInConversation, onMessageResponseUpdated, prevMessage, prevMessageTimers, sentMessage } from "./chatHistory"
import { onMessage } from "./events/message"
import { onMessageEdit } from "./events/message_edit"

const token = process.env.TELEGRAM_BOT_TOKEN
export const username_regex = new RegExp('((?:digital|being)(?: |$))', 'ig')


export const createTelegramClient = (messageResponseHandler) => {
    console.log('loading telegram, token: ' + token)
    if (!token) return console.warn("No API token for Telegram bot, skipping");
    const bot = new TelegramBot(token, {polling: true})

    bot.on('message', (msg) => {
        onMessage(bot, msg, messageResponseHandler)
    })
    bot.on('edited_message', (msg) => {
        onMessageEdit(bot, msg, messageResponseHandler)
    });
    console.log('telegram client loaded')
}
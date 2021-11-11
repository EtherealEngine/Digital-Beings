import TelegramBot = require("node-telegram-bot-api")
import { tcpClient } from "../../tcpClient"
import { userDatabase } from "../../userDatabase"
import { getRandomEmptyResponse } from "../../utils"
import { addMessageToHistory, getChatHistory, getResponse, onMessageResponseUpdated, updateMessage } from "../chatHistory"

export async function onMessageEdit(bot, msg: TelegramBot.Message, botName: string) {
    if (userDatabase.getInstance.isUserBanned(msg.from.id + '', 'telegram')) return
    console.log('edited_message: ' + JSON.stringify(msg))
    const date = Date.now() / 1000
    const msgDate = msg.date
    const diff = date - msgDate
    const hours_diff = Math.ceil(diff/3600)
    const mins_diff = Math.ceil((diff-hours_diff)/60)
    if (mins_diff > 12 || (mins_diff <= 12 && hours_diff > 1)) return
    const _sender = msg.from.username === undefined ? msg.from.first_name : msg.from.username

    updateMessage(msg.chat.id, msg.message_id, msg.text)
    if (msg.from.is_bot) return

    const oldResponse = getResponse(msg.chat.id, msg.message_id)
    if (oldResponse === undefined) return
    
    const dateNow = new Date();
    var utc = new Date(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), dateNow.getUTCHours(), dateNow.getUTCMinutes(), dateNow.getUTCSeconds());
    const utcStr = dateNow.getDate() + '/' + (dateNow.getMonth() + 1) + '/' + dateNow.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()

    tcpClient.getInstance.sendMessageEdit(msg.text, msg.message_id + '', 'Telegram', msg.chat.id + '', utcStr, true, '[ \''+ msg.from.id + '\', \'' + msg.from.first_name + '\' ]')
}
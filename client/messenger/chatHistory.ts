import { postgres } from "../postgres";

export function getDbKey(chatId, messageId) {
    return 'twilio.' + chatId + '.' + messageId
}
export async function getLastMessageId(chatId): Promise<number> {
    return await postgres.getInstance.getNewMessageId('facebook', chatId)
}
export async function getChatHistory(chatId, length) {
    return await postgres.getInstance.getHistory(length, 'facebook', chatId)
}

export async function addMessageToHistory(chatId, senderName, content) {
    getLastMessageId(chatId).then(messageId => postgres.getInstance.addMessageInHistory('facebook', chatId, messageId + '', senderName, content))
}
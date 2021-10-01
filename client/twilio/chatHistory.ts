import { postgres } from "../postgres";

export function getDbKey(chatId, messageId) {
    return 'twilio.' + chatId + '.' + messageId
}
export async function getLastMessageId(chatId): Promise<number> {
    return await postgres.getInstance.getNewMessageId('twilio', chatId)
}
export async function getChatHistory(chatId, length) {
    return await postgres.getInstance.getHistory(length, 'twilio', chatId)
}

export async function addMessageToHistory(chatId, senderName, content) {
    getLastMessageId(chatId).then(messageId => postgres.getInstance.addMessageInHistory('twilio', chatId, messageId + '', senderName, content))
}
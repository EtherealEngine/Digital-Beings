import { postgres } from "../postgres";

export function getDbKey(chatId, messageId) {
    return 'twilio.' + chatId + '.' + messageId
}
export async function getChatHistory(chatId, length) {
    return await postgres.getInstance.getHistory(length, 'facebook', chatId)
}

export async function addMessageToHistory(chatId, senderName, content, messageId) {
    postgres.getInstance.addMessageInHistory('facebook', chatId, messageId + '', senderName, content)
}
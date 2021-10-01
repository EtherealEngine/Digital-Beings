import { postgres } from "../postgres"

export const prevMessage: { [chatId: string]: string } = {}
export const prevMessageTimers: { [chatId: string]: any } = {}
export const messageResponses: { [chatId: string]: { [messageId: string]: string } } = {}
export const conversation: { [user: string]: any } = {}

export function onMessageDeleted(chatId, messageId) {
    if (messageResponses[chatId] !== undefined && messageResponses[chatId][messageId] !== undefined) {
        delete messageResponses[chatId][messageId]
    }
}
export function onMessageResponseUpdated(chatId, messageId, newResponse) {
    if (messageResponses[chatId] === undefined) messageResponses[chatId] = {}
    messageResponses[chatId][messageId] = newResponse
}

export function getMessage(chatId, messageId) {
    return chatId.messages.fetchMessage(messageId)
}

export function isInConversation(user): boolean {
    return conversation[user] !== undefined
}

export function sentMessage(user) {
    if (conversation[user] !== undefined) {
        clearTimeout(conversation[user])
        conversation[user] = setTimeout(() => conversation[user] = undefined, 120000)
    } else {
        conversation[user] = setTimeout(() => conversation[user] = undefined, 120000)
    }
}

export function exitConversation(user) {
    if (conversation[user] !== undefined) {
        clearTimeout(conversation[user])
        conversation[user] = undefined
    }
}

export function getResponse(chatId, message) {
    if (messageResponses[chatId] === undefined) return undefined
    return messageResponses[chatId][message]
}

export async function addMessageToHistory(chatId, messageId, senderName, content) {
    await postgres.getInstance.addMessageInHistory('xr-engine', chatId, messageId, senderName, content)
}
export async function deleteMessageFromHistory(chatId, messageId) {
    await postgres.getInstance.deleteMessage('xr-engine', chatId, messageId)
}
export async function updateMessage(chatId, messageId, newContent) {
    await postgres.getInstance.updateMessage('xr-engine', chatId, messageId, newContent)
}

export async function wasHandled(chatId, messageId) {
    return await postgres.getInstance.messageExists('xr-engine', chatId, messageId)
}
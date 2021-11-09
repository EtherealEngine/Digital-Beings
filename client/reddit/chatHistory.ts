import { postgres } from "../postgres"

export const prevMessage: { [channel: string]: string } = {}
export const prevMessageTimers: { [channel: string]: any } = {}
export const messageResponses: { [channel: string]: { [messageId: string]: string } } = {}
export const conversation: { [user: string]: { timeoutId: any, timeOutFinished: boolean, isInConversation: boolean } } = {}

export function onMessageDeleted(channel, messageId) {
    if (messageResponses[channel] !== undefined && messageResponses[channel][messageId] !== undefined) {
        delete messageResponses[channel][messageId]
    }
}
export function onMessageResponseUpdated(channel, messageId, newResponse) {
    if (messageResponses[channel] === undefined) messageResponses[channel] = {}
    messageResponses[channel][messageId] = newResponse
}

export function getMessage(channel, messageId) {
    return channel.messages.fetchMessage(messageId)
}

export function isInConversation(user): boolean {
    return conversation[user] !== undefined && conversation[user].isInConversation === true
}

export function sentMessage(user) {
    for(let c in conversation) {
        if (c === user) continue
        if (conversation[c] !== undefined && conversation[c].timeOutFinished === true) {
            exitConversation(c)
        }
    }

    if (conversation[user] === undefined) {
        conversation[user] = { timeoutId: undefined, timeOutFinished: true, isInConversation: true }
        if (conversation[user].timeoutId !== undefined) clearTimeout(conversation[user].timeoutId)
        conversation[user].timeoutId = setTimeout(() => {
            if (conversation[user] !== undefined) {
                conversation[user].timeoutId = undefined
                conversation[user].timeOutFinished = true
            }
        }, 480000)
    } else {
        conversation[user].timeoutId = setTimeout(() => {
            if (conversation[user] !== undefined) {
                conversation[user].timeoutId = undefined
                conversation[user].timeOutFinished = true
            }
        }, 480000)
    }
}

export function exitConversation(user) {
    if (conversation[user] !== undefined) {
        if (conversation[user].timeoutId !== undefined) clearTimeout(conversation[user].timeoutId)
        conversation[user].timeoutId = undefined
        conversation[user].timeOutFinished = true
        conversation[user].isInConversation = false
        delete conversation[user]
    }
}

export function getResponse(channel, message) {
    if (messageResponses[channel] === undefined) return undefined
    return messageResponses[channel][message]
}

export function addMessageToHistory(chatId, messageId, senderName, content) {
    postgres.getInstance.addMessageInHistory('reddit-chat', chatId, messageId, senderName, content)
}
export async function addMessageInHistoryWithDate(chatId, messageId, senderName, content, timestamp) {
    await postgres.getInstance.addMessageInHistoryWithDate('reddit-chat', chatId, messageId, senderName, content, timestamp)
}
export async function deleteMessageFromHistory(chatId, messageId) {
    await postgres.getInstance.deleteMessage('reddit-chat', chatId, messageId)
}
export async function updateMessage(chatId, messageId, newContent) {
    await postgres.getInstance.updateMessage('reddit-chat', chatId, messageId, newContent, true)
}
export async function wasHandled(chatId, messageId, sender, content, timestamp) {
    return await postgres.getInstance.messageExistsAsync('reddit-chat', chatId, messageId, sender, content, timestamp)
}
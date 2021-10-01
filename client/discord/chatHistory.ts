import { postgres } from "../postgres"

export const prevMessage: { [channel: string]: string } = {}
export const prevMessageTimers: { [channel: string]: any } = {}
export const messageResponses: { [channel: string]: { [messageId: string]: string } } = {}
export const conversation: { [user: string]: any } = {}

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

export function getResponse(channel, message) {
    if (messageResponses[channel] === undefined) return undefined
    return messageResponses[channel][message]
}

export async function addMessageToHistory(chatId, messageId, senderName, content) {
    await postgres.getInstance.addMessageInHistory('discord', chatId, messageId, senderName, content)
}
export async function deleteMessageFromHistory(chatId, messageId) {
    await postgres.getInstance.deleteMessage('discord', chatId, messageId)
}
export async function updateMessage(chatId, messageId, newContent) {
    await postgres.getInstance.updateMessage('discord', chatId, messageId, newContent)
}
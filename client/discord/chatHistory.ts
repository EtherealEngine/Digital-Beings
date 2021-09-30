import { redisDb } from "../redisDb"

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

export function getDbKey(chatId, messageId) {
    return 'discord.' + chatId + '.' + messageId
}
export async function addMessageToHistory(chatId, messageId, senderName, content) {
    await redisDb.getInstance.setValue(getDbKey(chatId, messageId), JSON.stringify({ 
        messageId: messageId, 
        senderName: senderName, 
        content: content 
    }))    
}
export async function deleteMessageFromHistory(chatId, messageId) {
    await redisDb.getInstance.deleteKey(getDbKey(chatId, messageId))
}
import { redisDb } from "../redisDb"

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

export function getDbKey(chatId, messageId) {
    return 'xr-engine.' + chatId + '.' + messageId
}
export async function addMessageToHistory(chatId, messageId, senderName, content) {
    await redisDb.getInstance.setValue(getDbKey(chatId, messageId), JSON.stringify({ 
        messageId: messageId, 
        senderName: senderName, 
        content: content 
    }))    
}
export async function getChatHistory(chatId, length) {
    return await redisDb.getInstance.getKeys('telegram.' + chatId + '.').then(async function (keys) {
        const res: {senderName, content}[] = []

        for(let i = 0; i < keys.length; i++) {
            const obj = JSON.parse(await redisDb.getInstance.getValue(keys[i]))
            if (obj === undefined) continue
            res.push({ senderName: obj.senderName, content: obj.content })

            if (i + 1 >= length) break
        }

        return res
    });
}

export async function wasHandled(chatId, messageId) {
    return await redisDb.getInstance.hasKey(getDbKey(chatId, messageId))
}
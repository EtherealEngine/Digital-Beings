import { postgres } from "../postgres"

export const prevMessage: { [chatId: string]: string } = {}
export const prevMessageTimers: { [chatId: string]: any } = {}
export const messageResponses: { [chatId: string]: { [messageId: string]: string } } = {}
export const conversation: { [user: string]: any } = {}
export const chatHistory: { [chatId: string]: { messageId: string, senderName: string, content: string }[] } = {}

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
            console.log('conversaion for ' + user + ' ended')
            if (conversation[user] !== undefined) {
                conversation[user].timeoutId = undefined
                conversation[user].timeOutFinished = true
            }
        }, 720000)
    } else {
        conversation[user].timeoutId = setTimeout(() => {
            console.log('conversaion for ' + user + ' ended')
            if (conversation[user] !== undefined) {
                conversation[user].timeoutId = undefined
                conversation[user].timeOutFinished = true
            }
        }, 720000)
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

export function moreThanOneInConversation() {
    let count: number = 0
    for(let c in conversation) {
        if (conversation[c] === undefined) continue
        if (conversation[c].isInConversation !== undefined && conversation[c].isInConversation === true && conversation[c].timeOutFinished === false) count++
    }

    return count > 1
}

export function getResponse(chatId, message) {
    if (messageResponses[chatId] === undefined) return undefined
    return messageResponses[chatId][message]
}

export async function addMessageToHistory(chatId, messageId, senderName, content) {
    await postgres.getInstance.addMessageInHistory('telegram', chatId, messageId, senderName, content)
}
export async function getChatHistory(chatId, length) {
    return await postgres.getInstance.getHistory(length, 'telegram', chatId)
}
export async function updateMessage(chatId, messageId, newContent) {
    await postgres.getInstance.updateMessage('telegram', chatId, messageId, newContent, true)
}
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

export function addMessageToHistory(chatId, messageId, senderName, content) {
    if (chatHistory[chatId] === undefined) chatHistory[chatId] = []
    chatHistory[chatId].push({
        messageId: messageId,
        senderName: senderName,
        content: content
    })
    console.log('new chat history: ' + JSON.stringify(chatHistory[chatId]))
}
export function getChatHistory(chatId, length): { senderName, content }[] {
    const res: { senderName, content }[] = []
    if (chatHistory[chatId] === undefined) return res

    for(let i = 0; i < chatHistory[chatId].length; i++) {
        res.push({ 
            senderName: chatHistory[chatId][i].senderName,
            content: chatHistory[chatId][i].content
        })

        if (i + 1 >= length) break
    }

    return res
}
export function updateEditedMessage(chatId, messageId, newContent) {
    if (chatHistory[chatId] === undefined) return
    for(let i = 0; i < chatHistory[chatId].length; i++) {
        if (chatHistory[chatId][i].messageId == messageId) {
            chatHistory[chatId][i].content = newContent
        }
    }
}
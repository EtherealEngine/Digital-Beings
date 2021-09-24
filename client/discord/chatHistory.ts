export const chatHistory: string[] = []
export const perUserHistory: { [author: string]:  { [channel: string]: { messageId: string, message: string }[] } } = {}
export const prevMessage: { [channel: string]: string } = {}
export const channelHistory: { [channel: string]: { messageId: string, message: string, author: any, date: Date }[] } = {}
export const prevMessageTimers: { [channel: string]: any } = {}
export const messageResponses: { [messageId: string]: { initialMessage: string, response: string } } = {}
export const conversation: { [user: string]: any } = {}

export function pushMessageToChannelHistory(channel, messageId: string, message: string, author: string) {
}

export function onMessageDeleted(channel, messageId) {
    if (messageResponses[messageId] !== undefined) {
        delete messageResponses[messageId]
    }
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

export function getResponse(message) {
    if (messageResponses[message] !== undefined)
    return messageResponses[message].response
}
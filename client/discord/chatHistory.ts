export const chatHistory: string[] = []
export const perUserHistory: { [author: string]:  { [channel: string]: { messageId: string, message: string }[] } } = {}
export const prevMessage: { [channel: string]: string } = {}
export const channelHistory: { [channel: string]: { messageId: string, message: string, author: any, date: Date }[] } = {}
export const prevMessageTimers: { [channel: string]: any } = {}
export const messageResponses: { [messageId: string]: { initialMessage: string, response: string } } = {}
export const conversation: { [user: string]: any } = {}

export function pushMessageToChannelHistory(channel, messageId: string, message: string, author: string) {
    if (channelHistory[channel] === undefined) channelHistory[channel] = []
    channelHistory[channel].push({
        messageId: messageId,
        message: message,
        author: author,
        date: new Date()
    })
}

export function onMessageDeleted(channel, messageId) {
    for(let m in perUserHistory) {
        if (perUserHistory[m][channel] !== undefined) {
            for (let i = 0; i < perUserHistory[m][channel].length; i++) {
                if (perUserHistory[m][channel][i].messageId === messageId) {
                    delete perUserHistory[m][channel][i]
                    break
                }
            }
        }
    }
    if (channelHistory[channel] !== undefined) {
        for(let i = 0; i < channelHistory[channel].length; i++) {
            if (channelHistory[channel][i].messageId === messageId) {
                delete channelHistory[channel][i]
                break
            }
        }
    }
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
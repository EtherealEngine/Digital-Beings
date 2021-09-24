export const chatHistory: string[] = []
export const perUserHistory: { [author: string]:  { [channel: string]: string[] } } = {}
export const prevMessage: { [channel: string]: string } = {}
export const channelHistory: { [channel: string]: { message: string, author: any, date: Date }[] } = {}
export const prevMessageTimers: { [channel: string]: any } = {}

export function pushMessageToChannelHistory(channel, message: string, author: string) {
    if (channelHistory[channel] === undefined) channelHistory[channel] = []
    channelHistory[channel].push({
        message: message,
        author: author,
        date: new Date()
    })
}
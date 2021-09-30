import { redisDb } from "../redisDb"

export function getDbKey(chatId, messageId) {
    return 'twilio.' + chatId + '.' + messageId
}
export async function getLastMessageId(chatId) {
    return redisDb.getInstance.getKeys('twilio.' + chatId + '.').then(async function(keys) {
        return keys.length + 1
    });
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

export async function addMessageToHistory(chatId, senderName, content) {
    const messageId = await getLastMessageId(chatId)
    await redisDb.getInstance.setValue(getDbKey(chatId, messageId), JSON.stringify({ 
        messageId: messageId, 
        senderName: senderName, 
        content: content 
    }))    
}
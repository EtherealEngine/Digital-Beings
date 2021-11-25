import * as net from 'net'
import { client } from './discord/discord-client'
import { discordPackerHandler } from './discord/discordPackerHandler'
import { instagramPacketHandler } from './instagram/instagramPacketHandler'
import { handlePacketSend } from './messenger/message'
import { redditHandler } from './reddit/redditHandler'
import { telegramPacketHandler } from './telegram/telegramPacketHandler'
import { handleTwilio } from './twilio/routes/messages'
import { twitterPacketHandler } from './twitter/twitterPacketHandler'
import { xrEnginePacketHandler } from './xr/xrEnginePacketHandler'

export class tcpClient {
    static getInstance: tcpClient
    client: net.Socket

    async init(ip, port) {
        tcpClient.getInstance = this

        this.client = new net.Socket()
        this.client.setNoDelay(true)
        this.client.setKeepAlive(true, 5000)
        this.client.connect(port, ip, function() {
            console.log('connected')
        })
        console.log(client)
        this.client.on('data', async function(data) {
                const resp = JSON.parse(data + '')
                if (resp.length > 3) {
                const packetId = resp[0]
                const client_name = resp[1]
                const chat_id = resp[2]

                if (packetId === 0) {
                    const message_id = resp[3]
                    const responses = resp[4]
                    const addPing = resp[5]
                    const args = resp[6]

                    if (client_name === 'Discord') {
                        await discordPackerHandler.getInstance.handlePing(message_id, chat_id, responses, addPing)
                    }
                    else if (client_name === 'Messenger') {
                        await handlePacketSend(chat_id, responses)
                    }
                    else if (client_name === 'Telegram') {
                        await telegramPacketHandler.getInstance.handleMessage(chat_id, responses, message_id, addPing, args)
                    }
                    else if (client_name === 'Twilio') {
                        await handleTwilio.getInstance.handleTwilioMsg(chat_id, responses)
                    }
                    else if (client_name === 'xr-engine') {
                        await xrEnginePacketHandler.getInstance.handleXrEnginePacket(responses, addPing, args)
                    }
                    else if (client_name === 'reddit') {
                        await redditHandler.getInstance.handleMessage(responses, message_id, chat_id, args);
                    }
                    else if (client_name === 'instagram') {
                        await instagramPacketHandler.getInstance.handle(chat_id, responses)
                    }
                    else if (client_name === 'twitter') {
                        await twitterPacketHandler.getInstance.handleMessage(responses, message_id, chat_id, args)  
                    }
                }
                else if (packetId === 1) {
                    const response = resp[3]

                    if (client_name === 'Discord') {
                        await discordPackerHandler.getInstance.handleSlashCommand(chat_id, response)
                    }
                }
                else if (packetId === 2) {
                    const response = resp[3]

                    if (client_name === 'Discord') {
                        await discordPackerHandler.getInstance.handleUserUpdateEvent(response)
                    }
                }
                else if (packetId === 3) {
                    const response = resp[3]

                    if (client_name === 'Discord') {
                        await discordPackerHandler.getInstance.handleGetAgents(chat_id, response)
                    }
                } 
                else if (packetId === 4) {
                    const response = resp[3]

                    if (client_name === 'Discord') {
                        await discordPackerHandler.getInstance.handleSetAgentsFields(chat_id, response)
                    }
                }
                else if (packetId === 5) {
                    const message_id = resp[3]
                    const response = resp[4]
                    const addPing = resp[5]

                    if (client_name === 'Discord') {
                        await discordPackerHandler.getInstance.handlePingSoloAgent(chat_id, message_id, response, addPing)
                    }
                }
                else if (packetId === 6) {
                    const response = resp[3]

                    if (client_name === 'Discord') {
                        await discordPackerHandler.getInstance.handleMessageReactionAdd(response)
                    }
                }
                else if (packetId === 7) {
                    const message_id = resp[3]
                    const responses = resp[4]
                    const addPing = resp[5]
                    const args = resp[6]

                    if (client_name === 'Discord') {
                        await discordPackerHandler.getInstance.handleMessageEdit(message_id, chat_id, responses, addPing)
                    }
                    else if (client_name === 'Telegram') {
                        await telegramPacketHandler.getInstance.handleEditMessage(chat_id, message_id, responses, args)
                    }
                }
            }
        })
    }

    send(json: string) {
        if (this.client !== undefined) {
            this.client.write(json)
        }
    }

    sendMessage(message: string, message_id: string, client_name: string, chat_id: string, createdAt: string, addPing: boolean, author: string, args: string = 'none') {
        this.send(JSON.stringify({
            id: 0, 
            message: message, 
            message_id: message_id, 
            client_name: client_name, 
            chat_id: chat_id, 
            createdAt: createdAt, 
            addPing: addPing,
            author: author,
            args: args }))
    }
    sendSlashCommand(sender: string, command: string, args: string, client_name: string, chat_id: string, createdAt: string) {
        this.send(JSON.stringify({
            id: 1,
            sender: sender,
            command: command,
            args: args,
            client_name: client_name,
            chat_id: chat_id,
            createdAt: createdAt
        }))
    }
    sendUserUpdateEvent(client_name: string, event: string, user: string, createdAt: string) {
        this.send(JSON.stringify({
            id: 2,
            client_name: client_name,
            event: event,
            user: user,
            createdAt: createdAt
        }))
    }
    sendGetAgents(client_name: string, chat_id: string) {
        this.send(JSON.stringify({
            id: 3,
            client_name: client_name,
            chat_id: chat_id
        }))
    }
    sendSetAgentsFields(client_name: string, chat_id: string, name: string, context: string) {
        this.send(JSON.stringify({
            id: 4,
            client_name: client_name,
            chat_id: chat_id,
            name: name,
            context: context
        }))
    }
    sendPingSoloAgent(client_name: string, chat_id: string, message_id: string, message: string, agent: string, addPing: boolean, author: string) {
        this.send(JSON.stringify({
            id: 5,
            client_name: client_name,
            chat_id: chat_id,
            message_id: message_id,
            message: message,
            agent: agent,
            addPing: addPing,
            author: author
        }))
    }
    sendMessageReactionAdd(client_name: string, chat_id: string, message_id: string, content: string, user: string, reaction: string, createdAt: string) {
        this.send(JSON.stringify({
            id: 6,
            client_name: client_name,
            chat_id: chat_id,
            message_id: message_id,
            content: content,
            user: user,
            reaction: reaction,
            createdAt: createdAt
        }))
    }
    sendMessageEdit(message: string, message_id: string, client_name: string, chat_id: string, createdAt: string, addPing: boolean, args: string = 'none') {
        this.send(JSON.stringify({
            id: 7, 
            message: message, 
            message_id: message_id, 
            client_name: client_name, 
            chat_id: chat_id, 
            createdAt: createdAt, 
            addPing: addPing,
            args: args
        }))
    }
    sendMetadata(channel_name: string, client_name: string, channel_id: string, metadata: string) {
        this.send(JSON.stringify({
            id: 8,
            channel_name: channel_name,
            client_name: client_name,
            channel_id: channel_id,
            metadata: metadata
        }))
    }
}
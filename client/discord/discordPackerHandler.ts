import { chatFilter, toxicityTest } from "../chatFilter"
import { userDatabase } from "../userDatabase"
import { getRandomEmptyResponse } from "../utils"
import { addMessageToHistory, getResponse, onMessageResponseUpdated, updateMessage } from "./chatHistory"
import { replacePlaceholders } from "./util"
require('discord-inline-reply')
require('discord-reply')

export class discordPackerHandler {
    static getInstance: discordPackerHandler
    client

    constructor(client) {
        discordPackerHandler.getInstance = this
        this.client = client
    }

    async handlePing(message_id, chat_id, responses, addPing) {
        this.client.channels.fetch(chat_id).then(channel => {
            channel.messages.fetch(message_id).then(message => {
                Object.keys(responses).map(function(key, index) {
                    console.log('response: ' + responses[key])
                    if (responses[key] !== undefined && responses[key].length <= 2000 && responses[key].length > 0) {
                        let text = replacePlaceholders(responses[key])
                        if (addPing) {
                            message.reply(text).then(async function (msg) {
                                onMessageResponseUpdated(channel.id, message.id, msg.id)
                                addMessageToHistory(channel.id, msg.id, process.env.BOT_NAME, text,)
                            }).catch(console.error)
    
                        }  else {
                            while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                            console.log('response1: ' + text)
                            message.channel.send(text).then(async function (msg) {
                                onMessageResponseUpdated(channel.id, message.id, msg.id)
                                addMessageToHistory(channel.id, msg.id, process.env.BOT_NAME, text,)
                            }).catch(console.error)
                        }
                    }
                    else if (responses[key].length >= 2000) {
                        let text: string = replacePlaceholders(responses[key])
                        if (addPing) {
                            message.reply(text).then(async function (msg) {
                                onMessageResponseUpdated(channel.id, message.id, msg.id)
                                addMessageToHistory(channel.id, msg.id, process.env.BOT_NAME, text,)
                            })
                        } else {
                            while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                            console.log('response2: ' + text)
                        }
                        if (text.length > 0) {
                            message.channel.send(text, { split: true }).then(async function (msg) {
                                onMessageResponseUpdated(channel.id, message.id, msg.id)
                                addMessageToHistory(channel.id, msg.id, process.env.BOT_NAME, text,)
                            })
                        }
                    }
                    else {
                        const emptyResponse = getRandomEmptyResponse()
                        console.log('sending empty response: ' + emptyResponse)
                        if (emptyResponse !== undefined && emptyResponse !== '' && emptyResponse.replace(/\s/g, '').length !== 0) {
                            let text = emptyResponse
                            if (addPing) {
                                message.reply(text).then(async function (msg) {
                                    onMessageResponseUpdated(channel.id, message.id, msg.id)
                                    addMessageToHistory(channel.id, msg.id, process.env.BOT_NAME, text,)
                                }).catch(console.error)
                            } else {
                                while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                                console.log('response4: ' + text)
                                message.channel.send(text).then(async function (msg) {
                                    onMessageResponseUpdated(channel.id, message.id, msg.id)
                                    addMessageToHistory(channel.id, msg.id, process.env.BOT_NAME, text,)
                                }).catch(console.error)
                            }
                        }
                    }
                });          
                
            }).catch(err => console.log(err))
        });
    }

    async handleSlashCommand(chat_id, response) {
        this.client.channels.fetch(chat_id).then(channel => {
            channel.send(response)
            channel.stopTyping();
            
        /*Object.keys(response.response).map(function(key, index) {
            console.log('response: ' + response.response[key])
            if (response.response[key] !== undefined && response.response[key].length > 0) {
                let text = response.response[key]
                while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                sendSlashCommandResponse(client, interaction, chatId, text)  
           }
            else {
                let emptyResponse = getRandomEmptyResponse()
                while (emptyResponse === undefined || emptyResponse === '' || emptyResponse.replace(/\s/g, '').length === 0) emptyResponse = getRandomEmptyResponse()
                sendSlashCommandResponse(client, interaction, chatId, emptyResponse)
            }
        });      */
        }).catch(err => console.log(err))
    }

    async handleUserUpdateEvent(response) {
        console.log('handleUserUpdateEvent: ' + response)
    }

    async handleGetAgents(chat_id, response) {
        this.client.channels.fetch(chat_id).then(channel => {
            channel.send(response)
            channel.stopTyping();
        }).catch(err => console.log(err))
    }

    async handleSetAgentsFields(chat_id, response) {
        this.client.channels.fetch(chat_id).then(channel => {
            channel.send(response)
            channel.stopTyping();
        }).catch(err => console.log(err))
    }

    async handlePingSoloAgent(chat_id, message_id, responses, addPing) {
        this.client.channels.fetch(chat_id).then(channel => {
            channel.messages.fetch(message_id).then(message => {
                Object.keys(responses).map(function(key, index) {
                    console.log('response: ' + responses[key])
                    if (responses[key] !== undefined && responses[key].length <= 2000 && responses[key].length > 0) {
                        let text = replacePlaceholders(responses[key])
                        if (addPing) {
                            message.reply(text).then(async function (msg) {
                                onMessageResponseUpdated(channel.id, message.id, msg.id)
                                addMessageToHistory(channel.id, msg.id, process.env.BOT_NAME, text,)
                            }).catch(console.error)
    
                        }  else {
                            while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                            console.log('response1: ' + text)
                            message.channel.send(text).then(async function (msg) {
                                onMessageResponseUpdated(channel.id, message.id, msg.id)
                                addMessageToHistory(channel.id, msg.id, process.env.BOT_NAME, text,)
                            }).catch(console.error)
                        }
                    }
                    else if (responses[key].length >= 2000) {
                        let text: string = replacePlaceholders(responses[key])
                        if (addPing) {
                            message.reply(text).then(async function (msg) {
                                onMessageResponseUpdated(channel.id, message.id, msg.id)
                                addMessageToHistory(channel.id, msg.id, process.env.BOT_NAME, text,)
                            })
                        } else {
                            while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                            console.log('response2: ' + text)
                        }
                        if (text.length > 0) {
                            message.channel.send(text, { split: true }).then(async function (msg) {
                                onMessageResponseUpdated(channel.id, message.id, msg.id)
                                addMessageToHistory(channel.id, msg.id, process.env.BOT_NAME, text,)
                            })
                        }
                    }
                    else {
                        const emptyResponse = getRandomEmptyResponse()
                        console.log('sending empty response: ' + emptyResponse)
                        if (emptyResponse !== undefined && emptyResponse !== '' && emptyResponse.replace(/\s/g, '').length !== 0) {
                            let text = emptyResponse
                            if (addPing) {
                                message.reply(text).then(async function (msg) {
                                    onMessageResponseUpdated(channel.id, message.id, msg.id)
                                    addMessageToHistory(channel.id, msg.id, process.env.BOT_NAME, text,)
                                }).catch(console.error)
                            } else {
                                while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                                console.log('response4: ' + text)
                                message.channel.send(text).then(async function (msg) {
                                    onMessageResponseUpdated(channel.id, message.id, msg.id)
                                    addMessageToHistory(channel.id, msg.id, process.env.BOT_NAME, text,)
                                }).catch(console.error)
                            }
                        }
                    }
                });          
                
            })
        }).catch(err => console.log(err))
    }

    async handleMessageReactionAdd(response) {
        console.log('handleMessageReactionAdd: ' + response)
    }
    
    async handleMessageEdit(message_id, chat_id, responses, addPing) {

        this.client.channels.fetch(chat_id).then(async channel => {
            const oldResponse = getResponse(channel.id, message_id)
            if (oldResponse === undefined) {
                return
            }
            
            channel.messages.fetch(oldResponse).then(async msg => { 
                channel.messages.fetch({limit: this.client.edit_messages_max_count}).then(async messages => {
                    messages.forEach(async function(edited) {
                        if (edited.id === message_id) {
                            // Warn an offending user about their actions
                            let warn_offender = function(_user, ratings) {
                                edited.author.send(`You've got ${ratings} warnings and you will get blocked at 10!`)
                            }
                            // Ban an offending user
                            let ban_offender = function (message, _user) {
                                userDatabase.getInstance.banUser(edited.author.id, 'discord')
                                // TODO doesn't work with both discord-inline-reply and discord-reply
                                // message.lineReply('blocked')
                                edited.author.send(`You've been blocked!`)
                            }
                            // Collect obscene words for further actions / rating
                            let obscenities = chatFilter.getInstance.collectObscenities(edited.content, edited.author.id)
                            // OpenAI obscenity detector
                            let obscenity_count = obscenities.length
                            if (parseInt(process.env.OPENAI_OBSCENITY_DETECTOR, 10) && !obscenity_count) {
                                obscenity_count = await toxicityTest(edited.content)
                            }
                            // Process obscenities
                            if (obscenity_count > 0) {
                                chatFilter.getInstance.handleObscenities(
                                    edited,
                                    'discord',
                                    obscenity_count,
                                    warn_offender,
                                    ban_offender
                                )
                            }
                            // Stop processing if there are obscenities
                            if (obscenities.length > 0) {
                                return
                            }
        
                            await updateMessage(channel.id, edited.id, edited.content)

                            Object.keys(responses).map(async function(key, index) {
                                console.log('response: ' + responses[key])
                                if (responses[key] !== undefined && responses[key].length <= 2000 && responses[key].length > 0) {
                                    let text = replacePlaceholders(responses[key])
                                    while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                                    console.log('response1: ' + text)
                                    msg.edit(text)
                                    onMessageResponseUpdated(channel.id, edited.id, msg.id)
                                    await updateMessage(channel.id, msg.id, msg.content)
                                }
                                else if (responses[key].length >= 2000) {
                                    let text = replacePlaceholders(responses[key])
                                    while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                                    console.log('response2: ' + text)
                                                
                                    if (text.length > 0) {
                                        edited.channel.send(text, { split: true }).then(async function (msg) {
                                            onMessageResponseUpdated(channel.id, edited.id, msg.id)
                                            addMessageToHistory(channel.id, msg.id, process.env.BOT_NAME, text,)
                                        })
                                    }
                                }
                                else {
                                    const emptyResponse = getRandomEmptyResponse()
                                    console.log('sending empty response: ' + emptyResponse)
                                    if (emptyResponse !== undefined && emptyResponse !== '' && emptyResponse.replace(/\s/g, '').length !== 0) {                
                                        let text = emptyResponse
                                        while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                                        console.log('response4: ' + text)
                                        msg.edit(text)
                                        onMessageResponseUpdated(channel.id, edited.id, msg.id)
                                        await updateMessage(channel.id, msg.id, msg.content)
                                    }
                                }
                            });          
                            edited.channel.stopTyping();
                        }
                        })
                    }).catch(err => console.log(err))
            })
        })
    }
} 
import { chatFilter } from "../chatFilter";
import { userDatabase } from "../userDatabase";
import { getRandomEmptyResponse } from "../utils";
import { addMessageToHistory, getResponse, onMessageResponseUpdated, updateMessage } from "./chatHistory";
import { replacePlaceholders } from "./util";
require('discord-inline-reply'); 

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
                            message.lineReply(text).then(async function (msg) {
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
                            message.lineReply(text).then(async function (msg) {
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
                                message.lineReply(text).then(async function (msg) {
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
                message.channel.stopTyping();
            }).catch(err => console.log(err))
        });
    }

    async handleSlashCommand(chat_id, response) {
        this.client.channels.fetch(chat_id).then(channel => {
            channel.send(response)
            channel.stopTyping();
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
                            message.lineReply(text).then(async function (msg) {
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
                            message.lineReply(text).then(async function (msg) {
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
                                message.lineReply(text).then(async function (msg) {
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
                message.channel.stopTyping();
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
                            if (chatFilter.getInstance.isBadWord(edited.content, edited.author.id, 'discord', function(_user) {
                                edited.author.send('You got 5 warnings, at 10 you will get blocked!')
                            }, 
                            function (_user) {
                                userDatabase.getInstance.banUser(edited.author.id, 'client')
                                edited.lineReply('blocked')
                            }).length > 0) {
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
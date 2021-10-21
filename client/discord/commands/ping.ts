import { getRandomEmptyResponse } from "../../utils";
import { addMessageToHistory, onMessageResponseUpdated } from "../chatHistory";
import { replacePlaceholders } from "../util";
const inlinereply = require('discord-reply');

export async function run (client, message, args, author, addPing, channel) {
    if ( args.grpc_args.message === undefined ||  args.grpc_args.message === '' || args.grpc_args.message.replace(/\s/g, '').length === 0) {
        client.embed.description = 'Wrong format, !ping message'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }

    args.grpc_args['client_name'] = 'discord'
    args.grpc_args['chat_id'] = channel
    
    const date = new Date();
    const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    const utcStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
    args.grpc_args['createdAt'] = utcStr

    console.log('content: ' + args.grpc_args.message)
    console.log(JSON.stringify(args))

    let count: number = 2
    const _text = message.content.toLowerCase()
    if (_text.includes('hi') && !_text.includes('lecture')) {
        count = 1
    }
    if (_text.includes('hey') && !_text.includes('lecture')) {
        count = 1
    }
    if (_text.includes('how are you')) {
        count = 1
    }
    else if (_text.includes('hi') && _text.includes('lecture')) {
        args.grpc_args['message'] = args.grpc_args['message'].replace(new RegExp('hi', 'ig'), '')
        count = 9
    }
    else if (_text.includes('hi') && _text.includes('teach')) {
        args.grpc_args['message'] = args.grpc_args['message'].replace(new RegExp('hi', 'ig'), '')
        count = 6
    }
    else if (_text.includes('hey') && _text.includes('lecture')) {
        args.grpc_args['message'] = args.grpc_args['message'].replace(new RegExp('hi', 'ig'), '')
        count = 9
    }
    else if (_text.includes('hey') && _text.includes('teach')) {
        args.grpc_args['message'] = args.grpc_args['message'].replace(new RegExp('hi', 'ig'), '')
        count = 6
    }
    else if (_text.includes('lecture')) {
        count = 9
    }
    else if (_text.includes('teach')) {
        count = 6
    }

    console.log('count: ' + count)

    for(let i = 0; i < count; i++) {
        await client.messageResponseHandler(args, (response) => {
            Object.keys(response.response).map(function(key, index) {
                console.log('response: ' + response.response[key])
                if (response.response[key] !== undefined && response.response[key].length <= 2000 && response.response[key].length > 0) {
                    let text = replacePlaceholders(response.response[key])
                    if (addPing) {
                        message.lineReply(text).then(async function (msg) {
                            onMessageResponseUpdated(channel, message.id, msg.id)
                            addMessageToHistory(channel, msg.id, process.env.BOT_NAME, text)
                        }).catch(console.error)

                    }  else {
                        while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                        console.log('response1: ' + text)
                        message.channel.send(text).then(async function (msg) {
                            onMessageResponseUpdated(channel, message.id, msg.id)
                            addMessageToHistory(channel, msg.id, process.env.BOT_NAME, text)
                        }).catch(console.error)
                    }
                }
                else if (response.response[key].length >= 2000) {
                    let text: string = replacePlaceholders(response.response[key])
                    if (addPing) {
                        message.lineReply(text).then(async function (msg) {
                            onMessageResponseUpdated(channel, message.id, msg.id)
                            addMessageToHistory(channel, msg.id, process.env.BOT_NAME, text)
                        })
                    } else {
                        while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                        console.log('response2: ' + text)
                    }
                    if (text.length > 0) {
                        message.channel.send(text, { split: true }).then(async function (msg) {
                            onMessageResponseUpdated(channel, message.id, msg.id)
                            addMessageToHistory(channel, msg.id, process.env.BOT_NAME, text)
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
                                onMessageResponseUpdated(channel, message.id, msg.id)
                                addMessageToHistory(channel, msg.id, process.env.BOT_NAME, text)
                            }).catch(console.error)
                        } else {
                            while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                            console.log('response4: ' + text)
                            message.channel.send(text).then(async function (msg) {
                                onMessageResponseUpdated(channel, message.id, msg.id)
                                addMessageToHistory(channel, msg.id, process.env.BOT_NAME, text)
                            }).catch(console.error)
                        }
                    }
                }
            });          
            message.channel.stopTyping();
        }).catch(err => console.log(err))

        args.grpc_args['message'] = 'm continue'
    }
}
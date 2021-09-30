import { getRandomEmptyResponse } from "../../utils";
import { onMessageResponseUpdated } from "../chatHistory";
import { replacePlaceholders } from "../util";

export async function run (client, message, args, author, addPing, channel) {
    if ( args.grpc_args.message === undefined ||  args.grpc_args.message === '' || args.grpc_args.message.replace(/\s/g, '').length === 0) {
        client.embed.description = 'Wrong format, !ping message'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }
    console.log('content: ' + args.grpc_args.message)
    console.log(args)
    await client.messageResponseHandler(args, (response) => {
        Object.keys(response.response).map(function(key, index) {
            console.log('response: ' + response.response[key])
            if (response.response[key] !== undefined && response.response[key].length <= 2000 && response.response[key].length > 0) {
                if (addPing) {
                    const text = `<@!${author}> ` + replacePlaceholders(response.response[key])
                    message.channel.send(text).then(msg => onMessageResponseUpdated(channel, message.id, msg.id))
                }  else {
                    let text = replacePlaceholders(response.response[key])
                    while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                    console.log('response1: ' + text)
                    message.channel.send(text).then(msg => onMessageResponseUpdated(channel, message.id, msg.id))
                }
            }
            else if (response.response[key].length > 2000) {
                const lines: string[] = []
                let line: string = ''
                for(let i = 0; i < response.response[key].length; i++) {
                    line+= response.response[key]
                    if (i >= 1980 && (line[i] === ' ' || line[i] === '')) {
                        lines.push(line)
                        line = ''
                    }
                }

                for (let i = 0; i< lines.length; i++) {
                    if (lines[i] !== undefined && lines[i] !== '' && lines[i].replace(/\s/g, '').length !== 0) {
                        if (i === 0) {
                            if (addPing) {
                                const text = `<@!${author}> ` + replacePlaceholders(lines[i])
                                message.channel.send(text).then(msg => onMessageResponseUpdated(channel, message.id, msg.id))
                            } else {
                                let text = replacePlaceholders(lines[i])
                                while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                                console.log('response2: ' + text)
                                message.channel.send(text).then(msg => onMessageResponseUpdated(channel, message.id, msg.id))
                            }
                        } else {
                            let text = replacePlaceholders(lines[i])
                            while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                            console.log('response3: ' + text)
                            message.channel.send(text).then(msg => onMessageResponseUpdated(channel, message.id, msg.id))
                        }
                    }
                }
            }
            else {
                const emptyResponse = getRandomEmptyResponse()
                console.log('sending empty response: ' + emptyResponse)
                if (emptyResponse !== undefined && emptyResponse !== '' && emptyResponse.replace(/\s/g, '').length !== 0) {
                    if (addPing) {
                        const text = `<@!${author}> ` + emptyResponse
                        message.channel.send(text).then(msg => onMessageResponseUpdated(channel, message.id, msg.id))
                    } else {
                        let text = emptyResponse
                        while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                        console.log('response4: ' + text)
                        message.channel.send(text).then(msg => onMessageResponseUpdated(channel, message.id, msg.id))
                    }
                }
            }
        });          
        message.channel.stopTyping();
    });
}
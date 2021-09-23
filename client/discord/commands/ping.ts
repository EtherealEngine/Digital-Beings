import { getRandomEmptyResponse, replacePlaceholders } from "../util";

exports.run = async (client, message, args, author, addPing) => {
    if ( args.grpc_args.message === undefined ||  args.grpc_args.message === '' || args.grpc_args.message.replace(/\s/g, '').length === 0) {
        client.embed.description = 'Wrong format, !ping message'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }
    await client.messageResponseHandler(args, (response) => {
        Object.keys(response.response).map(function(key, index) {
            console.log('response: ' + response.response[key])
            if (response.response[key] !== undefined && response.response[key].length <= 2000 && response.response[key].length > 0) {
                if (addPing) {
                    message.channel.send('<@!' + author + '> ' + replacePlaceholders(response.response[key]))
                }  else {
                    message.channel.send(replacePlaceholders(response.response[key]))
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
                                message.channel.send('<@!' + author + '> ' + lines[i])
                            } else {
                                message.channel.send(lines[i])
                            }
                        } else {
                        message.channel.send(lines[i])
                        }
                    }
                }
            }
            else {
                const emptyResponse = getRandomEmptyResponse()
                console.log('sending empty response: ' + emptyResponse)
                if (emptyResponse !== undefined && emptyResponse !== '' && emptyResponse.replace(/\s/g, '').length !== 0) {
                    if (addPing) {
                        message.channel.send('<@!' + author + '> ' + emptyResponse)
                    } else {
                        message.channel.send(emptyResponse)
                    }
                }
            }
        });          
        message.channel.stopTyping();
    });
}
import { getRandomEmptyResponse } from "../../utils";
import { addMessageToHistory, getResponse, onMessageResponseUpdated, updateMessage } from "../chatHistory";
import { replacePlaceholders } from "../util";

module.exports = async (client, message) => {
    const {author, channel, content, id} = message;
    if (author.id === client.user.id) {
        await channel.messages.fetch(id).then(async msg => {
            console.log('updating local msg to db')
            await updateMessage(channel.id, id, msg.content)
         });
         return
    }

     const oldResponse = getResponse(channel.id, id)
     if (oldResponse === undefined) {
        await channel.messages.fetch(id).then(async msg => {
            await updateMessage(channel.id, id, msg.content)
         });
         return
     }
 
     channel.messages.fetch(oldResponse).then(async msg => { 
         channel.messages.fetch({limit: client.edit_messages_max_count}).then(async messages => {
             messages.forEach(async function(edited) {
                 if (edited.id === id) {
                    await updateMessage(channel.id, edited.id, edited.content)
                    const newText = edited.content.startsWith('!ping') ? edited.content : '!ping ' + edited.content
                 
                    const args = {}
                    args['grpc_args'] = {};
                    const messageContent = newText
                    const containsPrefix = messageContent.indexOf(client.config.prefix) === 0;
                    args['parsed_words'] = (containsPrefix
                        ? messageContent.slice(client.config.prefix.length)
                        : messageContent)
                        .trim().split(/ +/g);
                        const command = args['parsed_words'].shift().toLowerCase();
                        args['command_info'] = client._findCommand(command);
                        args['grpc_args']['sender'] = author.username;
                        if (args['command_info']) {
                            args['command'] = args['command_info'][0];
                            args['grpc_args']['message'] = messageContent.replace("!" + args['command'], "");  //remove .command from message
                            args['grpc_method'] = args['command_info'][1][0];
                            args['grpc_method_params'] = args['command_info'][2];
                        }
                        
                        args['grpc_args']['client_name'] = 'discord'
                        args['grpc_args']['chat_id'] = channel.id
                        
                        const date = new Date();
                        const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
                        const utcStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
                        args['grpc_args']['createdAt'] = utcStr
                    
                            await client.messageResponseHandler(args, (response) => {
                                Object.keys(response.response).map(async function(key, index) {
                                    console.log('response: ' + response.response[key])
                                    if (response.response[key] !== undefined && response.response[key].length <= 2000 && response.response[key].length > 0) {
                                        let text = replacePlaceholders(response.response[key])
                                        while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                                        console.log('response1: ' + text)
                                        msg.edit(text)
                                        onMessageResponseUpdated(channel, message.id, msg.id)
                                        await updateMessage(channel.id, msg.id, msg.content)
                                }
                                else if (response.response[key].length >= 2000) {
                                    let text = replacePlaceholders(response.response[key])
                                    while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                                    console.log('response2: ' + text)
                                       
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
                                                while (text === undefined || text === '' || text.replace(/\s/g, '').length === 0) text = getRandomEmptyResponse()
                                                console.log('response4: ' + text)
                                                console.log('response1: ' + text)
                                                msg.edit(text)
                                                onMessageResponseUpdated(channel, message.id, msg.id)
                                                await updateMessage(channel.id, msg.id, msg.content)
                                        }
                                    }
                                });          
                                message.channel.stopTyping();
                            }).catch(err => console.log(err))
                    }
                })
             }).catch(err => console.log(err))
     }).catch(err => console.log(err))
};
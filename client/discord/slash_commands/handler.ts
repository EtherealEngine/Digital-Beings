import { getRandomEmptyResponse } from "../../utils";
import { sendSlashCommandResponse } from "./utils";

export async function handleSlashCommand(client, interaction) {
    const messageResponseHandler= undefined
    const command = interaction.data.name.toLowerCase();
    const sender = interaction.member.user.username + ''
    const chatId = interaction.channel_id + ''

    const args = {}
    args['grpc_args'] = {};

    args['parsed_words'] = interaction.data.name.toLowerCase();
    args['command_info'] = [
        'slash_command',
        [ 'HandleSlashCommand' ],
        [ 'sender', 'command', 'args', 'client_name', 'chat_id', 'createdAt' ],
        'handle slash command'
      ]
    args['grpc_args']['sender'] = sender
    if (args['command_info']) {
        args['command'] = args['command_info'][0];
        args['grpc_args']['command'] = command
        args['grpc_args']['args'] = command === 'say' ? interaction.data.options[0].value : 'none'
        args['grpc_method'] = args['command_info'][1][0];
        args['grpc_method_params'] = args['command_info'][2];
    }

    args['grpc_args']['client_name'] = 'discord'
    args['grpc_args']['chat_id'] = chatId

    const dateNow = new Date();
    var utc = new Date(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), dateNow.getUTCHours(), dateNow.getUTCMinutes(), dateNow.getUTCSeconds());
    const utcStr = dateNow.getDate() + '/' + (dateNow.getMonth() + 1) + '/' + dateNow.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
    args['grpc_args']['createdAt'] = utcStr

    await messageResponseHandler(args, (response) => {
        console.log(JSON.stringify(response))
        Object.keys(response.response).map(function(key, index) {
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
        });          
    }).catch(err => console.log(err))
}
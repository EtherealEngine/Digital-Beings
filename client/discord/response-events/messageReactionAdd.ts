import { emojiToUnicode } from "../../utils";

export async function handleMessageReactionAdd(messageResponseHandler, client, reaction, user) {
    const { message } = reaction
    const emojiName = reaction.emoji.name
    
    const unicode = emojiToUnicode(emojiName)
    console.log('unicode: ' + unicode)
    const args = {}
    args['grpc_args'] = {};

    args['parsed_words'] = 'user_leave'
    args['command_info'] = [
        'message_reaction',
        [ 'HandleMessageReaction' ],
        [ 'client_name', 'chat_id', 'message_id', 'content', 'user', 'reaction', 'createdAt' ],
        'handle message reaction'
      ]
    args['grpc_args']['user'] = user.username
    if (args['command_info']) {
        args['command'] = args['command_info'][0];
        args['grpc_args']['content'] = message.content
        args['grpc_args']['reaction'] = emojiName
        args['grpc_method'] = args['command_info'][1][0];
        args['grpc_method_params'] = args['command_info'][2];
    }

    args['grpc_args']['client_name'] = 'discord'
    args['grpc_args']['chat_id'] = message.channel.id
    args['grpc_args']['message_id'] = message.id

    const dateNow = new Date();
    var utc = new Date(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), dateNow.getUTCHours(), dateNow.getUTCMinutes(), dateNow.getUTCSeconds());
    const utcStr = dateNow.getDate() + '/' + (dateNow.getMonth() + 1) + '/' + dateNow.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
    args['grpc_args']['createdAt'] = utcStr
    
    
    await messageResponseHandler(args, (response) => {
        console.log(JSON.stringify(response))
        Object.keys(response.response).map(function(key, index) {
        })
    })
};
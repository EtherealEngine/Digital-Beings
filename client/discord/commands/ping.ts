import { tcpClient } from "../../tcpClient";

export async function run(client, message, args, author, addPing, channel) {
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

    let parentId = ''
    if (args.grpc_args['isThread'] === true) {
        parentId = args.grpc_args['parentId']
    }

    tcpClient.getInstance.sendMessage(args.grpc_args['message'], message.id, 'Discord', args.grpc_args['chat_id'], utcStr, addPing, author.username, 'parentId:' + parentId)
}
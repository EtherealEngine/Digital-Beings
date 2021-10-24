import { tcpClient } from "../../tcpClient";

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

    let count: number = 3
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
        count = 10
    }
    else if (_text.includes('hi') && _text.includes('teach')) {
        args.grpc_args['message'] = args.grpc_args['message'].replace(new RegExp('hi', 'ig'), '')
        count = 5
    }
    else if (_text.includes('hey') && _text.includes('lecture')) {
        args.grpc_args['message'] = args.grpc_args['message'].replace(new RegExp('hi', 'ig'), '')
        count = 10
    }
    else if (_text.includes('hey') && _text.includes('teach')) {
        args.grpc_args['message'] = args.grpc_args['message'].replace(new RegExp('hi', 'ig'), '')
        count = 5
    }
    else if (_text.includes('lecture')) {
        count = 10
    }
    else if (_text.includes('teach')) {
        count = 5
    }

    console.log('count: ' + count)
    let msg = args.grpc_args['message']

    for(let i = 0; i < count; i++) {
        tcpClient.getInstance.sendMessage(msg, message.id, 'Discord', args.grpc_args['chat_id'], utcStr, addPing)
        await timeout(2000)
        msg = 'm continue'
    }
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function sleep(fn, ...args) {
    await timeout(3000);
    return fn(...args);
}
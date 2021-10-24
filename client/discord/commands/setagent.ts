import { tcpClient } from "../../tcpClient";

export async function run (client, message, args, author, addPing, channel) {
    if (args.grpc_args.message === undefined || args.grpc_args.message === '') {
        client.embed.description = 'Wrong format, !setagent agent=agent context=value'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }
    if (args.grpc_args['name'] === undefined || args.grpc_args['name'] === '' || args.grpc_args['context'] === undefined || args.grpc_args['context'] === '') {
        client.embed.description = 'Wrong format, !setagent agent=agent context=value'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }
    tcpClient.getInstance.sendSetAgentsFields('Discord', message.channel.id, args.grpc_args['name'], args.grpc_args['context'])
}
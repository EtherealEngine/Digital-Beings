import { tcpClient } from "../../tcpClient";
import { getRandomEmptyResponse } from "../../utils";
import { onMessageResponseUpdated } from "../chatHistory";
import { replacePlaceholders } from "../util";

export async function run (client, message, args, author, addPing, channel) {
    if (args.grpc_args.message === undefined || args.grpc_args.message === '' || args.grpc_args.message.replace(/\s/g, '').length === 0 
    || args.grpc_args.message.includes('agent=') || args.grpc_args.agent === undefined || args.grpc_args.agent === '' || args.grpc_args.agent.replace(/\s/g, '').length === 0) {
        client.embed.description = 'Wrong format, !pingagent agent=agent message=value'
        message.channel.send(client.embed)
        client.embed.desscription = ''
        message.channel.stopTyping();
        return
    }
    tcpClient.getInstance.sendPingSoloAgent('Discord', message.channel.id, message.id, args.grpc_args['message'], args.grpc_args['agent'], addPing, author.username)
}
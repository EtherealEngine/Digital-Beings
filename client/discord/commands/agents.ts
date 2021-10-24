import { tcpClient } from "../../tcpClient";

export async function run (client, message, args, author, addPing, channel) {
    tcpClient.getInstance.sendGetAgents('Discord', message.channel.id)
}
import { tcpClient } from "../../tcpClient";
import { getRandomEmptyResponse } from "../../utils";
import { sendSlashCommandResponse } from "./utils";

export async function handleSlashCommand(client, interaction) {
    const messageResponseHandler= undefined
    const command = interaction.data.name.toLowerCase();
    const sender = interaction.member.user.username + ''
    const chatId = interaction.channel_id + ''

    const dateNow = new Date();
    var utc = new Date(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), dateNow.getUTCHours(), dateNow.getUTCMinutes(), dateNow.getUTCSeconds());
    const utcStr = dateNow.getDate() + '/' + (dateNow.getMonth() + 1) + '/' + dateNow.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
    
    tcpClient.getInstance.sendSlashCommand(sender, command, command === 'say' ? interaction.data.options[0].value : 'none', 'Discord', chatId, utcStr)
}
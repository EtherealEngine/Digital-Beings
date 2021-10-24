import { tcpClient } from "../../tcpClient";

export async function handleGuildMemberAdd(user) {
    const userId = user.user.id
    const username = user.user.username

    const dateNow = new Date();
    var utc = new Date(dateNow.getUTCFullYear(), dateNow.getUTCMonth(), dateNow.getUTCDate(), dateNow.getUTCHours(), dateNow.getUTCMinutes(), dateNow.getUTCSeconds());
    const utcStr = dateNow.getDate() + '/' + (dateNow.getMonth() + 1) + '/' + dateNow.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()
    
    tcpClient.getInstance.sendUserUpdateEvent('Discord', 'join', username, utcStr)
};
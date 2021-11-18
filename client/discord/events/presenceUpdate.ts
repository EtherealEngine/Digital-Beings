import { tcpClient } from "../../tcpClient";

module.exports = async (client, oldMember, newMember) => {
    if (oldMember.status !== newMember.status) {
        const date = new Date();
        const utc = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        const utcStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + utc.getHours() + ':' + utc.getMinutes() + ':' + utc.getSeconds()

        client.users.fetch(newMember.userId).then(user => {
            tcpClient.getInstance.sendUserUpdateEvent('Discord', newMember.status, user.username, utcStr)
        })
    }
};
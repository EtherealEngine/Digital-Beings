import { postgres } from "./postgres"

export class userDatabase {
    static getInstance: userDatabase
    bannedUsers: { user_id: string, client: string }[] = []

    constructor(bannedUsers) {
        this.bannedUsers = bannedUsers
        console.log('loaded ' + this.bannedUsers.length + ' banned users!');
        userDatabase.getInstance = this

        setInterval(() => {
            postgres.getInstance.getBannedUsers(false)
        }, 60000)
    }

    isUserBanned(user_id: string, client: string) {
        for(let x in this.bannedUsers) {
            console.log(x + ' - ' + this.bannedUsers[x].user_id + ' - ' + user_id + ' - ' + (this.bannedUsers[x].user_id === user_id))
            if (this.bannedUsers[x].user_id === user_id && this.bannedUsers[x].client === client) {
                return true
            }
        }

        return false
    }

    async banUser(user_id: string, client: string) {
        console.log('blocking user1: ' + user_id)
        if (this.isUserBanned(user_id, client)) return

        console.log('blocking user: ' + user_id)
        await postgres.getInstance.banUser(user_id, client)
        this.bannedUsers.push({ 
            user_id: user_id, 
            client: client 
        });
    }
    async unbanUser(user_id: string, client: string) {
        if (!this.isUserBanned(user_id, client)) return

        const olength = this.bannedUsers.length
        for(let i = 0; i < this.bannedUsers.length; i++) {
            if (this.bannedUsers[i].user_id === user_id && this.bannedUsers[i].client === client) {
                this.bannedUsers.splice(i, 1)
                console.log('index: ' + i)
                break
            }
        }
        console.log('length: ' + olength + ' - ' + this.bannedUsers.length)
        await postgres.getInstance.unbanUser(user_id, client)
    }
}
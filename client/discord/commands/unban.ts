import { userDatabase } from "../../userDatabase";

export async function run (client, message, args, author, addPing, channel) {
    const pw = args.parsed_words
    if (pw === undefined || pw.length !== 1) {  
        message.channel.send('invalid command structure!')
        message.channel.stopTyping();
        return
    }
    
    const { mentions } = message
    console.log(JSON.stringify(mentions))
    if (mentions === undefined || mentions.users === undefined || mentions.users.size !== 1) {
        message.channel.send('invalid command structure!')
        message.channel.stopTyping();
        return
    }
    const user = mentions.users.first().id
    await userDatabase.getInstance.unbanUser(user, 'discord')
    message.channel.send('unbanned user: ' + `<@!${user}>`)
    message.channel.stopTyping();
}
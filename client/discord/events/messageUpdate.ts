import { getResponse, messageResponses, updateMessage } from "../chatHistory";

module.exports = async (client, message) => {
    const {author, channel, content, id} = message;
    if (author.id === client.user.id) return

     const oldResponse = getResponse(channel.id, id)
     if (oldResponse === undefined) {
        await channel.messages.fetch(id).then(async msg => {
            await updateMessage(channel.id, id, content)
         }).catch(console.error);
         return
     }
     await updateMessage(channel.id, id, content)
 
     channel.messages.fetch(oldResponse).then(async msg => { 
         channel.messages.fetch({limit: client.edit_messages_max_count}).then(async messages => {
             messages.forEach(function(edited) {
                 if (edited.id === id) {
                    const newText = edited.content.startsWith('!ping') ? edited.content : '!ping ' + edited.content
                 
                    const args = {}
                    args['grpc_args'] = {};
                    const messageContent = newText
                    const containsPrefix = messageContent.indexOf(client.config.prefix) === 0;
                    args['parsed_words'] = (containsPrefix
                        ? messageContent.slice(client.config.prefix.length)
                        : messageContent)
                        .trim().split(/ +/g);
                        const command = args['parsed_words'].shift().toLowerCase();
                        args['command_info'] = client._findCommand(command);
                        args['grpc_args']['sender'] = author.username;
                        if (args['command_info']) {
                            args['command'] = args['command_info'][0];
                            args['grpc_args']['message'] = messageContent.replace("!" + args['command'], "");  //remove .command from message
                            args['grpc_method'] = args['command_info'][1][0];
                            args['grpc_method_params'] = args['command_info'][2];
                        }
                        const cmd = client.commands.get(command)
                        cmd.run(client, message, args, author, false, channel.id).catch(err => console.log(err))
                        msg.delete()
                    }
                })
             }).catch(err => console.log(err))
     }).catch(err => console.log(err))
};
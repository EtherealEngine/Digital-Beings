import { getResponse, messageResponses } from "../chatHistory";
import { getRandomEmptyResponse, replacePlaceholders } from "../util";

module.exports = (client, message) => {
    const {author, channel, content, id} = message;
    if (author.id === client.user.id) return

     const oldResponse = getResponse(id)
     if (oldResponse === undefined) return
 
     channel.messages.fetch(oldResponse).then(async msg => { 
         channel.messages.fetch(id).then(async edited => {
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
                if (args['command'] == 'setagent' || args['command'] == 'pingagent') {
                    const splitArgs = args['grpc_args']['message'].trim().split(",");
                    splitArgs.forEach(element => {
                        args['grpc_args'][element.trim().split("=")[0]] = element.trim().split("=")[1];
                    });
                }
                const cmd = client.commands.get(command)
                cmd.run(client, message, args, author, false, channel.id);
                msg.delete()
         })
     })
};
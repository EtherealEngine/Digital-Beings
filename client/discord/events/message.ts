module.exports = (client, message) => {
    const args = {}
    args['grpc_args'] = {};

    // Ignore all bots
    if (message.author.bot) return;
  
    // Ignore messages not starting with the prefix (in config.json)
    if (message.content.indexOf(client.config.prefix) !== 0) return;
    
    if (message.channel.type === 'text') {
        if (message.mentions.has(client.user)) {
        }else {
            message.reply(message.content);
        }
    } 
    else if (message.channel.type === 'dm') {
        if (message.mentions.has(client.user)) {

        }else {
            message.reply(message.content);
        }
    }
    
    // Our standard argument/command name definition.
    args['parsed_words'] = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
    const command = args['parsed_words'].shift().toLowerCase();
  
    // Grab the command data from the client.commands Enmap
    const cmd = client.commands.get(command);

    args['command_info'] = client._findCommand(command);
    args['grpc_args']['sender'] = message.author.username;
    if(args['command_info']){
        args['command'] = args['command_info'][0];
        args['grpc_args']['message'] = message.content.replace("!"+args['command'], "");  //remove .command from message
        args['grpc_method'] = args['command_info'][1][0];
        args['grpc_method_params'] = args['command_info'][2];
    }
    // if(args['grpc_method'] === 'setagent'){
        const splitArgs = args['grpc_args']['message'].trim().split(",");
        splitArgs.forEach(element => {
            args['grpc_args'][element.trim().split("=")[0]] = element.trim().split("=")[1];
        });
  
    // }
    
    // If that command doesn't exist, silently exit and do nothing
    if (!cmd) return;
    
    message.channel.startTyping();
    // Run the command
    cmd.run(client, message, args);
  };
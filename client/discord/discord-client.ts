const Discord = require('discord.js');
const {Util} = require('discord.js')
const DISCORD_API_TOKEN = process.env.DISCORD_API_TOKEN;


const embedColor = '#000000';
const _commandToValue = ([name, args, description]) =>
  ['.' + name, args.join(' '), '-', description].join(' ');
const _commandToDescription = ([name, args, description]) =>
  '```css\n' +
    ['.' + name, args.join(' '), '-', description].join(' ') +
  '```';
const _commandsToValue = commands =>
  '```css\n' +
    commands.map(command => _commandToValue(command)).join('\n') +
  '```';


const helpFields = [
  {
    name: 'Tweak',
    shortname: 'tweak',
    commands: [
      ['.agents', ['GetAgents'], 'show all selected agents'],
      ['.setagent', ['SetAgentFields'], 'update agents parameters'],
    ],
    value: ''
  },
].map(o => {
  o.value = _commandsToValue(o.commands);
  return o;
});


const _findCommand = commandName => {
  let command = null;
  for (const helpField of helpFields) {
    for (const c of helpField.commands) {
      const [name, args, description] = c;
      if (name === commandName) {
        command = c;
        break;
      }
    }
    if (command !== null) {
      break;
    }
  }
  return command;
};


const _parseWords = s => {
  const words = [];
  const r = /\S+/g;
  let match;
  while (match = r.exec(s)) {
    words.push(match);
  }
  return words;
};

const createDiscordClient = (messageResponseHandler) => {
    if (!DISCORD_API_TOKEN) return console.warn("No API token for Discord bot, skipping");
    const client = new Discord.Client();
    client.on('ready', async function () {
        client.on('message', async (message) => {
            if (message.author.bot)
                return; // Skip own messages
            if (message.channel.type === 'text') {
              if (message.mentions.has(client.user)) {
                let args_dict = {};
                args_dict['request_args'] = {};
                message.channel.startTyping();
                const removeMentions= message.content.split(" ").slice(1).join(" ")
                message.content = removeMentions.replace(/<@[!&]?\d+>/, '[mention]');
                const parsedWords = _parseWords(message.content);
                args_dict['command'] = _findCommand(parsedWords[0][0]);
                args_dict['request_args']['sender'] = message.author.username;
                if(args_dict['command']){
                  args_dict['command'] = args_dict['command'][0];
                  args_dict['request_args']['message'] = message.content.replace(args_dict['command'], "");  //remove .command from message
                  args_dict['grpc_method'] = _findCommand(parsedWords[0][0])[1][0];
                }else{
                  args_dict['grpc_method'] = 'HandleMessage';
                  args_dict['request_args']['message'] = message.content;
                }
                const splitArgs = args_dict['request_args']['message'].trim().split(",");
                splitArgs.forEach(element => {
                  args_dict['request_args'][element.trim().split("=")[0]] = element.trim().split("=")[1];
                });
                
                await messageResponseHandler(args_dict, (response) => {
                  message.channel.send(Object.values(response).join().replace(",", "\n"))
                  message.channel.stopTyping();
                  });
              }else {
                  message.reply(message.content);
              }
            } 
            else if (message.channel.type === 'dm') {
              if (message.mentions.has(client.user)) {
                let args_dict = {};
                args_dict['request_args'] = {};
                message.channel.startTyping();
                const removeMentions= message.content.split(" ").slice(1).join(" ")
                message.content = removeMentions.replace(/<@[!&]?\d+>/, '[mention]');
                const parsedWords = _parseWords(message.content);
                args_dict['command'] = _findCommand(parsedWords[0][0]);
                args_dict['request_args']['sender'] = message.author.username;
                if(args_dict['command']){
                  args_dict['command'] = args_dict['command'][0];
                  args_dict['request_args']['message'] = message.content.replace(args_dict['command'], "");  //remove .command from message
                  args_dict['grpc_method'] = _findCommand(parsedWords[0][0])[1][0];
                }else{
                  args_dict['grpc_method'] = 'HandleMessage';
                  args_dict['request_args']['message'] = message.content;
                }
                const splitArgs = args_dict['request_args']['message'].trim().split(",");
                splitArgs.forEach(element => {
                  args_dict['request_args'][element.trim().split("=")[0]] = element.trim().split("=")[1];
                });
                
                await messageResponseHandler(args_dict, (response) => {
                  // let filter = m => m.author.id === message.author.id
                  message.channel.send(Object.values(response).join().replace(",", "\n"))
                  // .then(() => {
                  //   message.channel.awaitMessages(filter, {
                  //       max: 1,
                  //       time: 30000,
                  //       errors: ['time']
                  //     })
                  //     .then(message => {
                  //       message = message.first()
                  //       if (message.content.toUpperCase() == 'YES' || message.content.toUpperCase() == 'Y') {
                  //         message.channel.send(`Deleted`)
                  //       } else if (message.content.toUpperCase() == 'NO' || message.content.toUpperCase() == 'N') {
                  //         message.channel.send(`Terminated`)
                  //       } else {
                  //         message.channel.send(`Terminated: Invalid Response`)
                  //       }
                  //     })
                  //     .catch(collected => {
                  //         message.channel.send('Timeout');
                  //     });
                  //   }
                  // );
                  message.channel.stopTyping();
                  });
              }else {
                  message.reply(message.content);
              }
            }
        });
    });
    client.login(DISCORD_API_TOKEN);
};

module.exports = {createDiscordClient}

import { client } from "./discord-client";

export const embedColor = '#000000';
export const _commandToValue = ([name, args, description]) =>
  ['.' + name, args.join(' '), '-', description].join(' ');
  export const _commandToDescription = ([name, args, description]) =>
  '```css\n' +
    ['.' + name, args.join(' '), '-', description].join(' ') +
  '```';
  export const _commandsToValue = commands =>
  '```css\n' +
    commands.map(command => _commandToValue(command)).join('\n') +
  '```';


  export const helpFields = [
  {
    name: 'Tweak',
    shortname: 'tweak',
    commands: [
      ['ping', ['HandleMessage'],['sender', 'message', 'client_name', 'chat_id'], 'ping all agents'],
      ['pingagent', ['InvokeSoloAgent'],['sender', 'message', 'agent', 'createdAt'], 'ping a single agent'],
      ['agents', ['GetAgents'], [''], 'show all selected agents'],
      ['setagent', ['SetAgentFields'],['name', 'context'], 'update agents parameters'],
      ['commands', [''],[''], 'Shows all available commands'],
    ],
    value: ''
  },
].map(o => {
  o.value = _commandsToValue(o.commands);
  return o;
});


export const _findCommand = commandName => {
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


export const _parseWords = s => {
  const words = [];
  const r = /\S+/g;
  let match;
  while (match = r.exec(s)) {
    words.push(match);
  }
  return words;
};

export function replacePlaceholders(text: string): string {
  if (text === undefined || text === '') return ''

  if (text.includes('{time_now}')) {
    const now = new Date()
    const time: string = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds()
    text = text.replace('{time_now}', time)
  } 
  if (text.includes('{date_now}')) {
    const today = new Date()
    const date: string = today.getDay() + '/' + today.getMonth() + '/' + today.getFullYear()
    text = text.replace('{date_now}', date)
  }
  if (text.includes('{year_now}')) {
    text = text.replace('{year_now', new Date().getFullYear().toString())
  }
  if (text.includes('{month_now}')) {
    text = text.replace('{month_now}', new Date().getMonth().toString())
  }
  if (text.includes('{day_now}')) {
    text = text.replace('{day_now}', new Date().getDay().toString())
  }
  if (text.includes('{name}')) {
    text = text.replace('{name}', client.bot_name)
  }

  return text
}
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
      ['ping', ['HandleMessage'],['sender', 'message'], 'ping agents'],
      ['agents', ['GetAgents'], [''], 'show all selected agents'],
      ['setagent', ['SetAgentFields'],['name', 'context'], 'update agents parameters'],
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

module.exports = {_findCommand, _parseWords, helpFields}

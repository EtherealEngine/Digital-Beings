const commandHandler = async (message) => {
    if (message.author.bot)
      return; // Skip own messages
    if (message.channel.type === 'text') {
      if (message.mentions.has(client.user)) {
        message.channel.startTyping();
        let removeMentions= message.content.split(" ").slice(1).join(" ")
        message.content = removeMentions.replace(/<@[!&]?\d+>/, '[mention]');
        await messageResponseHandler(message.author.username, message.content, (response) => {
          message.channel.send(response.value)
          message.channel.stopTyping();
        });
      }
    } else if (message.channel.type === 'dm') {
      if (message.mentions.has(client.user)) {
        message.channel.startTyping();
        let removeMentions= message.content.split(" ").slice(1).join(" ")
        message.content = removeMentions.replace(/<@[!&]?\d+>/, '[mention]');
        await messageResponseHandler(message.author.username, message.content, (response) => {
          message.author.send(response.value)
          message.channel.stopTyping();
        });
      }
    }
  }

module.exports = { commandHandler }
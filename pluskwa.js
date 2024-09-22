const { Client, WebhookClient } = require('discord.js-selfbot-v13');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const {token, webhook} = require('./config.json')

const client = new Client();

const webhookClient = new WebhookClient({ url: webhook })


client.on("messageCreate", async msg => {

  if (msg.channel.type == 'DM') {
    const attachments = msg.attachments.map(attachment => ({
      name: path.basename(attachment.url.split("?")[0]),
      attachment: attachment.url
    }));

    const files = [];

    for (const attachment of attachments) {
      const response = await axios.get(attachment.attachment, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');

      files.push({
        attachment: buffer,
        name: attachment.name
      });
    }

    msg.attachments.map(elm => { elm.attachment.url })

    webhookClient.send({
      content: msg.content === "" ? "." : msg.content,
      username: msg.author.username,
      avatarURL: msg.author.avatarURL(),
      embeds: msg.embeds,
      attachments: msg.attachments,
      files: files
    })
  }
})

client.once('ready',  async() => {
  console.log(`Logged on: ${client.user.username}`)
  client.user.setStatus('invisible')
})


client.login(token);






// Add error handling to detect disconnection or unhandled errors
client.on('error', error => {
  console.error('The bot encountered an error');
  restartBot();
});

client.on('shardError', error => {
  console.error('A websocket connection encountered an error');
  restartBot();
});

client.on('disconnect', event => {
  console.error('The bot has disconnected');
  restartBot();
});

// This function will restart the bot
function restartBot() {
  console.log('Restarting bot...');
  setTimeout(() => process.exit(1),20000); // Exit the process with a failure code, so the bot restarts
}

// Handle uncaught exceptions to avoid the bot from crashing without restarting
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception');
  restartBot();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection');
  restartBot();
});
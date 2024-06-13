const fs = require('fs');
require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const token = process.env.TOKEN;
const clientId = process.env.CLIENTID;
const guildId = process.env.GUILDID;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const rest = new REST({ version: '9' }).setToken(token);

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command);
}

client.once('ready', async (client) => {
  console.log(`Logged in as ${client.user.tag}`);
  
  client.user.setActivity({
    type: ActivityType.Custom, 
    name: 'customstatus', 
    state: 'Creating CryoDAO'
  });

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

  client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;


  const { commandName, options, member } = interaction;

  const command = commands.find(cmd => cmd.name === commandName);

  if (command) {
    try {
      command.execute(interaction, options, member);
      console.log(member.user.username);
    } catch (error) {
      console.error(error);
      interaction.reply({ content: 'There was an error executing the command.', ephemeral: true });
    }
  }
});

client.login(token);
const axios = require('axios');

const { 
  ButtonBuilder,
  ButtonStyle, 
  ActionRowBuilder, 
  ComponentType
} = require('discord.js');

module.exports = {
  name: 'setup_verify_token',
  description: 'Setup a token verification channel.',
  async execute(interaction) {
    const member = await interaction.guild.members.cache.get(interaction.user.id);
    const validRole = process.env.ADMIN_ROLE;

    // Check for a admin role to run setup command
    if (!member.roles.cache.some(role => role.name === validRole)) {
        // End if no Admin detected
        return interaction.reply({ content: `You do not have the required "${validRole}" role to use this command.`, ephemeral: true });
    } else if (member.roles.cache.some(role => role.name === validRole)) {
        try {
          await interaction.reply({ content: 'Setting Up Token Verification System', ephemeral: true });  
          const embed = {
            title: ' ',
            description: '#  **Verify your tokens, confirm your ownership.**',
            color: 0xffffff,
            thumbnail: {
                url: 'https://cdn.discordapp.com/avatars/1191012892703723662/dc116b35ea59093a47042103a109afe6.webp?size=160'
            }
          };
            
          // Button Logic
          const filter = (i) => interaction.user.id === interaction.user.id;
  
          const firstButton = new ButtonBuilder()
            .setLabel('Confirm Ownership')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('button-one')
          
          const buttonRow = new ActionRowBuilder().addComponents(firstButton);
          const buttonSent = await interaction.channel.send({ embeds: [embed], components: [buttonRow] });  
  
          const collector = buttonSent.createMessageComponentCollector({
            ComponentType: ComponentType.Button,
            filter,
          });

          collector.on('end', () => {
            firstButton.setDisabled(true);
          });

          // Define a map to store user IDs and their last interaction timestamps
          const cooldowns = new Map();

          collector.on('collect', async (interaction) => {
            try{
            if (cooldowns.has(interaction.user.id)) {
                const expirationTime = cooldowns.get(interaction.user.id);
                const remainingTime = expirationTime - Date.now();
        
                  // Check if the cooldown period has not elapsed
                  if (remainingTime > 0) {
                    const remainingSeconds = Math.ceil(remainingTime / 1000);
                    return interaction.reply({ content: `You are on cooldown. Please wait ${remainingSeconds} seconds before using this button again.`, ephemeral: true });
                }
            }
    
            // Cooldown
            const cooldownTime = 30 * 1000; // 30 seconds
              // Calculate the expiration time for the cooldown
              const expirationTime = Date.now() + cooldownTime;
              // Set the cooldown for the user
              cooldowns.set(interaction.user.id, expirationTime);

              if (interaction.customId === 'button-one') {

                // Create Verification Link Button

                const member = await interaction.guild.members.cache.get(interaction.user.id);
                console.log(member.username);
                
                // Return if user is already verified
                if (member.roles.cache.some(role => role.name === 'Verified')) {
                  return await interaction.reply({ content: "You already have the 'Verified' role", ephemeral: true });
                };
                
                await interaction.reply({ content: 'Creating Token Verification URL...', ephemeral: true });

                const api_key = process.env.API_KEY;
                const verify_site_url = process.env.verify_site_url;

                const username = interaction.user.username;
                const profilePicture = interaction.user.displayAvatarURL();
                const userId = interaction.user.id;

                console.log(username, profilePicture, userId);

                // Post req to API
                const response = await axios.post('http://localhost:3001/verify', {
                  userId,
                  username,
                  profile_picture: profilePicture,
                  api_key: api_key,
                });

                const token = response.data.token;
                const replacedToken = token.replace(/\./g, '*');

                const embedEdit = {
                    title: 'Your Token Verification URL - Expires in 10 Minutes',
                    description: 'Click [HERE](' + verify_site_url + replacedToken + ') or copy this link ```' + verify_site_url + replacedToken
                     +'```',
                    color: 0xffffff,
                    thumbnail: {
                        url: 'https://cdn.discordapp.com/avatars/1191012892703723662/dc116b35ea59093a47042103a109afe6.webp?size=160'
                    }
                };

                await interaction.editReply({ content: ``, embeds:[embedEdit], ephemeral: true });
            } else {
                console.log('Unknown Interaction Button 007');
            }
        } catch (error){
            console.log("An error occured", error);
        }
            });


        } catch (error) {
          console.log('Error Sending Help Command ', error);
          interaction.reply({ content: 'An error occured sending a help command.', ephemeral: true });  
        }
      } 
  },
};
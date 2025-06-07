const { EmbedBuilder } = require('discord.js');
const messageTemplates = require('../utils/messageTemplates');

module.exports = {
    name: 'help',
    description: 'Show all available commands',
    
    async execute(message, args) {
        const helpMsg = messageTemplates.getHelpMessage();
        
        const embed = new EmbedBuilder()
            .setColor('#7B68EE')
            .setTitle(helpMsg.title)
            .setDescription(helpMsg.description)
            .addFields(helpMsg.fields)
            .setFooter({ text: helpMsg.footer })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    }
};
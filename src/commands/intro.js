const { EmbedBuilder } = require('discord.js');
const messageTemplates = require('../utils/messageTemplates');

module.exports = {
    name: 'intro',
    description: 'Send the Star Sprout introduction message',
    
    async execute(message, args) {
        // Check permissions
        if (!message.member.permissions.has('Administrator')) {
            const errorMsg = messageTemplates.getErrorMessage('permission');
            const embed = new EmbedBuilder()
                .setColor('#DC143C')
                .setTitle(errorMsg.title)
                .setDescription(errorMsg.description)
                .setFooter({ text: 'Star Sprout • Permission Denied' });
            
            return message.reply({ embeds: [embed] });
        }

        const introMsg = messageTemplates.getIntroMessage(message.guild.name);
        
        const embed = new EmbedBuilder()
            .setColor('#7B68EE')
            .setTitle(introMsg.title)
            .setDescription(introMsg.description)
            .setFooter({ text: introMsg.footer })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};
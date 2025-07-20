// commands/utility/level.js
const levelSystem = require('../../utils/levelSystem');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'level',
    description: 'Melihat level dan XP Anda atau pengguna lain.',
    aliases: ['rank', 'xp'],
    async execute(message, args) {
        const targetUser = message.mentions.users.first() || message.author;
        const userData = levelSystem.getUser(targetUser.id, message.guild.id);

        const xpNeededForNextLevel = levelSystem.calculateXpForLevel(userData.level + 1);

        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle(`Level dan XP ${targetUser.username}`)
            .setDescription(`**Level:** ${userData.level}\n` +
                         `**XP:** ${userData.xp}/${xpNeededForNextLevel}\n` +
                         `*Dibutuhkan ${xpNeededForNextLevel - userData.xp} XP lagi untuk Level ${userData.level + 1}*`)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setTimestamp()
            .setFooter({ text: 'Bot RPL 1 Leveling System' });

        await message.channel.send({ embeds: [embed] });
    },
};
// commands/music/skip.js
const musicPlayer = require('../../utils/musicPlayer');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'skip',
    description: 'Melewatkan lagu yang sedang diputar.',
    usage: '',
    aliases: ['s'],
    async execute(message, args) {
        const guildId = message.guild.id;
        if (musicPlayer.skip(guildId)) {
            const embed = new EmbedBuilder()
                .setColor(0xFFA500) // Oranye
                .setDescription('⏭️ Lagu dilewati.');
            await message.channel.send({ embeds: [embed] });
        } else {
            message.reply('Tidak ada lagu yang sedang diputar atau di antrean untuk dilewati.');
        }
    },
};
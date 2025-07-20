// commands/music/stop.js
const musicPlayer = require('../../utils/musicPlayer');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'stop',
    description: 'Menghentikan pemutaran dan meninggalkan voice channel.',
    usage: '',
    aliases: ['leave', 'disconnect'],
    async execute(message, args) {
        const guildId = message.guild.id;
        musicPlayer.stop(guildId);
        const embed = new EmbedBuilder()
            .setColor(0xFF0000) // Merah
            .setDescription('⏹️ Pemutaran dihentikan. Bot meninggalkan *voice channel*.');
        await message.channel.send({ embeds: [embed] });
    },
};
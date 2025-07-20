// commands/music/loop.js
const musicPlayer = require('../../utils/musicPlayer');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'loop',
    description: 'Mengaktifkan atau menonaktifkan pengulangan lagu saat ini.',
    usage: '',
    async execute(message, args) {
        const guildId = message.guild.id;
        const loopStatus = musicPlayer.toggleLoop(guildId);

        const embed = new EmbedBuilder()
            .setColor(0x9932CC) // Ungu
            .setDescription(`🔁 Mode loop sekarang **${loopStatus ? 'AKTIF' : 'NONAKTIF'}**.`);
        
        await message.channel.send({ embeds: [embed] });
    },
};
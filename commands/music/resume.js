// commands/music/resume.js
const musicPlayer = require('../../utils/musicPlayer');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'resume',
    description: 'Melanjutkan pemutaran musik yang dijeda.',
    usage: '',
    aliases: ['continue'],
    async execute(message, args) {
        const guildId = message.guild.id;
        if (musicPlayer.resume(guildId)) {
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setDescription('▶️ Musik dilanjutkan.');
            await message.channel.send({ embeds: [embed] });
        } else {
            message.reply('Tidak ada musik yang dijeda untuk dilanjutkan.');
        }
    },
};
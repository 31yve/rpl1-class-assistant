// commands/music/pause.js
const musicPlayer = require('../../utils/musicPlayer');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'pause',
    description: 'Menjeda pemutaran musik.',
    usage: '',
    async execute(message, args) {
        const guildId = message.guild.id;
        if (musicPlayer.pause(guildId)) {
            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setDescription('⏸️ Musik dijeda.');
            await message.channel.send({ embeds: [embed] });
        } else {
            message.reply('Tidak ada musik yang sedang diputar untuk dijeda.');
        }
    },
};
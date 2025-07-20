// commands/music/queue.js (MODIFIKASI UNTUK MENAMPILKAN JUDUL)
const musicPlayer = require('../../utils/musicPlayer');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'queue',
    description: 'Melihat antrean lagu.',
    usage: '',
    aliases: ['q'],
    async execute(message, args) {
        const guildId = message.guild.id;
        const queue = musicPlayer.getQueue(guildId);
        const currentSong = musicPlayer.getCurrentSong(guildId);

        let description = '';
        if (currentSong) {
            description += `**Sedang Diputar:** [${currentSong.title}](${currentSong.url})\n\n`; // <--- UBAH INI
        } else {
            description += 'Tidak ada lagu yang sedang diputar.\n\n';
        }

        if (queue.length === 0) {
            description += 'Antrean kosong.';
        } else {
            description += '**Antrean:**\n';
            for (let i = 0; i < Math.min(queue.length, 10); i++) {
                const song = queue[i];
                description += `${i + 1}. [${song.title}](${song.url})\n`; // <--- UBAH INI
            }
            if (queue.length > 10) {
                description += `... dan ${queue.length - 10} lagu lainnya.`;
            }
        }

        const embed = new EmbedBuilder()
            .setColor(0x00BFFF)
            .setTitle('🎵 Antrean Musik')
            .setDescription(description)
            .setFooter({ text: 'Bot RPL 1 Music' })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    },
};
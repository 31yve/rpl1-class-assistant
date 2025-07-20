// commands/collaboration/list-groups.js
const config = require('../../config.json');
const { EmbedBuilder } = require('discord.js');
const studyGroupManager = require('../../utils/studyGroupManager');

module.exports = {
    name: 'daftar-kelompok',
    description: 'Menampilkan daftar permintaan kelompok belajar yang sedang aktif.',
    aliases: ['list-groups'],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const activeRequests = studyGroupManager.getRequestsByGuild(guildId);

        const embed = new EmbedBuilder()
            .setColor(0x0000FF)
            .setTitle('📚 Permintaan Kelompok Belajar Aktif 📚')
            .setDescription('Berikut adalah daftar topik yang sedang dicari teman belajar:')
            .setFooter({ text: 'Bot RPL 1 - Gunakan !cari-kelompok [topik] untuk bergabung!' })
            .setTimestamp();

        if (activeRequests.size === 0) {
            embed.setDescription('Saat ini tidak ada permintaan kelompok belajar yang aktif. Jadilah yang pertama!');
        } else {
            let hasFreshRequests = false;
            const fields = [];
            for (const [topic, requests] of activeRequests.entries()) {
                const freshRequests = requests.filter(req => (Date.now() - req.timestamp) < (2 * 60 * 60 * 1000)); // 2 hours validity
                if (freshRequests.length > 0) {
                    hasFreshRequests = true;
                    let userMentions = [];
                    for (const req of freshRequests) {
                        try {
                            const user = await client.users.fetch(req.userId);
                            userMentions.push(user.toString());
                        } catch (error) {
                            userMentions.push(`(Pengguna tidak ditemukan: ${req.userId})`);
                        }
                    }
                    fields.push({
                        name: `Topik: **${topic.toUpperCase()}** (${freshRequests.length} orang mencari)`,
                        value: `Dicari oleh: ${userMentions.join(', ')}`,
                        inline: false
                    });
                } else {
                    // Clean up old requests if none are fresh for this topic
                    studyGroupManager.removeUserRequest(guildId, null, topic);
                }
            }

            if (fields.length > 0) {
                embed.addFields(fields);
            } else {
                embed.setDescription('Saat ini tidak ada permintaan kelompok belajar yang aktif. Jadilah yang pertama!');
            }
        }
        
        await message.channel.send({ embeds: [embed] });
    },
};
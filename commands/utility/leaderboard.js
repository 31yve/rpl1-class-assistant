// commands/utility/leaderboard.js
const levelSystem = require('../../utils/levelSystem');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'leaderboard',
    description: 'Menampilkan 10 besar papan peringkat XP di server.',
    aliases: ['lb', 'top'],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const usersData = levelSystem.getAllUsersInGuild(guildId);

        const sortedUsers = Object.keys(usersData)
            .map(userId => ({
                id: userId,
                ...usersData[userId]
            }))
            .sort((a, b) => b.xp - a.xp);

        const top10Users = sortedUsers.slice(0, 10);

        const leaderboardEmbed = new EmbedBuilder()
            .setColor(0xFFA500)
            .setTitle('🏆 Papan Peringkat XP Kelas RPL 1 🏆')
            .setDescription('Berikut adalah daftar siswa dengan XP tertinggi di server ini:\n\n')
            .setFooter({ text: 'Bot RPL 1 Leveling System' })
            .setTimestamp();

        if (top10Users.length === 0) {
            leaderboardEmbed.setDescription('Belum ada data XP yang tercatat di server ini.');
        } else {
            let leaderboardText = '';
            for (let i = 0; i < top10Users.length; i++) {
                const user = top10Users[i];
                try {
                    const discordUser = await client.users.fetch(user.id);
                    leaderboardText += `**${i + 1}. ${discordUser.username}#${discordUser.discriminator}** - Level: \`${user.level}\` | XP: \`${user.xp}\`\n`;
                } catch (error) {
                    leaderboardText += `**${i + 1}. ID: ${user.id} (Pengguna tidak ditemukan)** - Level: \`${user.level}\` | XP: \`${user.xp}\`\n`;
                }
            }
            leaderboardEmbed.setDescription(leaderboardText);
        }

        await message.channel.send({ embeds: [leaderboardEmbed] });
    },
};
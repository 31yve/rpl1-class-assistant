// commands/collaboration/find-group.js
const config = require('../../config.json');
const { EmbedBuilder } = require('discord.js');
const studyGroupManager = require('../../utils/studyGroupManager');

module.exports = {
    name: 'cari-kelompok',
    description: 'Mencari atau membuat permintaan kelompok belajar. Contoh: !cari-kelompok Algoritma',
    aliases: ['find-group', 'belajar-bareng'],
    async execute(message, args, client) {
        const guildId = message.guild.id;
        const userId = message.author.id;
        const username = message.author.username;
        const topic = args.join(' ').toLowerCase().trim();

        if (!topic) {
            return message.reply('Mohon sertakan topik belajar yang Anda cari. Contoh: `!cari-kelompok JavaScript`');
        }

        // Hapus permintaan lama dari user yang sama untuk topik ini jika ada
        studyGroupManager.removeUserRequest(guildId, userId, topic);

        // Cari permintaan yang cocok
        let matchedRequest = studyGroupManager.findAndRemoveMatch(guildId, userId, topic);

        if (matchedRequest) {
            const matchedUser = await client.users.fetch(matchedRequest.userId);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🎉 Kelompok Belajar Ditemukan! 🎉')
                .setDescription(`Anda (${message.author.toString()}) telah menemukan teman belajar untuk topik **"${topic}"**: ${matchedUser.toString()}!\n\n` +
                                `Silakan diskusikan lebih lanjut di Voice Channel Umum atau buat thread baru!`)
                .setFooter({ text: 'Bot RPL 1 - Semangat Belajar!' })
                .setTimestamp();

            await message.channel.send({ content: `${message.author.toString()} ${matchedUser.toString()}`, embeds: [embed] });

        } else {
            // Simpan permintaan jika tidak ada yang cocok
            studyGroupManager.addRequest(guildId, userId, topic, message.id, message.channel.id);

            const embed = new EmbedBuilder()
                .setColor(0xFFA500)
                .setTitle('⏳ Permintaan Kelompok Belajar Dibuat ⏳')
                .setDescription(`Anda (${message.author.toString()}) telah membuat permintaan kelompok belajar untuk topik **"${topic}"**.\n` +
                                `Kami akan memberitahu Anda jika ada teman yang mencari topik yang sama.\n\n` +
                                `Anda bisa melihat permintaan aktif dengan \`${config.general.prefix}daftar-kelompok\`.`)
                .setFooter({ text: 'Bot RPL 1 - Mohon bersabar menunggu' })
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
        }
    },
};
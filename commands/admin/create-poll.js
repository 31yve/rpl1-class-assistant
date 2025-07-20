// commands/admin/create-poll.js (Kode yang DIPERBAIKI)
const config = require('../../config.json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'poll',
    description: '[Admin/Guru] Membuat jajak pendapat (polling) dengan opsi. Penggunaan: !poll "Pertanyaan" "Opsi 1" "Opsi 2" ...',
    aliases: ['polling', 'vote'],
    adminOnly: true,
    // UBAH URUTAN ARGUMEN DI SINI: client HARUS di posisi terakhir
    async execute(message, args, client) { // <--- KODE INI YANG DIPERBAIKI
        // Cek izin administrator
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Maaf, Anda tidak memiliki izin untuk membuat polling.');
        }

        // Regex untuk mengekstrak string yang diapit kutip ganda
        const regex = /"([^"]*)"/g;
        const matches = [];
        let match;

        // Pastikan kita mencari di seluruh konten pesan, bukan hanya args
        while ((match = regex.exec(message.content)) !== null) {
            matches.push(match[1]);
        }

        if (matches.length < 2) { // Minimal 1 pertanyaan dan 1 opsi
            return message.reply(`Penggunaan: \`${config.general.prefix}poll "Pertanyaan Anda?" "Opsi 1" "Opsi 2"\`\nMinimal 1 pertanyaan dan 1 opsi. Maksimal 9 opsi.`);
        }

        const question = matches[0];
        const options = matches.slice(1);

        if (options.length > config.poll_emojis.length) {
            return message.reply(`Maksimal ${config.poll_emojis.length} opsi polling yang didukung.`);
        }

        let description = '';
        for (let i = 0; i < options.length; i++) {
            description += `${config.poll_emojis[i]} ${options[i]}\n`;
        }

        const pollEmbed = new EmbedBuilder()
            .setColor(0x00BFFF) // Warna biru muda
            .setTitle(`📊 Polling: ${question}`)
            .setDescription(description)
            .setFooter({ text: `Polling dibuat oleh ${message.author.username}` })
            .setTimestamp();

        try {
            // Dapatkan channel pengumuman penting
            // client.channels sudah seharusnya terdefinisi dengan urutan argumen yang benar
            const announcementChannel = await client.channels.fetch(config.general.announcement_channel_id);

            if (!announcementChannel) {
                return message.reply('Channel pengumuman penting tidak ditemukan. Pastikan ID channel di config.json sudah benar.');
            }
            if (!announcementChannel.isTextBased()) {
                return message.reply('Channel yang diatur untuk pengumuman penting bukan channel teks.');
            }

            const pollMessage = await announcementChannel.send({ embeds: [pollEmbed] }); // Kirim ke channel pengumuman

            // Tambahkan reaksi emoji untuk setiap opsi
            for (let i = 0; i < options.length; i++) {
                await pollMessage.react(config.poll_emojis[i]);
            }
            await message.delete(); // Hapus pesan perintah asli

            // Beri tahu pengguna bahwa polling telah dibuat di channel pengumuman
            message.channel.send(`Polling berhasil dibuat di <#${config.general.announcement_channel_id}>!`);

        } catch (error) {
            console.error('Gagal membuat polling:', error);
            message.reply('Terjadi kesalahan saat membuat polling. Pastikan bot memiliki izin untuk mengirim pesan dan menambahkan reaksi di channel pengumuman.');
        }
    },
};
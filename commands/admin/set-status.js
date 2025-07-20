// commands/admin/set-status.js
const config = require('../../config.json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'set-status',
    description: '[Admin] Mengubah status dan aktivitas bot. Contoh: !set-status online "Bermain Game"\nType: PLAYING, LISTENING, WATCHING, COMPETING',
    aliases: ['status-bot-cmd', 'ubah-status'],
    adminOnly: true, // Hanya admin yang bisa menggunakan perintah ini
    async execute(message, args, client) {
        // Cek izin administrator
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Maaf, Anda tidak memiliki izin untuk menggunakan perintah ini.');
        }

        if (args.length < 1) {
            return message.reply(`Penggunaan: \`${config.general.prefix}set-status <online|idle|dnd|invisible> [type] ["aktivitas"]\`\nContoh:\n\`!set-status online PLAYING "Membantu RPL 1"\`\n\`!set-status dnd WATCHING "debugging kode"\``);
        }

        const newStatus = args[0].toLowerCase();
        // Validasi status
        if (!['online', 'idle', 'dnd', 'invisible'].includes(newStatus)) {
            return message.reply('Status tidak valid. Gunakan `online`, `idle`, `dnd`, atau `invisible`.');
        }

        let activityType = null;
        let activityName = null;
        let activityUrl = null; // Untuk streaming

        if (args.length >= 2) {
            const typeString = args[1].toUpperCase();
            // Validasi tipe aktivitas
            const validActivityTypes = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'COMPETING'];
            if (!validActivityTypes.includes(typeString)) {
                return message.reply(`Tipe aktivitas tidak valid. Gunakan ${validActivityTypes.join(', ')}.`);
            }
            activityType = typeString;

            if (args.length >= 3) {
                activityName = args.slice(2).join(' ').replace(/"/g, ''); // Ambil teks aktivitas, hapus tanda kutip
            }
            
            // Khusus untuk STREAMING, coba ambil URL jika ada
            if (activityType === 'STREAMING' && activityName && activityName.startsWith('http')) {
                const urlMatch = activityName.match(/(https?:\/\/[^\s]+)/);
                if (urlMatch) {
                    activityUrl = urlMatch[0];
                    activityName = activityName.replace(urlMatch[0], '').trim(); // Hapus URL dari nama
                }
            }
        }

        try {
            const presenceOptions = { status: newStatus };

            if (activityName && activityType) {
                const activityOptions = { name: activityName, type: activityType };
                if (activityType === 'STREAMING' && activityUrl) {
                    activityOptions.url = activityUrl;
                }
                presenceOptions.activities = [activityOptions];
            } else if (activityType) { // Jika hanya type tapi tidak ada nama, kosongkan aktivitas
                presenceOptions.activities = []; 
            } else { // Jika tidak ada aktivitas yang ditentukan, hapus aktivitas lama
                presenceOptions.activities = client.user.presence.activities.map(a => ({ name: a.name, type: a.type, url: a.url }));
            }
            
            await client.user.setPresence(presenceOptions);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00) // Hijau
                .setTitle('✅ Status Bot Berhasil Diubah!')
                .addFields(
                    { name: 'Status Online', value: `\`${newStatus.toUpperCase()}\``, inline: true }
                );
            if (activityName) {
                embed.addFields(
                    { name: 'Aktivitas', value: `\`${activityType.toUpperCase()}\` ${activityName}`, inline: false }
                );
                if (activityUrl) {
                    embed.addFields({ name: 'URL Streaming', value: `[${activityUrl}](${activityUrl})`, inline: false });
                }
            } else if (activityType) {
                embed.addFields({ name: 'Aktivitas', value: `\`${activityType.toUpperCase()}\` (Kosong)`, inline: false });
            } else {
                 embed.addFields({ name: 'Aktivitas', value: `Tidak ada aktivitas yang diatur.`, inline: false });
            }
            
            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Gagal mengubah status bot:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Gagal Mengubah Status Bot')
                .setDescription(`Terjadi kesalahan saat mengubah status: ${error.message}`);
            await message.channel.send({ embeds: [errorEmbed] });
        }
        await message.delete(); // Hapus pesan perintah admin
    },
};
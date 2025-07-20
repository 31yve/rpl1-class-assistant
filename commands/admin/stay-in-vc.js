// commands/admin/stay-in-vc.js
const config = require('../../config.json');
const persistentVCManager = require('../../utils/persistentVCManager');
const musicPlayer = require('../../utils/musicPlayer');
const { EmbedBuilder } = require('discord.js');
const { VoiceConnectionStatus } = require('@discordjs/voice'); // Import VoiceConnectionStatus

module.exports = {
    name: 'stay-in-vc',
    description: '[Admin] Mengatur bot untuk tetap berada di voice channel tertentu 24/7.',
    usage: '[channel_id | "none"]', // Gunakan "none" untuk menghapus pengaturan
    aliases: ['24/7', 'set-24/7'],
    adminOnly: true, // Asumsikan Anda memiliki logic adminOnly di index.js atau messageCreate.js
    async execute(message, args, client) {
        // Cek izin administrator (opsional, jika Anda sudah punya cek adminOnly di tempat lain)
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Maaf, Anda tidak memiliki izin untuk menggunakan perintah ini.');
        }

        const guildId = message.guild.id;
        let channelId = args[0];

        // --- Hapus Pengaturan Persisten ---
        if (channelId && channelId.toLowerCase() === 'none') {
            if (persistentVCManager.removePersistentVC(guildId)) {
                // Jika bot sedang di VC, suruh keluar
                const manager = musicPlayer.getMusicManager(guildId);
                if (manager && manager.connection && manager.connection.state.status !== VoiceConnectionStatus.Destroyed) {
                    musicPlayer.stop(guildId); // Ini akan menghancurkan koneksi dan membersihkan manajer
                }
                return message.channel.send('✅ Bot tidak akan lagi menetap di voice channel 24/7 untuk server ini.');
            } else {
                return message.reply('Bot tidak diatur untuk tetap berada di voice channel 24/7.');
            }
        }

        // --- Atur Voice Channel Persisten ---
        let voiceChannel;
        if (channelId) {
            // Coba ambil channel berdasarkan ID
            voiceChannel = message.guild.channels.cache.get(channelId);
            if (!voiceChannel || voiceChannel.type !== 2) { // 2 = GUILD_VOICE
                return message.reply('ID channel tidak valid atau bukan voice channel.');
            }
        } else {
            // Jika tidak ada ID, gunakan voice channel tempat admin berada
            voiceChannel = message.member.voice.channel;
            if (!voiceChannel) {
                return message.reply('Anda harus berada di voice channel atau memberikan ID voice channel.');
            }
        }

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return message.reply('Saya tidak punya izin untuk bergabung atau berbicara di voice channel ini!');
        }

        persistentVCManager.setPersistentVC(guildId, voiceChannel.id);

        try {
            musicPlayer.joinChannel(voiceChannel); // Coba bergabung segera
            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setDescription(`✅ Bot akan tetap berada di *voice channel* **${voiceChannel.name}** 24/7.`);
            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('[24/7 VC] Gagal membuat bot tetap di VC:', error);
            message.reply('Terjadi kesalahan saat mencoba membuat bot tetap di voice channel.');
        }
        // Opsional: Hapus pesan perintah admin agar rapi
        // await message.delete(); 
    },
};
// events/ready.js
const reminderManager = require('../utils/reminderManager');
const config = require('../config.json');
const persistentVCManager = require('../utils/persistentVCManager'); // <--- TAMBAHKAN INI
const musicPlayer = require('../utils/musicPlayer'); // <--- TAMBAHKAN INI
const { VoiceConnectionStatus, entersState } = require('@discordjs/voice'); // <--- TAMBAHKAN INI

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) { // <--- Pastikan ada 'async' di sini
        console.log(`${client.user.tag} telah online dan siap melayani kelas RPL 1!`);
        console.log('----------------------------------------------------');

        client.user.setPresence({
            activities: [{
                name: 'Membantu Siswa RPL 1',
                type: 'PLAYING'
            }],
            status: 'online'
        });

        // --- Inisialisasi Checker Pengingat ---
        setInterval(async () => {
            // Pastikan config.general.reminder_channel_name sudah ada dan benar
            const reminderChannelName = config.general.reminder_channel_name;
            if (!reminderChannelName) {
                console.warn('Nama channel pengingat tidak ditemukan di config.json.');
                return;
            }

            for (const guild of client.guilds.cache.values()) {
                const channel = guild.channels.cache.find(
                    ch => ch.name === reminderChannelName && ch.type === 0 // 0 = GUILD_TEXT
                );

                if (channel) {
                    await reminderManager.checkAndSendReminders(channel);
                } else {
                    console.warn(`Channel pengingat "${reminderChannelName}" tidak ditemukan di guild: ${guild.name}`);
                }
            }
        }, 60 * 1000); // Cek setiap 1 menit
        console.log('Checker pengingat diaktifkan.');

        // --- Inisialisasi Bot 24/7 di Voice Channel ---
        console.log('Memeriksa voice channel persisten...');
        for (const guildId of client.guilds.cache.keys()) { // Iterasi setiap guild tempat bot berada
            const persistentChannelId = persistentVCManager.getPersistentVC(guildId);
            if (persistentChannelId) {
                const guild = client.guilds.cache.get(guildId);
                if (!guild) {
                    console.warn(`[24/7 VC] Guild ${guildId} tidak ditemukan untuk VC persisten. Menghapus setting.`);
                    persistentVCManager.removePersistentVC(guildId);
                    continue;
                }
                const voiceChannel = guild.channels.cache.get(persistentChannelId);

                if (voiceChannel && voiceChannel.type === 2) { // 2 = GUILD_VOICE
                    try {
                        const connection = musicPlayer.joinChannel(voiceChannel);
                        // Tunggu sampai koneksi siap sebelum melanjutkan
                        await entersState(connection, VoiceConnectionStatus.Ready, 30_000); // Tunggu hingga 30 detik
                        console.log(`[24/7 VC] Bot berhasil bergabung kembali ke ${voiceChannel.name} di ${guild.name}`);
                    } catch (error) {
                        console.error(`[24/7 VC] Gagal bergabung kembali ke ${voiceChannel.name} di ${guild.name}:`, error);
                        persistentVCManager.removePersistentVC(guildId); // Hapus setting jika gagal bergabung
                        console.log(`[24/7 VC] Setting 24/7 untuk guild ${guild.name} dihapus karena gagal bergabung.`);
                    }
                } else {
                    console.warn(`[24/7 VC] Voice channel ID ${persistentChannelId} di guild ${guild.name} tidak valid atau bukan voice channel. Menghapus setting.`);
                    persistentVCManager.removePersistentVC(guildId);
                }
            }
        }
        console.log('Pengecekan voice channel persisten selesai.');
    },
};
// commands/admin/set-bot-profile.js
const config = require('../../config.json');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'set-profile',
    description: '[Admin] Mengubah profil bot (username atau avatar).',
    aliases: ['bot-profile', 'ubah-profil'],
    adminOnly: true, // Custom marker for permission
    async execute(message, args, client) {
        // Cek izin administrator
        if (!message.member.permissions.has('Administrator')) {
            // Atau cek peran spesifik jika Anda menggunakan ID peran dari config.json
            // const adminRoleId = config.roles.admin_role_id;
            // if (!message.member.roles.cache.has(adminRoleId)) {
            //     return message.reply('Maaf, Anda tidak memiliki izin untuk menggunakan perintah ini.');
            // }
            return message.reply('Maaf, Anda tidak memiliki izin untuk menggunakan perintah ini.');
        }

        if (args.length < 2) {
            return message.reply(`Penggunaan: \`${config.general.prefix}set-profile <username|avatar> [nilai]\`\nContoh:\n\`${config.general.prefix}set-profile username BotKelasRPLBaru\`\n\`${config.general.prefix}set-profile avatar https://link-gambar-anda.com/gambar.png\``);
        }

        const subCommand = args[0].toLowerCase();
        const value = args.slice(1).join(' ');

        try {
            if (subCommand === 'username') {
                if (value.length < 2 || value.length > 32) {
                    return message.reply('Username harus antara 2 hingga 32 karakter.');
                }
                await client.user.setUsername(value);
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00) // Hijau
                    .setDescription(`✅ Username bot berhasil diubah menjadi **${value}**.`);
                await message.channel.send({ embeds: [embed] });
            } else if (subCommand === 'avatar') {
                // Validasi URL sederhana
                if (!value.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)) {
                    return message.reply('Mohon berikan URL gambar yang valid (JPG, PNG, GIF, WebP).');
                }
                await client.user.setAvatar(value);
                const embed = new EmbedBuilder()
                    .setColor(0x00FF00) // Hijau
                    .setDescription(`✅ Avatar bot berhasil diubah!`)
                    .setThumbnail(value); // Tampilkan avatar baru di embed
                await message.channel.send({ embeds: [embed] });
            } else {
                return message.reply(`Sub-perintah tidak valid: \`${subCommand}\`. Gunakan \`username\` atau \`avatar\`.`);
            }
        } catch (error) {
            console.error(`Gagal mengubah profil bot (${subCommand}):`, error);
            let errorMessage = 'Terjadi kesalahan saat mencoba mengubah profil bot.';

            // Penanganan error spesifik dari Discord API
            if (error.code === 50001) { // Missing Access
                errorMessage = 'Bot tidak memiliki izin untuk mengubah profilnya. Pastikan peran bot ada di atas peran lain dan memiliki izin yang cukup.';
            } else if (error.code === 50035 || error.message.includes('Invalid Form Body')) {
                errorMessage = 'Format input tidak valid (misalnya, URL avatar rusak atau username terlalu panjang/pendek).';
            } else if (error.message.includes('You are being rate limited.')) {
                errorMessage = 'Terlalu banyak permintaan. Coba lagi nanti (Discord memiliki batasan perubahan profil).';
            }
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000) // Merah
                .setTitle('❌ Gagal Mengubah Profil Bot')
                .setDescription(errorMessage);
            await message.channel.send({ embeds: [errorEmbed] });
        }
        await message.delete(); // Hapus pesan perintah admin
    },
};
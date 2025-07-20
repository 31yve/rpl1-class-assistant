// commands/admin/umumkan.js
const config = require('../../config.json');

module.exports = {
    name: 'umumkan',
    description: '[Admin/Guru] Mengirim pengumuman ke channel #pengumuman-penting.',
    adminOnly: true, // Custom marker for permission
    async execute(message, args) {
        // Option 1: Check for Administrator permission
        if (!message.member.permissions.has('Administrator')) {
            // Option 2: Check for specific role ID (e.g., Teacher Role)
            // const teacherRoleId = config.roles.teacher_role_id;
            // if (!message.member.roles.cache.has(teacherRoleId)) {
            //     return message.channel.send('Maaf, Anda tidak memiliki izin untuk menggunakan perintah ini. Hanya Guru atau Admin yang bisa mengumumkan.');
            // }

            return message.channel.send('Maaf, Anda tidak memiliki izin untuk menggunakan perintah ini.');
        }

        const announcementMessage = args.join(' ');
        if (!announcementMessage) {
            return message.channel.send(`Sertakan pesan yang ingin Anda umumkan. Contoh: \`${config.general.prefix}umumkan Hari ini tidak ada pelajaran.\``);
        }

        const announcementChannelName = config.general.announcement_channel_name;
        const announcementChannel = message.guild.channels.cache.find(channel => channel.name === announcementChannelName);
        if (announcementChannel) {
            await announcementChannel.send(`**PENGUMUMAN PENTING DARI ${message.author.toString()}:**\n\n${announcementMessage}`);
            await message.channel.send('Pengumuman berhasil dikirim!');
        } else {
            await message.channel.send(`Channel #${announcementChannelName} tidak ditemukan.`);
        }
        await message.delete();
    },
};
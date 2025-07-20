// commands/admin/set-reminder.js
const config = require('../../config.json');
const reminderManager = require('../../utils/reminderManager');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone'); // Untuk parsing tanggal/waktu

module.exports = {
    name: 'set-pengingat',
    description: '[Admin/Guru] Mengatur pengingat untuk tanggal dan waktu tertentu. Format: YYYY-MM-DD HH:mm [pesan]',
    aliases: ['set-reminder', 'remind'],
    adminOnly: true,
    async execute(message, args) {
        // Cek izin admin/guru
        if (!message.member.permissions.has('Administrator')) {
            // Atau cek peran spesifik
            // const adminRoleId = config.roles.admin_role_id;
            // const teacherRoleId = config.roles.teacher_role_id;
            // if (!message.member.roles.cache.has(adminRoleId) && !message.member.roles.cache.has(teacherRoleId)) {
            //     return message.reply('Maaf, Anda tidak memiliki izin untuk menggunakan perintah ini.');
            // }
            return message.reply('Maaf, Anda tidak memiliki izin untuk menggunakan perintah ini.');
        }

        if (args.length < 3) {
            return message.reply(`Format penggunaan: \`${config.general.prefix}set-pengingat YYYY-MM-DD HH:mm [pesan pengingat]\`\nContoh: \`${config.general.prefix}set-pengingat 2025-07-25 10:00 Ujian Pemrograman Dasar\``);
        }

        const dateTimeString = `${args[0]} ${args[1]}`; // YYYY-MM-DD HH:mm
        const reminderMessage = args.slice(2).join(' ');

        // Gunakan moment-timezone untuk parsing dan memastikan zona waktu
        // Asumsi zona waktu server Discord atau bot adalah WIB (Asia/Jakarta)
        const reminderTime = moment.tz(dateTimeString, 'YYYY-MM-DD HH:mm', 'Asia/Jakarta');

        if (!reminderTime.isValid()) {
            return message.reply('Format tanggal atau waktu tidak valid. Gunakan YYYY-MM-DD HH:mm.');
        }

        if (reminderTime.isBefore(moment())) {
            return message.reply('Anda tidak bisa mengatur pengingat untuk waktu di masa lalu.');
        }

        const reminderChannelName = config.general.reminder_channel_name;
        const reminderChannel = message.guild.channels.cache.find(channel => channel.name === reminderChannelName);

        if (!reminderChannel) {
            return message.reply(`Channel pengingat dengan nama \`#${reminderChannelName}\` tidak ditemukan di server ini. Mohon periksa konfigurasi.`);
        }

        const newReminder = reminderManager.addReminder(
            message.guild.id,
            reminderTime.valueOf(), // Simpan sebagai timestamp milidetik
            reminderMessage,
            reminderChannel.id
        );

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('✅ Pengingat Berhasil Dibuat')
            .setDescription(`Pengingat akan dikirim pada:\n**${reminderTime.format('DD MMMM YYYY [pukul] HH:mm [WIB]')}**\n\nKe channel: <#${reminderChannel.id}>\nDengan pesan: \`${reminderMessage}\``)
            .setFooter({ text: `ID Pengingat: ${newReminder.id}` })
            .setTimestamp();

        await message.channel.send({ embeds: [embed] });
    },
};
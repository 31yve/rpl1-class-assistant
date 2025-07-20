// commands/admin/list-reminders.js
const config = require('../../config.json');
const reminderManager = require('../../utils/reminderManager');
const { EmbedBuilder } = require('discord.js');
const moment = require('moment-timezone');

module.exports = {
    name: 'daftar-pengingat',
    description: '[Admin/Guru] Menampilkan daftar pengingat yang aktif.',
    aliases: ['list-reminders', 'show-reminders'],
    adminOnly: true,
    async execute(message, args) {
        // Cek izin admin/guru
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('Maaf, Anda tidak memiliki izin untuk menggunakan perintah ini.');
        }

        const guildId = message.guild.id;
        const activeReminders = reminderManager.getReminders(guildId);

        const embed = new EmbedBuilder()
            .setColor(0x8A2BE2) // Biru Keunguan
            .setTitle('⏰ Daftar Pengingat Aktif ⏰')
            .setDescription('Berikut adalah pengingat yang telah dijadwalkan:')
            .setFooter({ text: 'Bot RPL 1 Pengingat' })
            .setTimestamp();

        if (activeReminders.length === 0) {
            embed.setDescription('Tidak ada pengingat aktif saat ini.');
        } else {
            let reminderList = '';
            // Urutkan berdasarkan waktu terdekat
            activeReminders.sort((a, b) => a.timestamp - b.timestamp);

            for (const reminder of activeReminders) {
                const reminderTime = moment.tz(reminder.timestamp, 'Asia/Jakarta');
                const channel = message.guild.channels.cache.get(reminder.channelId);
                const channelMention = channel ? `<#${channel.id}>` : `\`#${reminder.channelId} (Tidak ditemukan)\``;

                reminderList += `**ID:** \`${reminder.id.substring(0, 8)}...\`\n` +
                                `**Waktu:** ${reminderTime.format('DD MMM YYYY, HH:mm [WIB]')}\n` +
                                `**Channel:** ${channelMention}\n` +
                                `**Pesan:** \`${reminder.message}\`\n\n`;
            }
            embed.setDescription(reminderList);
        }

        await message.channel.send({ embeds: [embed] });
    },
};
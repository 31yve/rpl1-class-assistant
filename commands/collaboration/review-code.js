// commands/collaboration/review-code.js
const config = require('../../config.json');

module.exports = {
    name: 'review-code',
    description: 'Meminta review untuk kode Anda. Contoh: !review-code <link_repo_atau_file> [pesan_tambahan]',
    async execute(message, args) {
        if (args.length < 1) {
            return message.reply('Mohon sertakan link ke kode yang ingin direview. Contoh: `!review-code https://github.com/user/repo/file.js Tolong cek bagian ini.`');
        }

        const codeLink = args[0];
        const additionalMessage = args.slice(1).join(' ');

        const reviewChannelName = config.general.code_review_channel_name;
        const reviewChannel = message.guild.channels.cache.find(channel => channel.name === reviewChannelName);

        if (!reviewChannel) {
            return message.reply(`Channel #${reviewChannelName} tidak ditemukan. Mohon konfigurasikan nama channel yang benar di config.json.`);
        }

        // Mendapatkan roles untuk ping
        const mentorRole = message.guild.roles.cache.get(config.roles.mentor_role_id);
        const teacherRole = message.guild.roles.cache.get(config.roles.teacher_role_id);

        let pingRoles = '';
        if (mentorRole) pingRoles += `${mentorRole.toString()} `;
        if (teacherRole) pingRoles += `${teacherRole.toString()}`;

        const embed = {
            color: 0x0099ff, // Warna biru
            title: 'Permintaan Code Review Baru!',
            description: `**Dari:** ${message.author.toString()}\n\n**Link Kode:** ${codeLink}\n\n${additionalMessage ? `**Pesan:** ${additionalMessage}` : ''}\n\n${pingRoles ? `*${pingRoles} Dimohon untuk review.*` : 'Dimohon untuk review.'}`,
            timestamp: new Date(),
            footer: {
                text: 'Bot RPL 1',
            },
        };

        await reviewChannel.send({ embeds: [embed] });
        await message.reply('Permintaan review kode Anda telah dikirim!');
        await message.delete(); // Hapus pesan perintah asli
    },
};
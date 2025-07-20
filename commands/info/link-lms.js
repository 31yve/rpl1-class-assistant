// commands/info/link-lms.js
const config = require('../../config.json');

module.exports = {
    name: 'link-lms',
    description: 'Menampilkan link ke Learning Management System (LMS) kelas.',
    async execute(message, args) {
        const lmsInfo = config.info_commands.link_lms;
        await message.channel.send(lmsInfo.description);
    },
};
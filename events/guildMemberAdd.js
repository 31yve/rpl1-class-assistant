// events/guildMemberAdd.js
const config = require('../config.json');
const { EmbedBuilder } = require('discord.js'); // Import EmbedBuilder

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const welcomeChannelName = config.general.welcome_channel_name;
        const announcementChannelName = config.general.announcement_channel_name;
        const discussionChannelName = config.general.main_discussion_channel_name;
        const rulesChannelName = config.general.rules_channel_name;

        const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === welcomeChannelName);

        if (welcomeChannel) {
            const announcementChannel = member.guild.channels.cache.find(channel => channel.name === announcementChannelName);
            const discussionChannel = member.guild.channels.cache.find(channel => channel.name === discussionChannelName);
            const rulesChannel = member.guild.channels.cache.find(channel => channel.name === rulesChannelName);

            let welcomeText = config.welcome_message.text;
            welcomeText = welcomeText.replace('{member.mention}', member.toString());
            welcomeText = welcomeText.replace('{rules_channel}', rulesChannel ? rulesChannel.id : 'rules');
            welcomeText = welcomeText.replace('{announcement_channel}', announcementChannel ? announcementChannel.id : 'pengumuman-penting');
            welcomeText = welcomeText.replace('{discussion_channel}', discussionChannel ? discussionChannel.id : 'diskusi-umum-pelajaran');

            // Optionally use an Embed for welcome message
            const welcomeEmbed = new EmbedBuilder()
                .setColor(0x00FF00) // Green
                .setTitle(`Selamat Datang, ${member.user.username}!`)
                .setDescription(welcomeText)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setTimestamp()
                .setFooter({ text: 'Bot RPL 1' });

            await welcomeChannel.send({ embeds: [welcomeEmbed] });
        }
        console.log(`${member.user.tag} bergabung ke server.`);
    },
};
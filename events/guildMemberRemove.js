// events/guildMemberRemove.js
const config = require('../config.json');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        const welcomeChannelName = config.general.welcome_channel_name;
        const welcomeChannel = member.guild.channels.cache.find(channel => channel.name === welcomeChannelName);
        if (welcomeChannel) {
            let goodbyeText = config.goodbye_message.text;
            goodbyeText = goodbyeText.replace('{member.tag}', member.user.tag);
            await welcomeChannel.send(goodbyeText);
        }
        console.log(`${member.user.tag} meninggalkan server.`);
    },
};
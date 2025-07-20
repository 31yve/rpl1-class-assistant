// commands/info/sumber-daya.js
const config = require('../../config.json');

module.exports = {
    name: 'sumber-daya',
    description: 'Menampilkan link ke sumber daya belajar.',
    async execute(message, args) {
        const resourcesInfo = config.info_commands.sumber_daya;
        const resourcesChannelName = config.general.resources_channel_name;
        const resourcesChannel = message.guild.channels.cache.find(channel => channel.name === resourcesChannelName);
        const channelLink = resourcesChannel ? `<#${resourcesChannel.id}>` : `\`#${resourcesChannelName}\``;

        await message.channel.send(`${resourcesInfo.title}\n${resourcesInfo.description}\nCek juga ${channelLink} untuk lebih banyak lagi!`);
    },
};
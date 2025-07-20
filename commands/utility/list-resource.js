// commands/utility/list-resource.js
const config = require('../../config.json');
const resourceManager = require('../../utils/resourceManager');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'list-resource',
    description: 'Menampilkan daftar semua kategori resource atau resource dalam kategori tertentu.',
    usage: '[kategori_nama]',
    aliases: ['ls-resource', 'show-resource'],
    async execute(message, args) {
        if (args.length === 0) {
            // Tampilkan semua kategori
            const categories = resourceManager.getAllCategories();
            const embed = new EmbedBuilder()
                .setColor(0xFFA500) // Oranye
                .setTitle('🗂️ Kategori Resource yang Tersedia')
                .setDescription('Berikut adalah kategori resource yang dapat Anda jelajahi:\n\n')
                .setFooter({ text: `Gunakan ${config.general.prefix}list-resource <kategori> untuk melihat isinya.` })
                .setTimestamp();
            
            if (categories.length === 0) {
                embed.setDescription('Belum ada kategori resource yang ditambahkan.');
            } else {
                embed.setDescription(categories.map(cat => `\`${cat}\``).join(', '));
            }
            await message.channel.send({ embeds: [embed] });

        } else {
            // Tampilkan resource dalam kategori spesifik
            const category = args[0].toLowerCase();
            const results = resourceManager.getResourcesByCategory(category);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00) // Hijau
                .setTitle(`📚 Resource dalam Kategori "${category}"`)
                .setFooter({ text: 'Bot RPL 1 Resource Manager' })
                .setTimestamp();

            if (results.length === 0) {
                embed.setDescription(`Tidak ada resource ditemukan dalam kategori \`${category}\`.`);
            } else {
                let description = '';
                for (let i = 0; i < Math.min(results.length, 10); i++) {
                    const res = results[i];
                    description += `**${i + 1}. ${res.name}**\n` +
                                   `   [Link](${res.link})\n` +
                                   `   Tags: \`${res.tags.join(', ') || 'Tidak ada'}\`\n\n`;
                }
                if (results.length > 10) {
                    description += `... dan ${results.length - 10} resource lainnya.`;
                }
                embed.setDescription(description);
            }
            await message.channel.send({ embeds: [embed] });
        }
    },
};
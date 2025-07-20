// commands/utility/add-resource.js
const config = require('../../config.json');
const resourceManager = require('../../utils/resourceManager');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tambah-resource',
    description: 'Menambahkan link sumber daya baru.',
    usage: '<nama_resource> <link> <kategori> [tag1,tag2,...]',
    aliases: ['add-resource', 'simpan-resource'],
    async execute(message, args) {
        if (args.length < 3) {
            return message.reply(`Penggunaan: \`${config.general.prefix}tambah-resource <nama_resource> <link> <kategori> [tag1,tag2,...]\`\nContoh: \`${config.general.prefix}tambah-resource "Tutorial JS Pemula" https://dev.to/js_beginners JavaScript frontend,tutorial\``);
        }

        const name = args[0];
        const link = args[1];
        const category = args[2];
        const tags = args.slice(3).join(' ').split(',').map(tag => tag.trim()).filter(tag => tag !== '');

        // Validasi link sederhana
        if (!link.match(/^https?:\/\/.+/)) {
            return message.reply('Link yang diberikan tidak valid. Mohon sertakan URL lengkap (misalnya https://example.com).');
        }

        try {
            const newResource = resourceManager.addResource(name, link, category, tags, message.author.id);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00) // Hijau
                .setTitle('✅ Resource Berhasil Ditambahkan!')
                .setDescription(`**Nama:** ${newResource.name}\n**Link:** [Klik di sini](${newResource.link})\n**Kategori:** ${newResource.category}\n**Tags:** ${newResource.tags.length > 0 ? newResource.tags.join(', ') : 'Tidak ada'}`)
                .setFooter({ text: `Ditambahkan oleh ${message.author.username} | ID: ${newResource.id.substring(0, 8)}...` })
                .setTimestamp();

            await message.channel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Gagal menambahkan resource:', error);
            message.reply('Terjadi kesalahan saat menambahkan resource. Mohon coba lagi nanti.');
        }
    },
};
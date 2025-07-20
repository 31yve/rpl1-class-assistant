// commands/slash/ping.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    // Properti 'data' mendefinisikan struktur slash command.
    // Ini yang akan dikirim ke Discord API saat deploy.
    data: new SlashCommandBuilder()
        .setName('ping') // Nama perintah slash (harus huruf kecil, tanpa spasi)
        .setDescription('Membalas dengan Pong!'), // Deskripsi yang muncul di Discord untuk slash command
    
    // === Bagian untuk Prefix Command ===
    // Properti 'name', 'description', dan 'usage' ini digunakan oleh loader perintah
    // di index.js untuk perintah berbasis prefix (!).
    name: 'ping', // Nama perintah prefix (harus huruf kecil, tanpa spasi)
    description: 'Membalas dengan Pong!', // Deskripsi untuk perintah prefix
    usage: '', // Contoh penggunaan untuk perintah prefix (kosong jika tidak ada argumen)
    // ==================================
    
    // Fungsi 'execute' adalah apa yang dijalankan saat command dipanggil.
    // Ia dirancang untuk menangani baik 'interaction' (untuk slash command)
    // maupun 'message' (untuk prefix command).
    async execute(interactionOrMessage, argsForPrefix, client) { 
        // Periksa apakah objek yang diterima adalah Interaction (dari slash command)
        if (interactionOrMessage.isChatInputCommand) {
            // Jika ini Slash Command, gunakan interaction.reply()
            await interactionOrMessage.reply({ content: 'Pong!', ephemeral: false }); // ephemeral: false berarti balasan terlihat oleh semua orang
        } else {
            // Jika ini Prefix Command, gunakan message.channel.send()
            await interactionOrMessage.channel.send('Pong!');
        }
    },
};
// commands/utility/run-code.js
const config = require('../../config.json');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios'); // Import axios

module.exports = {
    name: 'run',
    description: 'Mengeksekusi kode dalam berbagai bahasa. Penggunaan: !run <bahasa> ```kode```',
    aliases: ['exec', 'execute'],
    async execute(message, args) {
        if (args.length < 2) {
            return message.reply(`Penggunaan: \`${config.general.prefix}run <bahasa> \`\`\`kode\`\`\`\nContoh: \`${config.general.prefix}run python \`\`\`print("Hello RPL!")\`\`\`\nBahasa yang didukung: ${config.code_executor.supported_languages_info}`);
        }

        const language = args[0].toLowerCase();
        const codeBlockMatch = message.content.match(/```(?:\w+)?\n([\s\S]*?)\n```/);

        if (!codeBlockMatch) {
            return message.reply('Mohon sertakan kode Anda dalam format code block (tiga backtick sebelum dan sesudah kode).');
        }

        const code = codeBlockMatch[1]; // Ambil isi kode dari code block

        // Opsional: Cek apakah bahasa didukung jika Anda memiliki daftar putih
        // if (!config.code_executor.supported_languages_info.split(', ').includes(language)) {
        //     return message.reply(`Bahasa "${language}" tidak didukung atau salah ketik. Bahasa yang didukung: ${config.code_executor.supported_languages_info}`);
        // }

        const embed = new EmbedBuilder()
            .setColor(0x00BFFF) // Biru Muda
            .setTitle(`🚀 Menjalankan Kode ${language.toUpperCase()}...`)
            .setDescription('Mohon tunggu, bot sedang mengeksekusi kode Anda.')
            .setTimestamp()
            .setFooter({ text: 'Bot RPL 1 Code Executor | Powered by Piston API' });

        const loadingMessage = await message.channel.send({ embeds: [embed] });

        try {
            const response = await axios.post(config.code_executor.piston_api_url, {
                language: language,
                version: '*', // Menggunakan versi terbaru yang tersedia untuk bahasa tersebut
                files: [{ content: code }]
            }, {
                timeout: 10000 // Timeout 10 detik
            });

            const result = response.data;
            let output = 'Tidak ada output.';
            let errorOccurred = false;

            if (result.run && result.run.stdout) {
                output = result.run.stdout;
            } else if (result.compile && result.compile.stderr) {
                output = result.compile.stderr;
                errorOccurred = true;
            } else if (result.run && result.run.stderr) {
                output = result.run.stderr;
                errorOccurred = true;
            } else if (result.message) { // Piston API error message
                output = result.message;
                errorOccurred = true;
            }

            if (output.length > 1024) { // Batasan field value di Discord Embed
                output = output.substring(0, 1000) + '\n... (output terlalu panjang)';
            }
            if (output.trim() === '') {
                output = 'Tidak ada output.';
            }

            const resultEmbed = new EmbedBuilder()
                .setColor(errorOccurred ? 0xFF0000 : 0x00FF00) // Merah jika ada error, hijau jika sukses
                .setTitle(errorOccurred ? `❌ Error pada ${language.toUpperCase()}` : `✅ Output ${language.toUpperCase()}`)
                .addFields(
                    { name: 'Kode Anda', value: `\`\`\`${language}\n${code.substring(0, 500)}${code.length > 500 ? '...' : ''}\n\`\`\`` },
                    { name: 'Output', value: `\`\`\`${output}\`\`\`` }
                )
                .setTimestamp()
                .setFooter({ text: 'Bot RPL 1 Code Executor | Powered by Piston API' });
            
            if (result.run && result.run.output) { // Original full output from Piston (might include both stdout/stderr)
                // Optionally add full output if it differs significantly or for debugging
            }


            await loadingMessage.edit({ embeds: [resultEmbed] }); // Edit pesan loading
            await message.delete(); // Hapus pesan perintah asli

        } catch (error) {
            console.error('Error saat eksekusi kode:', error.message);
            let errorMessage = 'Terjadi kesalahan saat mencoba mengeksekusi kode Anda. ';
            if (error.response) {
                errorMessage += `Piston API Error: ${error.response.status} - ${error.response.data.message || error.response.data}`;
            } else if (error.code === 'ECONNABORTED') {
                 errorMessage += 'Permintaan timeout. Mungkin kode Anda terlalu lama dieksekusi.';
            } else {
                errorMessage += `Detail: ${error.message}`;
            }
            
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Eksekusi Kode Gagal')
                .setDescription(errorMessage)
                .setFooter({ text: 'Bot RPL 1 Code Executor' })
                .setTimestamp();
            await loadingMessage.edit({ embeds: [errorEmbed] });
            await message.delete();
        }
    },
};
// deploy-commands.js
require('dotenv').config(); // Memuat variabel lingkungan
const { REST, Routes } = require('discord.js'); // Mengimpor kelas yang dibutuhkan
const fs = require('node:fs');
const path = require('node:path');

// Ambil CLIENT_ID dan GUILD_ID dari .env atau langsung masukkan
const CLIENT_ID = process.env.CLIENT_ID;
// GANTI 'YOUR_GUILD_ID' dengan ID server Discord Anda.
// Aktifkan Developer Mode di Discord (User Settings -> Advanced), lalu klik kanan server -> Copy ID.
const GUILD_ID = 'GANTI UID SERVER'; 

const commands = [];
// Ambil semua folder command dari direktori commands (info, admin, slash, dll.)
const commandsFolder = path.join(__dirname, 'commands');
const commandCategories = fs.readdirSync(commandsFolder);

for (const category of commandCategories) {
    const categoryPath = path.join(commandsFolder, category);
    if (fs.lstatSync(categoryPath).isDirectory()) {
        // Hanya ambil file dari sub-folder 'slash' untuk deployment slash commands
        if (category === 'slash') { // Pastikan hanya memproses folder 'slash'
            const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(path.join(categoryPath, file));
                // Pastikan command memiliki properti 'data' (dari SlashCommandBuilder) dan 'execute'
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON()); // Ubah data builder menjadi JSON
                } else {
                    console.log(`[WARNING] Perintah di ${path.join(categoryPath, file)} tidak memiliki properti "data" atau "execute" yang diperlukan.`);
                }
            }
        }
    }
}

// REST (Representational State Transfer) untuk berinteraksi dengan Discord API
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// (async) IIFE - Immediately Invoked Function Expression
(async () => {
    try {
        console.log(`Memulai pendaftaran ${commands.length} perintah aplikasi (/).`);

        // Ada dua cara mendaftarkan perintah:

        // 1. Pendaftaran Per GUILD (Disarankan untuk pengembangan - menyebar instan ke guild tertentu)
        // GANTI 'GUILD_ID' dengan ID server Anda
        const data = await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), 
            { body: commands },
        );

        // 2. Pendaftaran GLOBAL (Disarankan untuk production - butuh waktu ~1 jam untuk disebarkan ke semua server)
        // const data = await rest.put(
        //     Routes.applicationCommands(CLIENT_ID), 
        //     { body: commands },
        // );

        console.log(`Berhasil mendaftarkan ${data.length} perintah aplikasi.`);
    } catch (error) {
        console.error(error);
    }
})();

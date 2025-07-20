// index.js (MODIFIKASI: Log Pemuatan Lebih Detail)
require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const config = require('./config.json');

const TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent, // Pastikan ini ON di Developer Portal juga!
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates
    ],
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember]
});

client.commands = new Collection(); // Untuk perintah prefix (!)
client.slashCommands = new Collection(); // Untuk perintah slash (/)


// --- Memuat Perintah dari Folder 'commands' ---
const commandsFolder = path.join(__dirname, 'commands');
const commandCategories = fs.readdirSync(commandsFolder);

console.log('[DEBUG - Loader] Memulai pemuatan perintah...');
console.log(`[DEBUG - Loader] Kategori perintah ditemukan: ${commandCategories.join(', ')}`);

for (const category of commandCategories) {
    const categoryPath = path.join(commandsFolder, category);
    if (fs.lstatSync(categoryPath).isDirectory()) {
        console.log(`[DEBUG - Loader] Memproses kategori: ${category}`);
        const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
        
        if (commandFiles.length === 0) {
            console.log(`[DEBUG - Loader] Tidak ada file .js ditemukan di kategori: ${category}`);
        }

        for (const file of commandFiles) {
            const fullPath = path.join(categoryPath, file);
            console.log(`[DEBUG - Loader] Mencoba memuat file: ${file} dari ${category}`);
            try {
                const command = require(fullPath);
                command.filePath = fullPath; // Simpan path file untuk debugging

                // Jika command memiliki properti 'data' (untuk Slash Command)
                if ('data' in command && 'execute' in command) {
                    client.slashCommands.set(command.data.name, command);
                    console.log(`[DEBUG - Loader] Berhasil memuat Slash Command: /${command.data.name}`);
                }
                
                // --- Simpan sebagai perintah berbasis prefix jika memiliki properti 'name' yang valid ---
                if ('name' in command && typeof command.name === 'string' && command.name.length > 0) {
                    client.commands.set(command.name, command);
                    console.log(`[DEBUG - Loader] Berhasil memuat Prefix Command: !${command.name}`);
                    
                    if (command.aliases && Array.isArray(command.aliases)) {
                        for (const alias of command.aliases) {
                            client.commands.set(alias, command);
                            console.log(`[DEBUG - Loader] Memuat alias prefix: !${alias} -> !${command.name}`);
                        }
                    }
                } else {
                    console.warn(`[WARNING - Loader] Perintah di ${file} (kategori ${category}) tidak memiliki properti 'name' yang valid atau isinya kosong. Tidak akan dimuat sebagai perintah prefix.`);
                }
            } catch (error) {
                console.error(`[ERROR - Loader] Gagal memuat file perintah ${file} dari ${category}:`, error);
            }
        }
    }
}
console.log(`[DEBUG - Loader] Selesai memuat perintah. Total Prefix Commands: ${client.commands.size}, Total Slash Commands: ${client.slashCommands.size}.`);


// --- Memuat Events dari Folder 'events' ---
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

console.log('[DEBUG - Loader] Memulai pemuatan events...');
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    console.log(`[DEBUG - Loader] Memuat event: ${event.name}`);

    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}
console.log(`[DEBUG - Loader] Selesai memuat ${eventFiles.length} event listener.`);


// --- Event Handler untuk Slash Commands ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.slashCommands.get(interaction.commandName);

    if (!command) {
        console.error(`[ERROR - Interaction] Tidak ada perintah Slash yang cocok dengan /${interaction.commandName}.`);
        return;
    }

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(`[ERROR - Interaction] Error saat menjalankan Slash Command /${interaction.commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Terjadi kesalahan saat menjalankan perintah ini!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'Terjadi kesalahan saat menjalankan perintah ini!', ephemeral: true });
        }
    }
});


client.login(TOKEN);
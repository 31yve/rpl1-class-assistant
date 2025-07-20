// events/messageCreate.js
const config = require('../config.json');
const levelSystem = require('../utils/levelSystem');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;

        // --- TAMBAHKAN LOG DEBUGGING INI ---
        console.log(`[DEBUG] Pesan diterima dari ${message.author.tag}: ${message.content}`);
        // ----------------------------------

        // --- Logika Leveling System ---
        levelSystem.addXp(message.author.id, message.guild.id);
        const userLevelData = levelSystem.getUser(message.author.id, message.guild.id);
        const nextLevelXpNeeded = levelSystem.calculateXpForLevel(userLevelData.level + 1);

        if (userLevelData.xp >= nextLevelXpNeeded) {
            levelSystem.levelUp(message.author.id, message.guild.id);
            const newLevel = levelSystem.getUser(message.author.id, message.guild.id).level;
            let levelUpMessage = config.leveling_system.level_up_message;
            levelUpMessage = levelUpMessage.replace('{member.mention}', message.author.toString());
            levelUpMessage = levelUpMessage.replace('{level}', newLevel);
            await message.channel.send(levelUpMessage);
        }

        // --- Logika Perintah Prefix ---
        const PREFIX = config.general.prefix;
        if (!message.content.startsWith(PREFIX)) {
            // Jika Anda tidak melihat log di atas menampilkan konten, masalahnya ada pada intent.
            console.log(`[DEBUG] Pesan bukan perintah atau tidak diawali prefix. Konten: ${message.content}`); // Tambah log
            return;
        }

        // Logika ini hanya akan dijalankan jika message.content dimulai dengan PREFIX
        console.log(`[DEBUG] Pesan adalah perintah: ${message.content}`); // Tambah log

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) {
            console.log(`[DEBUG] Perintah '${commandName}' tidak ditemukan.`); // Tambah log
            return;
        }

        try {
            await command.execute(message, args, client);
        } catch (error) {
            console.error(`Error saat menjalankan perintah ${commandName}:`, error);
            message.reply('Terjadi kesalahan saat menjalankan perintah itu! Silakan laporkan ke admin.');
        }
    },
};
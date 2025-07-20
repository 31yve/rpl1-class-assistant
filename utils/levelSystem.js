// utils/levelSystem.js
const fs = require('node:fs');
const path = require('node:path');
const config = require('../config.json');

const levelsFilePath = path.join(__dirname, '../data/levels.json');
let users = {};

// Load level data from file on module import
function loadLevels() {
    try {
        const data = fs.readFileSync(levelsFilePath, 'utf8');
        users = JSON.parse(data);
        console.log('Data level berhasil dimuat.');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('File levels.json tidak ditemukan, membuat file baru.');
            saveLevels();
        } else {
            console.error('Error saat memuat data level:', error);
        }
    }
}

function saveLevels() {
    try {
        fs.writeFileSync(levelsFilePath, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saat menyimpan data level:', error);
    }
}

function getUser(userId, guildId) {
    if (!users[guildId]) {
        users[guildId] = {};
    }
    if (!users[guildId][userId]) {
        users[guildId][userId] = { xp: 0, level: 0, lastMessage: 0 };
    }
    return users[guildId][userId];
}

function addXp(userId, guildId) {
    const userData = getUser(userId, guildId);
    const now = Date.now();
    const cooldown = config.leveling_system.xp_cooldown_seconds * 1000;

    if (now - userData.lastMessage < cooldown) {
        return;
    }

    const xpGain = Math.floor(Math.random() * (config.leveling_system.xp_max_per_message - config.leveling_system.xp_min_per_message + 1)) + config.leveling_system.xp_min_per_message;
    userData.xp += xpGain;
    userData.lastMessage = now;
    saveLevels();
}

function calculateXpForLevel(level) {
    if (level <= 0) return 0;
    return 500 * level; // Simple XP formula
}

function levelUp(userId, guildId) {
    const userData = getUser(userId, guildId);
    userData.level += 1;
    saveLevels();
}

function getAllUsersInGuild(guildId) {
    return users[guildId] || {};
}

loadLevels(); // Call on module load

module.exports = {
    getUser,
    addXp,
    calculateXpForLevel,
    levelUp,
    getAllUsersInGuild,
};
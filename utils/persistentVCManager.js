// utils/persistentVCManager.js
const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(__dirname, '../data/persistentVoiceChannels.json');
let persistentVCs = {}; // { 'guildId': 'voiceChannelId' }

function loadPersistentVCs() {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        persistentVCs = JSON.parse(data);
        console.log('Data persistent voice channels berhasil dimuat.');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('File persistentVoiceChannels.json tidak ditemukan, membuat file baru.');
            savePersistentVCs(); // Buat file kosong jika tidak ada
        } else {
            console.error('Error saat memuat data persistent voice channels:', error);
        }
    }
}

function savePersistentVCs() {
    try {
        fs.writeFileSync(filePath, JSON.stringify(persistentVCs, null, 2), 'utf8');
        // console.log('Data persistent voice channels berhasil disimpan.'); // Bisa di-uncomment untuk debug
    } catch (error) {
        console.error('Error saat menyimpan data persistent voice channels:', error);
    }
}

function setPersistentVC(guildId, channelId) {
    persistentVCs[guildId] = channelId;
    savePersistentVCs();
}

function getPersistentVC(guildId) {
    return persistentVCs[guildId];
}

function removePersistentVC(guildId) {
    if (persistentVCs[guildId]) {
        delete persistentVCs[guildId];
        savePersistentVCs();
        return true;
    }
    return false;
}

loadPersistentVCs(); // Load data saat modul di-load

module.exports = {
    setPersistentVC,
    getPersistentVC,
    removePersistentVC
};
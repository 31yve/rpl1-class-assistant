// utils/reminderManager.js
const fs = require('node:fs');
const path = require('node:path');
const { v4: uuidv4 } = require('uuid'); // Untuk membuat ID unik

const remindersFilePath = path.join(__dirname, '../data/reminders.json');
let reminders = {}; // Akan menyimpan { 'guildId': [{ id, timestamp, message, channelId }] }

// Memuat data pengingat dari file saat modul diimpor
function loadReminders() {
    try {
        const data = fs.readFileSync(remindersFilePath, 'utf8');
        reminders = JSON.parse(data);
        console.log('Data pengingat berhasil dimuat.');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('File reminders.json tidak ditemukan, membuat file baru.');
            saveReminders(); // Buat file kosong jika tidak ada
        } else {
            console.error('Error saat memuat data pengingat:', error);
        }
    }
}

// Menyimpan data pengingat ke file
function saveReminders() {
    try {
        fs.writeFileSync(remindersFilePath, JSON.stringify(reminders, null, 2), 'utf8');
        // console.log('Data pengingat berhasil disimpan.');
    } catch (error) {
        console.error('Error saat menyimpan data pengingat:', error);
    }
}

// Menambahkan pengingat baru
function addReminder(guildId, timestamp, message, channelId) {
    if (!reminders[guildId]) {
        reminders[guildId] = [];
    }
    const newReminder = {
        id: uuidv4(), // ID unik untuk pengingat
        timestamp: timestamp, // Waktu pengingat dalam milidetik (epoch)
        message: message,
        channelId: channelId
    };
    reminders[guildId].push(newReminder);
    saveReminders();
    return newReminder;
}

// Mendapatkan semua pengingat untuk guild tertentu
function getReminders(guildId) {
    return reminders[guildId] || [];
}

// Menghapus pengingat berdasarkan ID
function removeReminder(guildId, reminderId) {
    if (!reminders[guildId]) return false;

    const initialLength = reminders[guildId].length;
    reminders[guildId] = reminders[guildId].filter(r => r.id !== reminderId);
    if (reminders[guildId].length < initialLength) {
        saveReminders();
        return true;
    }
    return false;
}

loadReminders(); // Panggil saat modul dimuat

module.exports = {
    addReminder,
    getReminders,
    removeReminder,
};
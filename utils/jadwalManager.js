// utils/jadwalManager.js (MODIFIKASI: Menambahkan getJadwalAllDays)
const fs = require('node:fs');
const path = require('node:path');

const jadwalFilePath = path.join(__dirname, '../data/jadwalPelajaran.json');
let jadwalData = {};

function loadJadwal() {
    try {
        const data = fs.readFileSync(jadwalFilePath, 'utf8');
        jadwalData = JSON.parse(data);
        console.log('Data jadwal pelajaran berhasil dimuat.');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error('ERROR: File jadwalPelajaran.json tidak ditemukan! Pastikan Anda sudah membuatnya di folder data/.');
        } else {
            console.error('Error saat memuat data jadwal pelajaran:', error);
        }
        // Pastikan jadwalData diinisialisasi agar tidak menyebabkan TypeError
        jadwalData = { semester: "Informasi semester tidak tersedia.", keterangan_mapel: {}, jadwal: {} };
    }
}

function getJadwalByHari(hari) {
    const hariLower = hari.toLowerCase();
    if (jadwalData && jadwalData.jadwal && jadwalData.jadwal[hariLower]) {
        return jadwalData.jadwal[hariLower];
    }
    return null;
}

function getKeteranganMapel() {
    return jadwalData.keterangan_mapel || {};
}

function getSemesterInfo() {
    return jadwalData.semester || "Tidak ada informasi semester.";
}

// --- FUNGSI BARU UNTUK MENDAPATKAN SEMUA JADWAL ---
function getJadwalAllDays() {
    return jadwalData.jadwal || {};
}

loadJadwal();

module.exports = {
    getJadwalByHari,
    getKeteranganMapel,
    getSemesterInfo,
    getJadwalAllDays, // <--- EKSPOR FUNGSI BARU INI
    loadJadwal
};
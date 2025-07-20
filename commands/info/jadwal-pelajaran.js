// commands/info/jadwal-pelajaran.js (MODIFIKASI UNTUK DUKUNGAN PREFIX COMMAND DAN OPSI 'SEMUA')
const config = require('../../config.json');
const jadwalManager = require('../../utils/jadwalManager'); // Pastikan path ini benar
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    // === Bagian untuk Slash Command ===
    // Properti 'data' mendefinisikan struktur slash command.
    data: new SlashCommandBuilder()
        .setName('jadwal-pelajaran') // Nama slash command (harus huruf kecil)
        .setDescription('Menampilkan jadwal pelajaran RPL 1.') // Deskripsi untuk slash command
        .addStringOption(option =>
            option.setName('hari')
                .setDescription('Hari untuk menampilkan jadwal (misal: Senin, Selasa, dst., atau "semua")')
                .setRequired(false) // Tidak wajib, karena defaultnya hari ini
                .addChoices(
                    { name: 'Senin', value: 'senin' },
                    { name: 'Selasa', value: 'selasa' },
                    { name: 'Rabu', value: 'rabu' },
                    { name: 'Kamis', value: 'kamis' },
                    { name: 'Jumat', value: 'jumat' },
                    { name: 'Semua', value: 'semua' } // Opsi untuk menampilkan semua jadwal
                )),
    // ==================================

    // === Bagian untuk Prefix Command ===
    // Properti 'name', 'description', dan 'usage' ini digunakan oleh loader perintah
    // di index.js untuk perintah berbasis prefix (!).
    name: 'jadwal-pelajaran', // <--- PASTIKAN BARIS INI ADA
    description: 'Menampilkan jadwal pelajaran RPL 1.', // Deskripsi untuk perintah prefix
    usage: '[hari | semua]', // Contoh penggunaan untuk perintah prefix
    // ==================================

    // Fungsi 'execute' adalah apa yang dijalankan saat command dipanggil.
    // Ia dirancang untuk menangani baik 'interaction' (dari slash command)
    // maupun 'message' (dari prefix command).
    async execute(interactionOrMessage, argsForPrefix, client) {
        let isSlashCommand = false;
        let hariQuery = null;
        let replyChannel = null; // Channel untuk mengirim balasan

        if (interactionOrMessage.isChatInputCommand) {
            isSlashCommand = true;
            hariQuery = interactionOrMessage.options.getString('hari');
            replyChannel = interactionOrMessage.channel;
        } else {
            // Ini adalah Prefix Command
            hariQuery = argsForPrefix[0]; // Ambil argumen pertama sebagai hari
            replyChannel = interactionOrMessage.channel;
        }

        const hariIni = new Date();
        // Array nama hari untuk mendapatkan nama hari saat ini berdasarkan getDay()
        const namaHari = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
        const hariDefault = namaHari[hariIni.getDay()]; // Dapatkan nama hari saat ini (misal: "senin")

        // Tentukan hari yang dicari: dari query user, atau default hari ini
        const hariYangDicari = hariQuery ? hariQuery.toLowerCase() : hariDefault;

        // Ambil informasi dari jadwalManager
        const semesterInfo = jadwalManager.getSemesterInfo();
        const keteranganMapel = jadwalManager.getKeteranganMapel();
        // const allJadwalData = jadwalManager.getJadwalAllDays(); // Ini tidak lagi diperlukan secara langsung di sini

        // Buat Embed dasar
        const embed = new EmbedBuilder()
            .setColor(0x00BFFF) // Warna biru muda
            .setTitle(`🗓️ Jadwal Pelajaran X RPL 1`) // Judul awal, akan diubah nanti
            .setDescription(`**Semester:** ${semesterInfo}\n\n`) // Deskripsi awal
            .setFooter({ text: 'Bot RPL 1 - Jadwal dapat berubah sewaktu-waktu' })
            .setTimestamp(); // Tambahkan timestamp

        // --- Logika Penanganan Hari Libur (Sabtu & Minggu) ---
        if (hariYangDicari === 'minggu' || hariYangDicari === 'sabtu') {
            embed.setTitle(`🗓️ Jadwal Pelajaran X RPL 1 - ${hariYangDicari.toUpperCase()}`);
            embed.setDescription(`Hari **${hariYangDicari.toUpperCase()}** adalah hari libur. Tidak ada jadwal pelajaran yang ditentukan. Selamat beristirahat!`);
            embed.setColor(0xFFA500); // Warna oranye untuk hari libur
            
            // Kirim balasan
            if (isSlashCommand) {
                await interactionOrMessage.reply({ embeds: [embed] });
            } else {
                await replyChannel.send({ embeds: [embed] });
            }
            return; // Hentikan eksekusi
        }
        // --- Akhir Logika Penanganan Hari Libur ---

        // --- Logika Menampilkan SEMUA Jadwal ---
        if (hariYangDicari === 'semua') {
            embed.setTitle(`🗓️ Jadwal Pelajaran X RPL 1 - SEMUA HARI`);
            // Tidak perlu allDaysDescription terpisah, cukup gunakan fields
            let fieldsAdded = 0; // Untuk menghitung jumlah field yang ditambahkan

            const weekdays = ["senin", "selasa", "rabu", "kamis", "jumat"]; // Urutan hari kerja yang diinginkan

            for (const day of weekdays) {
                const dailySchedule = jadwalManager.getJadwalByHari(day); // Ambil jadwal per hari
                if (dailySchedule && dailySchedule.length > 0) {
                    let dayScheduleText = '';
                    dailySchedule.forEach(sesi => {
                        dayScheduleText += `\`${sesi.waktu}\` - ${sesi.mapel}\n`;
                    });
                    
                    // Batasi panjang field agar tidak melebihi 1024 karakter Discord
                    if (dayScheduleText.length > 1000) { 
                        dayScheduleText = dayScheduleText.substring(0, 990) + '\n... (jadwal terlalu panjang)';
                    }
                    
                    // Batasi jumlah field per embed (maksimal 25)
                    if (fieldsAdded < 25) { 
                        embed.addFields({ name: `__${day.toUpperCase()}__`, value: dayScheduleText, inline: false });
                        fieldsAdded++;
                    } else {
                        // Jika sudah melebihi 25 field, tambahkan catatan di footer
                        embed.setFooter({ text: 'Bot RPL 1 | Jadwal lengkap, mungkin butuh scroll. Jadwal dapat berubah sewaktu-waktu.' });
                        break; // Hentikan penambahan field
                    }
                } else {
                    // Jika tidak ada jadwal untuk hari tersebut
                    if (fieldsAdded < 25) {
                        embed.addFields({ name: `__${day.toUpperCase()}__`, value: 'Tidak ada jadwal ditemukan.', inline: false });
                        fieldsAdded++;
                    }
                }
            }
            
            // Tambahkan keterangan kode mapel jika masih ada ruang di embed
            let keteranganText = '';
            for (const kode in keteranganMapel) {
                keteranganText += `\`${kode}\`: ${keteranganMapel[kode]}\n`;
            }
            // Pastikan keterangan tidak terlalu panjang dan masih ada ruang field
            if (keteranganText.length > 0 && embed.data.fields.length < 25 && keteranganText.length < 1000) {
                embed.addFields({ name: 'Keterangan Kode Mapel', value: keteranganText, inline: false });
            } else if (keteranganText.length >= 1000 && embed.data.fields.length < 25) {
                // Jika keterangan terlalu panjang, tambahkan catatan di footer
                embed.setFooter({ text: `Bot RPL 1 | Keterangan Mapel: ${Object.keys(keteranganMapel).join(', ')}. Jadwal dapat berubah sewaktu-waktu.` });
            }

            // Kirim balasan
            if (isSlashCommand) {
                await interactionOrMessage.reply({ embeds: [embed] });
            } else {
                await replyChannel.send({ embeds: [embed] });
            }
            return; // Hentikan eksekusi setelah menampilkan semua jadwal
        }
        // --- Akhir Logika Menampilkan SEMUA Jadwal ---

        // --- Logika Menampilkan Jadwal Harian (jika tidak 'semua' dan bukan hari libur) ---
        embed.setTitle(`🗓️ Jadwal Pelajaran X RPL 1 - ${hariYangDicari.toUpperCase()}`); // Perbarui judul untuk hari spesifik
        const jadwalHariIni = jadwalManager.getJadwalByHari(hariYangDicari);
        
        if (jadwalHariIni && jadwalHariIni.length > 0) {
            let jadwalText = '';
            jadwalHariIni.forEach(sesi => {
                jadwalText += `**${sesi.waktu}** - ${sesi.mapel}\n`;
            });
            embed.addFields({ name: 'Sesi Pelajaran', value: jadwalText, inline: false });

            let keteranganText = '';
            for (const kode in keteranganMapel) {
                keteranganText += `\`${kode}\`: ${keteranganMapel[kode]}\n`;
            }
            if (keteranganText.length > 0 && keteranganText.length < 1000) {
                 embed.addFields({ name: 'Keterangan Kode Mapel', value: keteranganText, inline: false });
            } else if (keteranganText.length >= 1000) {
                 embed.setFooter({ text: `Bot RPL 1 | Keterangan Mapel: ${Object.keys(keteranganMapel).join(', ')}. Jadwal dapat berubah sewaktu-waktu.` });
            }

        } else {
            embed.setDescription(`Jadwal untuk hari **${hariYangDicari.toUpperCase()}** tidak ditemukan dalam data.`);
        }

        // Kirim balasan
        if (isSlashCommand) {
            await interactionOrMessage.reply({ embeds: [embed] });
        } else {
            await replyChannel.send({ embeds: [embed] });
        }
    },
};
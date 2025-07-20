
## **`README.md` Lengkap + Tutorial**

Buat file bernama `README.md` di *root* *repository* Anda dan salin isi berikut ke dalamnya.

````markdown
# RPL 1 Discord Bot 🤖

Selamat datang di repository resmi **RPL 1 Discord Bot**!
Bot ini dirancang khusus untuk membantu mengelola dan meningkatkan interaksi di server Discord Kelas 10/X RPL 1, Axioo Hype 5 AMD X5-2. Bot ini memadukan fitur manajemen kelas, alat bantu coding, bot musik canggih, gamifikasi, dan utilitas umum untuk menciptakan lingkungan belajar dan kolaborasi yang lebih dinamis.

## Fitur Utama ✨

Bot ini hadir dengan berbagai fitur yang terus berkembang:

### I. Fitur Umum & Informasi Kelas

1.  **Pesan Selamat Datang & Perpisahan 👋**: Sambutan otomatis untuk anggota baru dan pesan perpisahan di channel `#welcomebye`.
2.  **Perintah Informasi Cepat 💡**: Akses cepat ke:
    * `!jadwal-pelajaran` atau `/jadwal-pelajaran`: Menampilkan jadwal pelajaran harian atau semua jadwal.
    * `!link-lms` atau `/link-lms`: Tautan ke Learning Management System (LMS) kelas.
    * `!sumber-daya` atau `/sumber-daya`: Kumpulan link dan informasi sumber daya belajar.
3.  **Daftar Perintah Bantuan (Tingkat Lanjut) ❓**:
    * `!help` atau `/help`: Menampilkan daftar semua perintah bot yang dikategorikan.
    * `!help [nama_perintah]` atau `/help [nama_perintah]`: Menampilkan detail penggunaan spesifik untuk satu perintah.

### II. Fitur Bot Musik Canggih 🎶

1.  **Pemutar Musik YouTube & Spotify 🎵**:
    * `!play <YouTube_URL | query_pencarian | Spotify_Track_URL>` atau `/play <...> `: Memutar lagu dari YouTube URL, mencari lagu berdasarkan kata kunci, atau memutar lagu dari link Spotify (track tunggal).
    * `!skip` atau `/skip`: Melewatkan lagu yang sedang diputar.
    * `!stop` atau `/stop`: Menghentikan pemutaran dan mengeluarkan bot dari voice channel.
    * `!pause` atau `/pause`: Menjeda lagu.
    * `!resume` atau `/resume`: Melanjutkan lagu yang dijeda.
    * `!queue` atau `/queue`: Menampilkan antrean lagu.
    * `!loop` atau `/loop`: Mengaktifkan/menonaktifkan loop untuk lagu saat ini.
    * `!nowplaying` atau `/nowplaying`: Menampilkan informasi lagu yang sedang diputar.
2.  **Mode 24/7 Voice Channel 🔊**:
    * `!stay-in-vc [channel_id | "none"]` atau `/stay-in-vc`: Mengatur bot untuk tetap berada di voice channel tertentu 24/7.
    * Bot otomatis bergabung kembali ke channel persisten saat restart atau terputus.

### III. Fitur Pembelajaran & Kolaborasi RPL

1.  **Code Executer / Playground 🚀**: `!run <bahasa> ```kode``` ` atau `/run`: Mengeksekusi potongan kode dalam berbagai bahasa (Python, JS, Java, C++, dll.) dan menampilkan output-nya.
2.  **Permintaan Code Review 👀**: `!review-code <link_repo_atau_file> [pesan]` atau `/review-code`: Mengirim permintaan review kode ke channel khusus.
3.  **Pencari Kelompok Belajar 🧑‍🤝‍🧑**:
    * `!cari-kelompok <topik>` atau `/cari-kelompok`: Membuat atau menemukan permintaan kelompok belajar.
    * `!daftar-kelompok` atau `/daftar-kelompok`: Menampilkan permintaan kelompok belajar yang aktif.
4.  **Resource Link Management & Search 📚**:
    * `!tambah-resource <nama> <link> <kategori> [tag1,tag2,...]` atau `/tambah-resource`: Menambahkan link sumber daya baru.
    * `!cari-resource <kata_kunci>` atau `/cari-resource`: Mencari sumber daya yang tersimpan.
    * `!list-resource [kategori]` atau `/list-resource`: Menampilkan kategori atau sumber daya dalam kategori tertentu.

### IV. Fitur Gamifikasi & Engagement

1.  **Sistem Leveling & XP 🚀**: Pengguna mendapatkan XP dari interaksi pesan dan naik level otomatis.
    * `!level` atau `/level`: Menampilkan level dan XP pribadi atau pengguna lain.
    * `!leaderboard` atau `/leaderboard`: Menampilkan papan peringkat XP teratas.
2.  **Sistem Voting/Polling 📊**: `!poll "Pertanyaan?" "Opsi 1" "Opsi 2"...` atau `/poll`: Membuat jajak pendapat (Admin/Guru saja).

### V. Fitur Administrasi & Utilitas

1.  **Pengumuman Khusus 📢**: `!umumkan [pesan]` atau `/umumkan`: Mengirim pengumuman penting ke channel khusus (Admin/Guru saja).
2.  **Pengingat Otomatis ⏰**:
    * `!set-pengingat YYYY-MM-DD HH:mm [pesan]` atau `/set-pengingat`: Mengatur pengingat (Admin/Guru saja).
    * `!daftar-pengingat` atau `/daftar-pengingat`: Menampilkan pengingat aktif.
3.  **Manajemen Peran Otomatis 🧑‍💻**:
    * Pemberian peran default kepada anggota baru.
    * Role-reaction: Anggota bisa mendapatkan peran dengan reaksi emoji (`!setup-reaction-role` untuk setup).
4.  **Ubah Profil Bot 🤖**:
    * `!set-profile username [nama_baru]` atau `/set-profile username`: Mengubah username bot.
    * `!set-profile avatar [URL_gambar]` atau `/set-profile avatar`: Mengubah avatar bot.
5.  **Ubah Status Bot 🟢🟡🔴⚫**: `!set-status <status> [type] ["aktivitas"]` atau `/set-status`: Mengatur status online dan aktivitas bot (Admin saja).
6.  **Channel Perintah Bot Otomatis 💬**: `!create-bot-channel [nama_channel_opsional]` atau `/create-bot-channel`: Membuat channel teks khusus untuk perintah bot.

---

## **Persyaratan Sistem 🛠️**

* [Node.js](https://nodejs.org/) (Versi LTS direkomendasikan)
* [npm](https://www.npmjs.com/) (Biasanya terinstal bersama Node.js)
* [ffmpeg](https://ffmpeg.org/download.html) (Diinstal secara sistem, atau gunakan `ffmpeg-static` dari npm).
* [yt-dlp](https://github.com/yt-dlp/yt-dlp/releases) (Program eksternal untuk streaming YouTube, perlu diunduh dan ditempatkan agar bisa diakses bot).
* Akun Discord
* Aplikasi Bot Discord yang terdaftar di [Discord Developer Portal](https://discord.com/developers/applications) dengan semua [Privileged Gateway Intents](https://discord.com/developers/docs/topics/gateway#privileged-intents) diaktifkan (terutama `PRESENCE INTENT`, `SERVER MEMBERS INTENT`, `MESSAGE CONTENT INTENT`, `GUILD VOICE STATES`).
* Aplikasi di [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) untuk mendapatkan Client ID dan Client Secret (untuk fitur Spotify).

---

## **Instalasi dan Pengaturan (Tutorial)** ⚙️

Ikuti langkah-langkah di bawah ini untuk menjalankan bot Anda:

### 1. Klon Repository

```bash
git clone https://github.com/31yve/rpl1-class-assistant
````

### 2\. Konfigurasi Kredensial & Data

1.  **Buat file bernama `.env`** di root folder proyek Anda dan isi dengan token bot Discord serta Client ID aplikasi bot Anda:

    ```
    DISCORD_TOKEN=MASUKKAN_TOKEN_BOT_ANDA_DI_SINI
    CLIENT_ID=MASUKKAN_CLIENT_ID_BOT_DISCORD_ANDA_DI_SINI
    ```

    **PENTING: JANGAN PERNAH BAGIKAN FILE `.env` INI DI REPOSITORY PUBLIK\!**

2.  **Buat file `config.json`** di root folder proyek Anda. Salin seluruh struktur konfigurasi yang telah kita buat (pastikan tidak ada komentar `//` atau `/* */`). **Pastikan untuk mengganti semua placeholder (contoh: `GANTI_DENGAN_ID_CHANNEL_PENGUMUMAN_PENTING_ANDA`, `YOUR_ROLE_ID`, `YOUR_SPOTIFY_CLIENT_SECRET`, dll.) dengan ID numerik atau nilai asli dari server Discord dan akun Spotify Anda.**

3.  **Buat folder `data/`** di root proyek. Di dalamnya, buat beberapa file kosong (akan diisi oleh bot atau diisi manual):

      * `levels.json` (isi dengan `{}`)
      * `reminders.json` (isi dengan `{}`)
      * `studyRequests.json` (isi dengan `{}`)
      * `resources.json` (isi dengan `{}`)
      * **`jadwalPelajaran.json`** (isi dengan struktur JSON jadwal yang telah kita buat sebelumnya). Contoh:
        ```json
        {
          "semester": "Ganjil Tahun Ajaran 2025/2026",
          "keterangan_mapel": {"BIND": "Bahasa Indonesia", ...},
          "jadwal": {
            "senin": [{"waktu": "...", "mapel": "..."}, ...],
            "selasa": [],
            ...
          }
        }
        ```
      * `persistentVoiceChannels.json` (isi dengan `{}`)

4.  **Dapatkan *cookies* YouTube:** Unduh *file* `cookies.txt` dari akun YouTube Anda (setelah *login*) menggunakan ekstensi *browser* (misalnya "Get cookies.txt"). **Tempatkan *file* ini di *root* folder proyek Anda (`/home/container/cookies.txt` jika di Pterodactyl).**

### 3\. Instal Dependensi Node.js

Buka terminal di root folder proyek Anda dan jalankan perintah berikut:

```bash
npm install discord.js dotenv @discordjs/builders @discordjs/voice ffmpeg-static youtube-dl-exec uuid moment-timezone axios spotify-web-api-node
```

Ini akan menginstal semua pustaka Node.js yang diperlukan.

### 4\. Instal Program Eksternal (ffmpeg & yt-dlp)

1.  **Instal `ffmpeg` secara sistem** (jika belum, atau pastikan `ffmpeg-static` dari npm berfungsi):
      * Untuk Debian/Ubuntu (termasuk banyak hosting Pterodactyl): `sudo apt install ffmpeg` (jika Anda memiliki akses `sudo`). Jika tidak, pastikan `ffmpeg-static` berfungsi.
2.  **Instal `yt-dlp`:**
      * **Untuk Pterodactyl (Disarankan):** Unduh biner `yt-dlp` terbaru untuk Linux dari [https://github.com/yt-dlp/yt-dlp/releases](https://github.com/yt-dlp/yt-dlp/releases) (cari file `yt-dlp` tanpa ekstensi). Unggah *file* ini ke folder `bin/` di *root* proyek Anda (`/home/container/bin/yt-dlp`). Pastikan memberikannya izin eksekusi (`chmod +x bin/yt-dlp` di terminal Pterodactyl). Anda mungkin perlu mengonfigurasi `ytDlpPath` di `musicPlayer.js` dan `play.js` jika bot tidak menemukannya secara otomatis.

### 5\. Daftarkan Slash Commands

Jalankan script ini **SETIAP KALI** Anda menambah, mengubah, atau menghapus *slash command*:

```bash
node deploy.js
```

  * Ini akan mendaftarkan perintah *slash* Anda ke Discord. Pastikan `CLIENT_ID` dan `GUILD_ID` di `deploy.js` sudah benar.

### 6\. Jalankan Bot

```bash
node index.js
```

Bot Anda seharusnya akan online di Discord dan siap menerima perintah\!

## Penggunaan Perintah 🚀

Berikut beberapa contoh perintah yang dapat Anda gunakan di server Discord (gunakan `!` atau `/`):

  * `/help` atau `!help`: Menampilkan daftar semua perintah.
  * `/jadwal-pelajaran [hari | semua]` atau `!jadwal-pelajaran [hari | semua]`: Melihat jadwal pelajaran.
  * `/play <YouTube_URL | query_pencarian | Spotify_Track_URL>` atau `!play <...>`: Memutar lagu.
  * `/level` atau `!level`: Melihat level dan XP Anda.
  * `/leaderboard` atau `!leaderboard`: Melihat papan peringkat XP teratas.
  * `/set-status <online|idle|dnd|invisible> [type] ["aktivitas"]` (Admin Only)

*(Lihat bagian "Fitur Utama" untuk daftar perintah lengkap lainnya.)*

## Kontribusi 🤝

Jika Anda memiliki ide fitur baru, perbaikan bug, atau ingin berkontribusi pada kode, silakan:

1.  Fork repository ini.
2.  Buat branch baru (`git checkout -b feature/nama-fitur-anda`).
3.  Lakukan perubahan Anda.
4.  Commit perubahan (`git commit -m 'Tambahkan fitur baru'`).
5.  Push ke branch Anda (`git push origin feature/nama-fitur-anda`).
6.  Buat Pull Request.

## Lisensi 📄

Proyek ini dilisensikan di bawah Lisensi MIT. Lihat file [LICENSE](https://www.google.com/search?q=LICENSE) untuk detailnya.

-----

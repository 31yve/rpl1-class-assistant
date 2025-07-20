// utils/musicPlayer.js
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, NoSubscriberBehavior, entersState } = require('@discordjs/voice');
const ytdlExec = require('youtube-dl-exec');
const persistentVCManager = require('./persistentVCManager'); // <--- TAMBAHKAN INI

const musicManagers = new Map(); // Map untuk menyimpan MusicManager per guild

class MusicManager {
    constructor(guildId, textChannel) {
        this.guildId = guildId;
        this.textChannel = textChannel;
        this.queue = [];
        this.currentSong = null;
        this.connection = null;
        this.audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause,
            },
        });
        this.loop = false; // Status loop
        this.volume = 1.0; // Default volume (0.0 to 1.0 for AudioResource)

        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            console.log(`[Music] AudioPlayer Idle for guild ${this.guildId}. Playing next song.`);
            playNextSong(this.guildId);
        });

        this.audioPlayer.on('error', error => {
            console.error(`[Music] AudioPlayer Error for guild ${this.guildId}:`, error);
            if (this.currentSong) {
                this.textChannel.send(`Terjadi kesalahan saat memutar **${this.currentSong.title}**: \`${error.message}\`. Melewatkan lagu ini.`);
            } else {
                this.textChannel.send(`Terjadi kesalahan pada pemutar audio: \`${error.message}\`.`);
            }
            playNextSong(this.guildId); // Coba putar lagu berikutnya
        });
    }
}

function getMusicManager(guildId) {
    return musicManagers.get(guildId);
}

function joinChannel(voiceChannel) {
    const guildId = voiceChannel.guild.id;
    let manager = musicManagers.get(guildId);

    if (manager && manager.connection && manager.connection.state.status !== VoiceConnectionStatus.Destroyed) {
        // Jika sudah ada koneksi dan masih aktif, gunakan yang sudah ada
        return manager.connection;
    }

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
        selfDeaf: true, // Bot akan tuli sendiri
    });

    if (!manager) {
        // Buat manager baru jika belum ada
        manager = new MusicManager(guildId, null); // textChannel akan diatur saat addSongToQueue
        musicManagers.set(guildId, manager);
    }
    manager.connection = connection;
    connection.subscribe(manager.audioPlayer);

    // --- Event Listener Koneksi ---
    connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
        console.log(`[Music] VoiceConnection for guild ${voiceChannel.guild.id} disconnected. Status: ${oldState.status} -> ${newState.status}`);
        const persistentChannelId = persistentVCManager.getPersistentVC(voiceChannel.guild.id);

        if (persistentChannelId === voiceChannel.id) { // Jika ini adalah VC persisten
            try {
                console.log(`[Music] Bot akan mencoba menyambung kembali ke VC persisten ${voiceChannel.name}.`);
                // Coba masuk kembali, jika berhasil akan trigger ready state
                await Promise.race([
                    entersState(connection, VoiceConnectionStatus.Connecting, 10_000), // Beri waktu 10 detik untuk Connecting
                    entersState(connection, VoiceConnectionStatus.Ready, 10_000),     // Beri waktu 10 detik untuk Ready
                ]);
                console.log(`[Music] Bot berhasil menyambung kembali ke VC persisten ${voiceChannel.name}.`);
            } catch (error) {
                // Jika gagal menyambung kembali setelah beberapa upaya, hancurkan koneksi dan laporkan
                if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
                    console.error(`[Music] Gagal menyambung kembali ke VC persisten ${voiceChannel.name}. Menghancurkan koneksi.`, error);
                    connection.destroy(); // Hancurkan jika gagal menyambung
                }
                // Hapus pengaturan persisten jika tidak bisa menyambung kembali
                persistentVCManager.removePersistentVC(voiceChannel.guild.id);
                console.log(`[Music] Setting 24/7 untuk guild ${voiceChannel.guild.name} dihapus karena gagal menyambung kembali.`);
                if (manager.textChannel) {
                    manager.textChannel.send(`Gagal mempertahankan koneksi 24/7 di ${voiceChannel.name}. Fitur 24/7 dinonaktifkan untuk server ini.`);
                }
            }
        } else {
            // Jika bukan VC persisten atau tidak diatur, hancurkan koneksi seperti biasa
            if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
                console.log(`[Music] Menghancurkan koneksi non-persisten untuk guild ${voiceChannel.guild.id}.`);
                connection.destroy();
            }
        }
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
        console.log(`[Music] VoiceConnection for guild ${guildId} destroyed.`);
        musicManagers.delete(guildId); // Hapus manager saat koneksi dihancurkan
    });

    return connection;
}

function addSongToQueue(guildId, url, title, textChannel) {
    let manager = musicManagers.get(guildId);
    if (!manager) {
        manager = new MusicManager(guildId, textChannel);
        musicManagers.set(guildId, manager);
    } else {
        manager.textChannel = textChannel; // Update text channel jika ada
    }

    const song = { url, title, textChannel };
    manager.queue.push(song);
    console.log(`[Music] Ditambahkan ke antrean: ${title} untuk guild ${guildId}. Antrean: ${manager.queue.length}`);

    if (manager.audioPlayer.state.status === AudioPlayerStatus.Idle && !manager.currentSong) {
        playNextSong(guildId);
    }
}

async function playNextSong(guildId) {
    const manager = musicManagers.get(guildId);
    if (!manager) return;

    if (manager.loop && manager.currentSong) {
        manager.queue.unshift(manager.currentSong); // Tambahkan kembali lagu saat ini ke awal antrean jika loop aktif
    }

    if (manager.queue.length === 0) {
        manager.currentSong = null;
        // --- MODIFIKASI UNTUK 24/7 ---
        // Bot TIDAK meninggalkan VC saat antrean kosong.
        console.log(`[Music] Antrean kosong untuk guild ${guildId}. Bot tetap di VC.`);
        manager.audioPlayer.stop(); // Hentikan pemutaran jika tidak ada lagu
        return;
    }

    const song = manager.queue.shift();
    manager.currentSong = song;

    try {
        const stream = ytdlExec(song.url, {
            o: '-',
            q: '',
            f: 'bestaudio[ext=webm+acodec=opus]/bestaudio[ext=m4a]',
            r: '100K',
            cookies: '/home/container/cookies.txt', // Pastikan path ini benar di Pterodactyl Anda
            // ytDlpPath: '/home/container/bin/yt-dlp', // Opsional: Jika Anda perlu menentukan path yt-dlp secara eksplisit
        }, { stdio: ['pipe', 'pipe', 'ignore'] });

        const resource = createAudioResource(stream.stdout, {
            inlineVolume: true // Penting untuk kontrol volume
        });
        resource.volume.setVolume(manager.volume); // Set volume
        
        manager.audioPlayer.play(resource);
        song.textChannel.send(`Memutar sekarang: **${song.title}**`);
    } catch (error) {
        console.error(`[Music] Error saat memutar stream dari ${song.url}: ${error.message}`, error);
        song.textChannel.send(`Gagal memutar lagu: **${song.title}**. Mungkin link tidak valid, tidak tersedia, atau ada masalah streaming. Melewatkan lagu ini.`);
        playNextSong(guildId);
    }
}

function stop(guildId) {
    const manager = musicManagers.get(guildId);
    if (manager) {
        manager.queue = [];
        manager.currentSong = null;
        manager.audioPlayer.stop();
        if (manager.connection && manager.connection.state.status !== VoiceConnectionStatus.Destroyed) {
            manager.connection.destroy();
        }
        musicManagers.delete(guildId);
        console.log(`[Music] Pemutaran dihentikan dan koneksi dihancurkan untuk guild ${guildId}.`);
        return true;
    }
    return false;
}

function skip(guildId) {
    const manager = musicManagers.get(guildId);
    if (manager && manager.audioPlayer.state.status !== AudioPlayerStatus.Idle) {
        manager.audioPlayer.stop(); // Menghentikan lagu saat ini akan memicu playNextSong
        console.log(`[Music] Lagu dilewati untuk guild ${guildId}.`);
        return true;
    }
    return false;
}

function toggleLoop(guildId) {
    const manager = musicManagers.get(guildId);
    if (manager) {
        manager.loop = !manager.loop;
        return manager.loop;
    }
    return false;
}

function setVolume(guildId, volume) {
    const manager = musicManagers.get(guildId);
    if (manager) {
        // Volume harus antara 0.0 dan 1.0 untuk AudioResource
        manager.volume = Math.max(0, Math.min(1, volume / 100)); // Mengubah 0-200 menjadi 0.0-2.0, lalu batasi 0.0-1.0
        if (manager.audioPlayer.state.resource && manager.audioPlayer.state.resource.volume) {
            manager.audioPlayer.state.resource.volume.setVolume(manager.volume);
        }
        return true;
    }
    return false;
}

module.exports = {
    getMusicManager,
    joinChannel,
    addSongToQueue,
    stop,
    skip,
    toggleLoop,
    setVolume,
    // Ekspor status koneksi untuk penggunaan di ready.js atau tempat lain
    VoiceConnectionStatus,
    AudioPlayerStatus,
};
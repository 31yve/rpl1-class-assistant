// commands/music/play.js (MODIFIKASI UNTUK DUKUNGAN SPOTIFY)
const config = require('../../config.json');
const musicPlayer = require('../../utils/musicPlayer');
const { EmbedBuilder } = require('discord.js');
const ytdlExec = require('youtube-dl-exec');
const spotifyClient = require('../../utils/spotifyClient'); // <--- TAMBAHKAN INI

module.exports = {
    name: 'play',
    description: 'Memutar lagu dari YouTube URL, pencarian, atau Spotify URL.', // Deskripsi diperbarui
    usage: '<YouTube_URL | query_pencarian | Spotify_URL>', // Penggunaan diperbarui
    aliases: ['p'],
    async execute(message, args, client) {
        const voiceChannel = message.member.voice.channel;
        if (!voiceChannel) {
            return message.reply('Anda harus berada di *voice channel* untuk memutar musik!');
        }

        const permissions = voiceChannel.permissionsFor(message.client.user);
        if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
            return message.reply('Saya tidak punya izin untuk bergabung atau berbicara di *voice channel* ini!');
        }

        const query = args.join(' ');
        if (!query) {
            return message.reply('Mohon berikan URL YouTube, URL Spotify, atau kata kunci pencarian.');
        }

        let songUrl;
        let songTitle = "Lagu Tidak Dikenal";
        let thumbnailUrl = null;

        try {
            let info;
            const ytDlpOptions = {
                dumpSingleJson: true,
                noWarnings: true,
                cookies: '/home/container/cookies.txt', // Pastikan path ini benar di Pterodactyl Anda
                // ytDlpPath: '/home/container/bin/yt-dlp', // Opsional: jika Anda menentukan path yt-dlp secara eksplisit
            };

            // --- Cek apakah input adalah URL Spotify ---
            const spotifyTrackRegex = /(?:https:\/\/open\.spotify\.com\/(?:user\/[a-zA-Z0-9]+\/)?track\/([a-zA-Z0-9]+)|spotify:track:([a-zA-Z0-9]+))/;
            const spotifyAlbumRegex = /(?:https:\/\/open\.spotify\.com\/(?:user\/[a-zA-Z0-9]+\/)?album\/([a-zA-Z0-9]+)|spotify:album:([a-zA-Z0-9]+))/;
            const spotifyPlaylistRegex = /(?:https:\/\/open\.spotify\.com\/(?:user\/[a-zA-Z0-9]+\/)?playlist\/([a-zA-Z0-9]+)|spotify:playlist:([a-zA-Z0-9]+))/;

            if (spotifyTrackRegex.test(query)) {
                // Spotify Track
                const trackInfo = await spotifyClient.getTrackInfo(query);
                if (!trackInfo) {
                    return message.reply('Gagal mendapatkan informasi dari link Spotify track ini. Mungkin link tidak valid atau ada masalah autentikasi Spotify.');
                }
                songTitle = `${trackInfo.title} - ${trackInfo.artist}`;
                // Gunakan yt-dlp untuk mencari di YouTube
                info = await ytdlExec(`${songTitle} official audio`, { ...ytDlpOptions, defaultSearch: 'ytsearch' });
                songUrl = info.url;
            } else if (spotifyAlbumRegex.test(query) || spotifyPlaylistRegex.test(query)) {
                // Untuk album/playlist, ini akan lebih kompleks.
                // Untuk sekarang, kita bisa memberikan pesan bahwa fitur ini belum didukung penuh.
                // Atau, Anda bisa menggunakan yt-dlp langsung, karena yt-dlp juga mendukung URL Spotify playlist/album (tapi mungkin kurang akurat dan sering terdeteksi bot)
                return message.reply('Dukungan untuk URL Spotify album atau playlist belum sepenuhnya diimplementasikan. Mohon berikan URL track tunggal atau pencarian YouTube.');
                // Contoh jika ingin yt-dlp langsung mencoba:
                // info = await ytdlExec(query, ytDlpOptions); // yt-dlp will try to resolve spotify album/playlist
                // songTitle = info.title || songTitle;
                // songUrl = info.url;

            } else {
                // --- Jika input adalah URL YouTube atau query pencarian YouTube ---
                const isYoutubeUrl = query.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/);

                if (isYoutubeUrl) {
                    info = await ytdlExec(query, ytDlpOptions);
                } else {
                    const searchOptions = { ...ytDlpOptions, defaultSearch: 'ytsearch' };
                    info = await ytdlExec(query, searchOptions);
                    songUrl = info.url; // Gunakan URL dari hasil pencarian
                }
            }
            
            if (!info || !songUrl) {
                return message.reply(`Tidak ada hasil yang ditemukan untuk: \`${query}\`.`);
            }

            songTitle = info.title || songTitle;
            if (info.thumbnail) {
                thumbnailUrl = info.thumbnail;
            } else if (info.thumbnails && info.thumbnails.length > 0) {
                thumbnailUrl = info.thumbnails[info.thumbnails.length - 1].url;
            }

            musicPlayer.joinChannel(voiceChannel);
            musicPlayer.addSongToQueue(message.guild.id, songUrl, songTitle, message.channel);

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🎶 Lagu Ditambahkan')
                .setDescription(`[${songTitle}](${songUrl}) telah ditambahkan ke antrean.`)
                .setFooter({ text: `Oleh: ${message.author.username}` })
                .setTimestamp();
            if (thumbnailUrl) {
                embed.setThumbnail(thumbnailUrl);
            }
            
            await message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('[Music] Error saat perintah play:', error);
            let errorMessage = `Terjadi kesalahan saat mencoba memutar lagu: \`${error.message}\`.`;
            if (error.stderr && error.stderr.includes("Sign in to confirm you’re not a bot")) {
                errorMessage += `\n**PENTING**: YouTube mendeteksi bot. Mohon perbarui cookies YouTube di \`/home/container/cookies.txt\`.`;
            } else if (error.stderr && error.stderr.includes("This video is unavailable") || error.stderr && error.stderr.includes("private video")) {
                errorMessage = `Video tidak tersedia atau bersifat pribadi.`;
            } else if (error.message.includes("Could not authenticate with Spotify API")) {
                errorMessage = `Gagal terhubung ke Spotify API. Pastikan Client ID dan Secret di config.json benar.`;
            } else if (error.stderr) {
                errorMessage += `\nDetail yt-dlp: \`${error.stderr.split('\n').filter(line => line.startsWith('ERROR:')).join('\n')}\``;
            }
            message.reply(errorMessage);
        }
    },
};
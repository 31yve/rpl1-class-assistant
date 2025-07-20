// commands/utility/help.js (FIXED FOR EMBED LENGTH LIMIT)
const config = require('../../config.json');
const { EmbedBuilder } = require('discord.js');
const path = require('node:path');

module.exports = {
    name: 'help',
    description: 'Menampilkan daftar semua perintah bot atau bantuan spesifik.',
    usage: '[nama_perintah]',
    aliases: ['bantuan', 'commands'],
    async execute(message, args, client) {
        const { commands } = client;
        const prefix = config.general.prefix;

        // --- Logika Bantuan Spesifik Perintah ---
        if (args.length > 0) {
            const commandName = args[0].toLowerCase();
            const command = commands.get(commandName) || commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (!command || (command.adminOnly && !message.member.permissions.has('Administrator'))) {
                return message.reply(`Perintah \`${prefix}${commandName}\` tidak ditemukan atau Anda tidak memiliki izin untuk melihat detailnya.`);
            }

            const specificHelpEmbed = new EmbedBuilder()
                .setColor(0x32CD32)
                .setTitle(`📚 Detail Perintah: ${prefix}${command.name}`)
                .setDescription(command.description || 'Tidak ada deskripsi.')
                .setTimestamp()
                .setFooter({ text: 'Bot RPL 1' });

            if (command.usage) {
                specificHelpEmbed.addFields({ name: 'Penggunaan', value: `\`${prefix}${command.name}${command.usage ? ' ' + command.usage : ''}\``, inline: false });
            }
            if (command.aliases && command.aliases.length > 0) {
                const actualAliases = command.aliases.filter(alias => alias !== command.name);
                if (actualAliases.length > 0) {
                    specificHelpEmbed.addFields({ name: 'Alias', value: actualAliases.map(a => `\`${a}\``).join(', '), inline: false });
                }
            }
            if (command.adminOnly) {
                specificHelpEmbed.addFields({ name: 'Akses', value: '**[Admin/Guru]**', inline: false });
            }
            if (command.details) {
                specificHelpEmbed.addFields({ name: 'Detail Tambahan', value: command.details, inline: false });
            }

            return message.channel.send({ embeds: [specificHelpEmbed] });
        }

        // --- Logika Bantuan Umum (jika tidak ada argumen) ---
        const commandCategories = {
            'Info': [],
            'Admin': [],
            'Kolaborasi': [],
            'Utilitas': [],
            'Lain-lain': []
        };

        commands.forEach(command => {
            if (command.execute && !command.hidden) {
                const commandPath = command.filePath;
                let categoryName = 'Lain-lain';

                if (commandPath) {
                    const parts = commandPath.split(path.sep);
                    const commandsIndex = parts.indexOf('commands');
                    
                    if (commandsIndex !== -1 && parts.length > commandsIndex + 1) {
                        const categoryFolder = parts[commandsIndex + 1];

                        switch (categoryFolder) {
                            case 'info':
                                categoryName = 'Info';
                                break;
                            case 'admin':
                                categoryName = 'Admin';
                                break;
                            case 'collaboration':
                                categoryName = 'Kolaborasi';
                                break;
                            case 'utility':
                                categoryName = 'Utilitas';
                                break;
                            default:
                                categoryName = 'Lain-lain';
                        }
                    }
                }
                
                const isDuplicate = commandCategories[categoryName].some(cmd => cmd.name === command.name);
                if (!isDuplicate) {
                    commandCategories[categoryName].push(command);
                }
            }
        });

        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('📖 Daftar Perintah Bot Kelas RPL 1')
            .setDescription(`Gunakan \`${prefix}[perintah]\` untuk menggunakan perintah.
Untuk detail penggunaan perintah tertentu, gunakan \`${prefix}help [nama_perintah]\`.

Berikut adalah perintah yang tersedia, dikelompokkan berdasarkan kategori:\n`)
            .setFooter({ text: 'Bot RPL 1' })
            .setTimestamp();

        // Loop untuk setiap kategori dan tambahkan field, dengan splitting jika terlalu panjang
        for (const category in commandCategories) {
            const commandsInCat = commandCategories[category];
            if (commandsInCat.length > 0) {
                let currentCommandList = '';
                let currentLength = 0;
                let fieldCounter = 0; // To track how many fields for this category

                commandsInCat.forEach(command => {
                    const adminTag = command.adminOnly ? '**[Admin/Guru]** ' : '';
                    let aliases = '';
                    if (command.aliases && command.aliases.length > 0) {
                        const actualAliases = command.aliases.filter(alias => alias !== command.name);
                        if (actualAliases.length > 0) {
                            aliases = ` (Alias: ${actualAliases.map(a => `\`${a}\``).join(', ')})`;
                        }
                    }
                    // Ensure usage formatting is correct
                    const usage = command.usage ? ` \`${prefix}${command.name}${command.usage ? ' ' + command.usage : ''}\`` : ` \`${prefix}${command.name}\``;

                    const commandEntry = `${adminTag}**${prefix}${command.name}**${aliases}\n` +
                                         `  • ${command.description}\n` +
                                         `  • Contoh: ${usage}\n\n`; // Add extra newline for spacing
                    
                    // Check if adding this entry will exceed the 1024 character limit
                    // If it does, and we already have content, add the current list as a field
                    if (currentLength + commandEntry.length > 1000 && currentCommandList.length > 0) { // Use 1000 as safe buffer
                        helpEmbed.addFields({ 
                            name: `__${category}__${fieldCounter > 0 ? ` (Lanjutan ${fieldCounter})` : ''}`, 
                            value: currentCommandList, 
                            inline: false 
                        });
                        currentCommandList = ''; // Reset for new field
                        currentLength = 0;
                        fieldCounter++;
                    }

                    // Add entry to the current list
                    currentCommandList += commandEntry;
                    currentLength += commandEntry.length;
                });

                // Add any remaining commands that haven't been added to a field (after loop finishes)
                if (currentCommandList.length > 0) {
                    helpEmbed.addFields({ 
                        name: `__${category}__${fieldCounter > 0 ? ` (Lanjutan ${fieldCounter})` : ''}`, 
                        value: currentCommandList, 
                        inline: false 
                    });
                }
            }
        }

        try {
            await message.channel.send({ embeds: [helpEmbed] });
        } catch (error) {
            console.error('Gagal mengirim pesan bantuan:', error);
            message.reply('Maaf, ada masalah saat menampilkan bantuan.');
        }
    },
};
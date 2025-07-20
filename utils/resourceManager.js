// utils/resourceManager.js
const fs = require('node:fs');
const path = require('node:path');
const { v4: uuidv4 } = require('uuid'); // Untuk membuat ID unik

const resourcesFilePath = path.join(__dirname, '../data/resources.json');
let resources = {}; // Akan menyimpan { 'id': { name, link, category, tags, addedBy, timestamp } }

// Memuat data resource dari file saat modul diimpor
function loadResources() {
    try {
        const data = fs.readFileSync(resourcesFilePath, 'utf8');
        resources = JSON.parse(data);
        console.log('Data resource berhasil dimuat.');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('File resources.json tidak ditemukan, membuat file baru.');
            saveResources(); // Buat file kosong jika tidak ada
        } else {
            console.error('Error saat memuat data resource:', error);
        }
    }
}

// Menyimpan data resource ke file
function saveResources() {
    try {
        fs.writeFileSync(resourcesFilePath, JSON.stringify(resources, null, 2), 'utf8');
        // console.log('Data resource berhasil disimpan.');
    } catch (error) {
        console.error('Error saat menyimpan data resource:', error);
    }
}

// Menambahkan resource baru
function addResource(name, link, category, tags, addedBy) {
    const id = uuidv4();
    const newResource = {
        id: id,
        name: name,
        link: link,
        category: category.toLowerCase(),
        tags: tags.map(tag => tag.toLowerCase()),
        addedBy: addedBy, // ID user yang menambahkan
        timestamp: Date.now()
    };
    resources[id] = newResource;
    saveResources();
    return newResource;
}

// Mencari resource berdasarkan nama, link, kategori, atau tag
function searchResources(query) {
    const lowerQuery = query.toLowerCase();
    const results = Object.values(resources).filter(res =>
        res.name.toLowerCase().includes(lowerQuery) ||
        res.link.toLowerCase().includes(lowerQuery) ||
        res.category.includes(lowerQuery) ||
        res.tags.some(tag => tag.includes(lowerQuery))
    );
    return results;
}

// Mendapatkan resource berdasarkan kategori
function getResourcesByCategory(category) {
    const lowerCategory = category.toLowerCase();
    const results = Object.values(resources).filter(res => res.category === lowerCategory);
    return results;
}

// Mendapatkan semua kategori unik
function getAllCategories() {
    const categories = new Set();
    Object.values(resources).forEach(res => categories.add(res.category));
    return Array.from(categories);
}

// Menghapus resource berdasarkan ID (opsional, untuk admin)
function removeResource(id) {
    if (resources[id]) {
        delete resources[id];
        saveResources();
        return true;
    }
    return false;
}

loadResources(); // Panggil saat modul dimuat

module.exports = {
    addResource,
    searchResources,
    getResourcesByCategory,
    getAllCategories,
    removeResource
};
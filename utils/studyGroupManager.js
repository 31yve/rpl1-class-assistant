// utils/studyGroupManager.js
const fs = require('node:fs');
const path = require('node:path');

const requestsFilePath = path.join(__dirname, '../data/studyRequests.json');
let pendingStudyRequests = new Map();

// Load data from file on module import
function loadRequests() {
    try {
        const data = fs.readFileSync(requestsFilePath, 'utf8');
        const parsedData = JSON.parse(data);
        // Convert plain object back to Map for nested Maps
        pendingStudyRequests = new Map(Object.entries(parsedData).map(([guildId, topics]) =>
            [guildId, new Map(Object.entries(topics))]
        ));
        console.log('Data permintaan kelompok belajar berhasil dimuat.');
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log('File studyRequests.json tidak ditemukan, membuat file baru.');
            saveRequests();
        } else {
            console.error('Error saat memuat data permintaan kelompok belajar:', error);
        }
    }
}

// Save data to file
function saveRequests() {
    try {
        // Convert Map to plain object for JSON serialization
        const dataToSave = {};
        for (const [guildId, topicsMap] of pendingStudyRequests.entries()) {
            dataToSave[guildId] = Object.fromEntries(topicsMap.entries());
        }
        fs.writeFileSync(requestsFilePath, JSON.stringify(dataToSave, null, 2), 'utf8');
    } catch (error) {
        console.error('Error saat menyimpan data permintaan kelompok belajar:', error);
    }
}

function addRequest(guildId, userId, topic, messageId, channelId) {
    if (!pendingStudyRequests.has(guildId)) {
        pendingStudyRequests.set(guildId, new Map());
    }
    const guildRequests = pendingStudyRequests.get(guildId);

    if (!guildRequests.has(topic)) {
        guildRequests.set(topic, []);
    }
    // Remove existing request for the same user and topic to avoid duplicates
    const existingRequests = guildRequests.get(topic).filter(req => req.userId !== userId);
    existingRequests.push({ userId: userId, timestamp: Date.now(), messageId: messageId, channelId: channelId });
    guildRequests.set(topic, existingRequests);
    saveRequests();
}

function findAndRemoveMatch(guildId, userId, topic) {
    if (!pendingStudyRequests.has(guildId)) return null;
    const guildRequests = pendingStudyRequests.get(guildId);

    if (!guildRequests.has(topic)) return null;
    let topicRequests = guildRequests.get(topic);

    const matchingRequestIndex = topicRequests.findIndex(req => req.userId !== userId);
    if (matchingRequestIndex !== -1) {
        const matchedRequest = topicRequests.splice(matchingRequestIndex, 1)[0]; // Remove and get the match
        
        // Remove the requester's own request as well (if they had one)
        const updatedTopicRequests = topicRequests.filter(req => req.userId !== userId);
        guildRequests.set(topic, updatedTopicRequests);

        if (updatedTopicRequests.length === 0) {
            guildRequests.delete(topic);
        }
        saveRequests();
        return matchedRequest;
    }
    return null;
}

function removeUserRequest(guildId, userId, topic = null) {
    if (!pendingStudyRequests.has(guildId)) return false;
    const guildRequests = pendingStudyRequests.get(guildId);
    let removed = false;

    if (topic) { // Remove specific topic request for a user
        if (guildRequests.has(topic)) {
            const topicRequests = guildRequests.get(topic);
            const initialLength = topicRequests.length;
            const updatedRequests = topicRequests.filter(req => req.userId !== userId);
            if (updatedRequests.length < initialLength) {
                guildRequests.set(topic, updatedRequests);
                if (updatedRequests.length === 0) {
                    guildRequests.delete(topic);
                }
                removed = true;
            }
        }
    } else { // Remove all requests for the user in the guild, across all topics
        for (const [t, requests] of guildRequests.entries()) {
            const initialLength = requests.length;
            const updatedRequests = requests.filter(req => req.userId !== userId);
            if (updatedRequests.length < initialLength) {
                guildRequests.set(t, updatedRequests);
                if (updatedRequests.length === 0) {
                    guildRequests.delete(t);
                }
                removed = true; // Mark as removed if any request was removed
            }
        }
    }
    if (removed) saveRequests();
    return removed;
}

function getRequestsByGuild(guildId) {
    return pendingStudyRequests.get(guildId) || new Map();
}

loadRequests(); // Call on module load

module.exports = {
    addRequest,
    findAndRemoveMatch,
    removeUserRequest,
    getRequestsByGuild,
};
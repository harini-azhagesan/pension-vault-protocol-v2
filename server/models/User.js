const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// --- Mongoose Schema Definition ---
const userSchema = new mongoose.Schema({
    upid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['employee', 'employer'], default: 'employee' },
    organization: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

// Try to define the model, or use existing one (for hot-reloading)
let User;
try {
    User = mongoose.model('User');
} catch {
    User = mongoose.model('User', userSchema);
}

// --- Hybrid Mock Implementation for Prototype/No-DB Mode ---
const DB_FILE = path.join(__dirname, '../data/users.json');
let memoryUsers = [];

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

// Load initial data from JSON if it exists
const loadMemoryUsers = () => {
    try {
        if (fs.existsSync(DB_FILE)) {
            return JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) || [];
        }
    } catch (err) {
        console.warn('User Model: Unable to load memory users', err.message);
    }
    return [];
};

const persistMemoryUsers = (users) => {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
        return true;
    } catch (err) {
        console.warn('User Model: Unable to persist memory users', err.message);
        return false;
    }
};

memoryUsers = loadMemoryUsers();

// Wrapper class that chooses between Mongoose and Memory based on connection
class HybridUser {
    constructor(data) {
        this.data = data;
        this.instance = (mongoose.connection.readyState === 1) 
            ? new User(data) 
            : data;
    }

    async save() {
        if (mongoose.connection.readyState === 1) {
            return await this.instance.save();
        } else {
            const newUser = {
                ...this.data,
                _id: Date.now().toString(),
                createdAt: new Date()
            };
            memoryUsers.push(newUser);
            persistMemoryUsers(memoryUsers);
            return newUser;
        }
    }
}

// Static methods
HybridUser.findOne = async (query = {}) => {
    const normalizedQuery = { ...query };
    if (normalizedQuery.email) {
        normalizedQuery.email = normalizeEmail(normalizedQuery.email);
    }

    if (mongoose.connection.readyState === 1) {
        if (normalizedQuery.email) {
            return await User.findOne({ ...query, email: { $regex: `^${String(normalizedQuery.email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
        }
        return await User.findOne(query);
    } else {
        return memoryUsers.find(u => Object.keys(normalizedQuery).every(key => {
            if (key === 'email') {
                return normalizeEmail(u[key]) === normalizedQuery[key];
            }
            return u[key] === normalizedQuery[key];
        }));
    }
};

HybridUser.find = async (query = {}) => {
    const normalizedQuery = { ...query };
    if (normalizedQuery.email) {
        normalizedQuery.email = normalizeEmail(normalizedQuery.email);
    }

    if (mongoose.connection.readyState === 1) {
        if (normalizedQuery.email) {
            return await User.find({ ...query, email: { $regex: `^${String(normalizedQuery.email).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } });
        }
        return await User.find(query);
    } else {
        return memoryUsers.filter(u => Object.keys(normalizedQuery).every(key => {
            if (key === 'email') {
                return normalizeEmail(u[key]) === normalizedQuery[key];
            }
            return u[key] === normalizedQuery[key];
        }));
    }
};

module.exports = HybridUser;

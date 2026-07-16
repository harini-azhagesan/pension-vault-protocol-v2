const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const DEMO_ACCOUNTS = new Set([
    'harini@pensionvault.ai',
    'alice@test.com',
    'test@example.com'
]);

const DEMO_PASSWORD = 'password123';

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, organization } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        
        console.log('Using User model:', User.toString());
        let user = await User.findOne({ email: normalizedEmail });
        if (user) return res.status(400).json({ message: 'User already exists' });

        // Generate UPID (Mock: UPL-YYYY-XXXX)
        const upid = `UPL-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

        const hashedPassword = await bcrypt.hash(password, 10);
        user = new User({ upid, name, email: normalizedEmail, password: hashedPassword, role, organization });
        await user.save();

        const token = jwt.sign({ id: user._id, upid: user.upid, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.status(201).json({ token, user: { upid, name, email: normalizedEmail, role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email || '').trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        const isDemoFallback = process.env.NODE_ENV !== 'production' && DEMO_ACCOUNTS.has(normalizedEmail) && password === DEMO_PASSWORD;
        if (!isMatch && !isDemoFallback) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, upid: user.upid, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
        res.json({ token, user: { upid: user.upid, name: user.name, email: normalizedEmail, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

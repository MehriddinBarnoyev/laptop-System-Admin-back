const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Parol tekshiruvi
        // if (!password || password.length < 8) {
        //     return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        // }

        // Email mavjudmi?
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Parolni hash qilish
        const hashedPassword = await bcrypt.hash(password, 10);

        // Foydalanuvchini bazaga yozish
        const result = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );

        const user = result.rows[0];

        // JWT token yaratish
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Parolni javobdan olib tashlash
        const { password: _, ...userData } = user;

        res.status(201).json({ token, user: userData }, "success register");
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


const login = async (req, res) => {
    console.log(req.body);
    
    const { email, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined');
        }

        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const { password: _, ...userData } = user.rows[0];
        res.status(200).json({ token, user: userData }, "success login");
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

module.exports = { register, login };
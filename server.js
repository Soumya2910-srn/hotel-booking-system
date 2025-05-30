const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/signup', async (req, res) => {
     const { userId, password, name, userType } = req.body;
 
     if (!userId || !password || !name || !userType) {
         console.error('Signup Error: Missing fields');
         return res.status(400).json({ success: false, message: 'All fields are required.' });
     }
 
     // Check if userId already exists
     const checkQuery = `SELECT * FROM users WHERE userId = ?`;
     db.query(checkQuery, [userId], async (err, results) => {
         if (err) {
             console.error('Database Error:', err);
             return res.status(500).json({ success: false, message: 'Database error' });
         }
 
         if (results.length > 0) {
             console.error('Signup Error: User ID already exists');
             return res.status(400).json({ success: false, message: 'User ID already exists.' });
         }
 
         try {
             // Hash password
             const hashedPassword = await bcrypt.hash(password, 10);
             const insertQuery = `INSERT INTO users (userId, password, name, userType) VALUES (?, ?, ?, ?)`;
 
             db.query(insertQuery, [userId, hashedPassword, name, userType], (err) => {
                 if (err) {
                     console.error('Error inserting user into database:', err);
                     return res.status(500).json({ success: false, message: 'Error creating account.' });
                 }
 
                 console.log('User created successfully:', { userId, userType });
                 res.json({ success: true, message: 'Signup successful! You can now log in.' });
             });
 
         } catch (error) {
             console.error('Password Hashing Error:', error);
             res.status(500).json({ success: false, message: 'Error processing request.' });
         }
     });
 });
 
app.post('/login', async (req, res) => {
    const { userId, password, userType } = req.body;

    const query = `SELECT * FROM users WHERE userId = ? AND userType = ?`;
    db.query(query, [userId, userType], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });

        if (results.length > 0) {
            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                res.json({ success: true, message: `${userType} login successful` });
            } else {
                res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

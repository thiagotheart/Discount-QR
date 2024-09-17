const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware to handle JSON requests
app.use(bodyParser.json());

// Middleware to serve static files (client.html, CSS, JS) from /project folder
app.use(express.static(path.join(__dirname, 'project')));

// Set up session for admin login
app.use(session({
    secret: 'admin-secret',
    resave: false,
    saveUninitialized: true
}));

// Set up SQLite Database
let db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create a clients table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT,
    lastName TEXT,
    phone TEXT,
    discountCode TEXT
)`);

// Admin password hash (hash of "yourpassword")
const ADMIN_PASSWORD_HASH = bcrypt.hashSync('yourpassword', 10);

// Serve client.html at the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'project', 'client.html'));
});

app.post('/api/submit', (req, res) => {
    const { firstName, lastName, phone, discountCode } = req.body;

    // Check if the client with this phone number already exists
    db.get(`SELECT * FROM clients WHERE phone = ?`, [phone], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        // If a client is found with this phone number, send a message that they already have a code
        if (row) {
            return res.status(400).json({ message: 'You have already received a discount code.' });
        }

        // If no client exists, insert the new client
        db.run(`INSERT INTO clients (firstName, lastName, phone, discountCode) VALUES (?, ?, ?, ?)`,
            [firstName, lastName, phone, discountCode], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(200).json({ message: 'Thanks for submitting! Enjoy your 10% discount on our services.', code: discountCode });
            }
        );
    });
});


// Admin login API
app.post('/admin/login', (req, res) => {
    const { password } = req.body;

    // Check if the password is correct
    if (bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
        req.session.isAdmin = true; // Set admin session
        res.sendStatus(200); // OK status
    } else {
        res.sendStatus(401); // Unauthorized status
    }
});

// Serve the admin dashboard (protected route)
app.get('/admin/dashboard', (req, res) => {
    if (req.session.isAdmin) {
        res.sendFile(path.join(__dirname, 'project', 'admin.html'));
    } else {
        res.redirect('/admin/login');
    }
});

// Serve the login page for admin
app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'project', 'login.html'));
});

// API to get client data (for the admin dashboard)
app.get('/api/clients', (req, res) => {
    db.all(`SELECT * FROM clients`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows); // Send client data as JSON
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

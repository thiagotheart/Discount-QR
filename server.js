const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // Import path module
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from 'public' folder

// Database setup
const db = new sqlite3.Database('clients.db', (err) => {
    if (err) {
        console.error(err.message);
    }
});

// Create clients table if it doesn't exist, including a timestamp column
db.run(`CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    discountCode TEXT UNIQUE NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// POST endpoint for client data
app.post('/api/clients', (req, res) => {
    const { firstName, lastName, phone, discountCode } = req.body;

    // Validate input
    if (!firstName || !lastName || !phone || !discountCode) {
        return res.status(400).send('All fields are required.');
    }

    // Check if the client already exists
    db.get(`SELECT * FROM clients WHERE phone = ?`, [phone], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        if (row) {
            return res.status(400).send('Client already exists with this phone number.');
        }

        // Insert new client into the database
        db.run(`INSERT INTO clients (firstName, lastName, phone, discountCode) VALUES (?, ?, ?, ?)`,
            [firstName, lastName, phone, discountCode],
            function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Server error');
                }
                res.status(201).send({ message: 'Client added', discountCode });
            }
        );
    });
});

// Get all clients for admin dashboard
app.get('/api/clients', (req, res) => {
    db.all(`SELECT * FROM clients`, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error');
        }
        res.json(rows);
    });
});

// Endpoint to edit a client
app.post('/api/edit', (req, res) => {
    const { id, firstName, lastName, phone } = req.body;
    db.run('UPDATE clients SET firstName = ?, lastName = ?, phone = ? WHERE id = ?', [firstName, lastName, phone, id], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Client updated successfully!' });
    });
});

// Endpoint to delete a client
app.post('/api/delete', (req, res) => {
    const { id } = req.body;
    db.run('DELETE FROM clients WHERE id = ?', id, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Client deleted successfully!' });
    });
});

// Scheduled job to delete clients older than 30 days
setInterval(() => {
    db.run(`DELETE FROM clients WHERE createdAt < DATETIME('now', '-30 days')`, function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log('Deleted clients older than 30 days');
        }
    });
}, 24 * 60 * 60 * 1000); // Runs every 24 hours

// Serve client HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'client.html')); // Serve the client HTML
});

// Serve admin HTML file
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html')); // Serve the admin HTML
});

// Serve thank you HTML file
app.get('/thank-you.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'thank-you.html')); // Serve the thank you HTML
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

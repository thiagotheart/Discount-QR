const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

// Set up the port
const PORT = process.env.PORT || 3000;

// Initialize SQLite database
const db = new sqlite3.Database('./clients.db', (err) => {
    if (err) {
        console.error('Error opening the database', err);
    } else {
        console.log('Connected to the database');
        db.run(`CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT,
            lastName TEXT,
            phone TEXT,
            discountCode TEXT
        )`);
    }
});

// Middleware to parse JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'project')));

// Route to serve the client.html on root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'project', 'client.html'));
});

// Route to serve the admin dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'project', 'admin.html'));
});

// API route to handle client form submissions
app.post('/api/submit', (req, res) => {
    const { firstName, lastName, phone, discountCode } = req.body;

    // Check if the client already exists (by phone number)
    db.get(`SELECT * FROM clients WHERE phone = ?`, [phone], (err, row) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (row) {
            // Client already exists
            res.status(200).json({ message: 'You have already received a discount code.', code: row.discountCode });
        } else {
            // Insert new client into the database
            db.run(`INSERT INTO clients (firstName, lastName, phone, discountCode) VALUES (?, ?, ?, ?)`,
                [firstName, lastName, phone, discountCode],
                function (err) {
                    if (err) {
                        return res.status(500).json({ error: 'Database error' });
                    }
                    res.status(200).json({ message: 'Thanks for submitting, enjoy your 10% discount on our services.', code: discountCode });
                }
            );
        }
    });
});

// Route to get all clients (for admin dashboard)
app.get('/api/clients', (req, res) => {
    db.all(`SELECT * FROM clients`, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json(rows);
    });
});


// API route to edit a client
app.post('/api/edit', (req, res) => {
    const { id, firstName, lastName, phone } = req.body;

    // Update the client information in the database
    db.run(
        `UPDATE clients SET firstName = ?, lastName = ?, phone = ? WHERE id = ?`,
        [firstName, lastName, phone, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(200).json({ message: 'Client information updated successfully.' });
        }
    );
});

// API route to delete a client
app.post('/api/delete', (req, res) => {
    const { id } = req.body;

    // Delete the client from the database
    db.run(`DELETE FROM clients WHERE id = ?`, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(200).json({ message: 'Client deleted successfully.' });
    });
});

// Serve images (e.g., pricing image)
app.get('/path-to-your-image/pricing-image.jpg', (req, res) => {
    res.sendFile(path.join(__dirname, 'project', 'images', 'pricing-image.jpg'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

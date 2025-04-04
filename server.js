const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const cors = require('cors');
app.use(cors()); // 🔓 Tillat forespørsler fra andre domener (som frontend)
const port = 3000;

// 📌 Viktig! Middleware for å håndtere JSON
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Feilsøking: Logg innkommende forespørsler
app.use((req, res, next) => {
    console.log(`Mottatt ${req.method} forespørsel til ${req.url}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Åpne databasen
let db = new sqlite3.Database('./helgomega.db', (err) => {
    if (err) {
        console.error('Feil ved tilkobling til databasen:', err.message);
    } else {
        console.log('Tilkoblet til SQLite-database.');
    }
});

app.get('/', (req, res) => {
    res.send('Velkommen til Helgomega API!');
});

app.get('/kjop/biler', (req, res) => {
    const sql = `SELECT * FROM biler`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// POST: Registrer bruker
app.post('/bruker', (req, res) => {
    console.log("Mottatt body:", req.body); // 📌 Feilsøking

    const { brukernavn, passord, email } = req.body;

    if (!brukernavn || !passord || !email) {
        return res.status(400).json({ error: "Alle felt må fylles ut" });
    }

    const sql = `INSERT INTO brukere (brukernavn, passord, email) VALUES (?, ?, ?)`;
    db.run(sql, [brukernavn, passord, email], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Start serveren
app.listen(port, () => {
    console.log(`Serveren kjører på http://localhost:${port}`);
});


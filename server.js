const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const usersFile = path.join(dataDir, 'users.txt');
const scoresFile = path.join(dataDir, 'scores.txt');

// Ensure files exist
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, '');
if (!fs.existsSync(scoresFile)) fs.writeFileSync(scoresFile, '');

const hashPassword = (password) => crypto.createHash('md5').update(password).digest('hex');

// Read users from file
const getUsers = () => {
    const data = fs.readFileSync(usersFile, 'utf8');
    return data.split('\n').filter(Boolean).map(line => {
        const [username, password] = line.split(':');
        return { username, password };
    });
};

// Rate limiters
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 create account requests per window
    message: { error: 'Too many accounts created from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 20 login requests per window
    message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Register
app.post('/api/register', registerLimiter, (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const users = getUsers();
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: 'Username already exists' });
    }

    const hashed = hashPassword(password);
    fs.appendFileSync(usersFile, `${username}:${hashed}\n`);
    res.json({ success: true, username });
});

// Login
app.post('/api/login', loginLimiter, (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (user && user.password === hashPassword(password)) {
        res.json({ success: true, username });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
});

// Read scores from file
const getScores = () => {
    const data = fs.readFileSync(scoresFile, 'utf8');
    return data.split('\n').filter(Boolean).map(line => {
        const [username, size, time] = line.split(':');
        return { username, size: parseInt(size, 10), time: parseInt(time, 10) };
    });
};

// Get high scores
app.get('/api/scores', (req, res) => {
    const scores = getScores();
    // Group by size, sort by time ascending, get top 10 per size
    const grouped = {};
    [6, 7, 8, 9, 10].forEach(size => grouped[size] = []);
    
    scores.forEach(s => {
        if (grouped[s.size]) {
            grouped[s.size].push(s);
        }
    });

    for (let size in grouped) {
        grouped[size].sort((a, b) => a.time - b.time);
        grouped[size] = grouped[size].slice(0, 10);
    }

    res.json(grouped);
});

// Submit score
app.post('/api/scores', (req, res) => {
    const { username, size, time } = req.body;
    if (!username || !size || time === undefined) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    fs.appendFileSync(scoresFile, `${username}:${size}:${time}\n`);
    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

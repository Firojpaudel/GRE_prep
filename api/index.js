import express from 'express';
import cors from 'cors';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const assetsRoot = path.join(projectRoot, 'public', 'assets');

const previewableExtensions = new Set([
    '.webm', '.mp4', '.ogg', '.mov',
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    '.pdf', '.txt', '.md', '.html'
]);

const normalizePath = (relativePath) => relativePath.split(path.sep).join('/');

const collectAssetEntries = (dirPath, currentRelativePath = '') => {
    if (!fs.existsSync(dirPath)) return [];

    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
        .filter((entry) => !entry.name.startsWith('.'))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

    const files = [];

    for (const entry of entries) {
        const absolutePath = path.join(dirPath, entry.name);
        const relativePath = path.join(currentRelativePath, entry.name);

        if (entry.isDirectory()) {
            files.push(...collectAssetEntries(absolutePath, relativePath));
            continue;
        }

        if (!entry.isFile()) continue;
        
        // Ignore system files like desktop.ini
        if (entry.name.toLowerCase() === 'desktop.ini' || entry.name.toLowerCase() === '.ds_store') continue;

        const ext = path.extname(entry.name).toLowerCase();
        const stat = fs.statSync(absolutePath);
        const webPath = normalizePath(relativePath);

        files.push({
            name: entry.name,
            relativePath: webPath,
            extension: ext,
            sizeBytes: stat.size,
            previewable: previewableExtensions.has(ext),
            isVideo: ['.webm', '.mp4', '.ogg', '.mov'].includes(ext),
            isImage: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext),
            isPdf: ext === '.pdf',
            directUrl: `/assets/${encodeURI(webPath)}`
        });
    }

    return files;
};

if (!process.env.NEON_DATABASE_URL) {
    console.error('Missing NEON_DATABASE_URL environment variable');
}

const sql = neon(process.env.NEON_DATABASE_URL || 'postgresql://user:password@endpoint.neon.tech/gre_prep');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_super_secret_dev_key';

/*
=============================================
NEON DATABASE SCHEMA (Run in SQL Editor)
=============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    high_score INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided' });
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, username, email }
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// 1. Sign Up
app.post('/api/auth/register', async (req, res) => {
    try {
        if (!process.env.NEON_DATABASE_URL) {
            return res.status(503).json({ error: 'Server database is not configured. Set NEON_DATABASE_URL in Vercel environment variables.' });
        }

        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Missing fields' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const result = await sql`
            INSERT INTO users (username, email, password_hash)
            VALUES (${username}, ${email}, ${password_hash})
            RETURNING id, username, email, high_score, longest_streak, user_data;
        `;
        
        const user = result[0];
        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ token, user });
    } catch (err) {
        console.error(err);
        if (err.message.includes('unique constraint')) {
            return res.status(400).json({ error: 'Username or Email already exists' });
        }
        res.status(500).json({ error: 'Database Error' });
    }
});

// 2. Sign In
app.post('/api/auth/login', async (req, res) => {
    try {
        if (!process.env.NEON_DATABASE_URL) {
            return res.status(503).json({ error: 'Server database is not configured. Set NEON_DATABASE_URL in Vercel environment variables.' });
        }

        const { email, password } = req.body;
        const result = await sql`SELECT * FROM users WHERE email = ${email}`;
        
        if (result.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const user = result[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        // Remove password hash from response
        delete user.password_hash;
        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database Error' });
    }
});

// 3. Submit/Update Game Score
app.post('/api/game/score', verifyToken, async (req, res) => {
    try {
        if (!process.env.NEON_DATABASE_URL) {
            return res.status(503).json({ error: 'Server database is not configured. Set NEON_DATABASE_URL in Vercel environment variables.' });
        }

        const { id } = req.user;
        const { score, streak } = req.body;

        const result = await sql`
            UPDATE users
            SET 
                high_score = GREATEST(high_score, ${score}),
                longest_streak = GREATEST(longest_streak, ${streak}),
                last_played = CURRENT_TIMESTAMP
            WHERE id = ${id}
            RETURNING id, username, high_score, longest_streak, user_data;
        `;

        res.json({ user: result[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database Error' });
    }
});

// Update User Data JSON (Progress/Streaks)
app.post('/api/user/data', verifyToken, async (req, res) => {
    try {
        if (!process.env.NEON_DATABASE_URL) {
            return res.status(503).json({ error: 'Server database is not configured. Set NEON_DATABASE_URL in Vercel environment variables.' });
        }

        const { id } = req.user;
        const { user_data } = req.body;

        const result = await sql`
            UPDATE users
            SET user_data = ${user_data}::jsonb
            WHERE id = ${id}
            RETURNING id, username, email, high_score, longest_streak, user_data;
        `;
        
        res.json({ user: result[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database Error' });
    }
});

// 4. Global Leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        if (!process.env.NEON_DATABASE_URL) {
            return res.status(503).json({ error: 'Server database is not configured. Set NEON_DATABASE_URL in Vercel environment variables.' });
        }

        const rows = await sql`
            SELECT username as name, high_score, longest_streak 
            FROM users 
            ORDER BY high_score DESC 
            LIMIT 10;
        `;
        res.json({ leaderboard: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database Error' });
    }
});

// 5. Local Assets Index (for paid resources and software downloads)
app.get('/api/assets', (req, res) => {
    try {
        const assets = collectAssetEntries(assetsRoot);
        res.json({
            root: 'assets',
            count: assets.length,
            assets
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Unable to read assets directory' });
    }
});

// Start server if run directly/locally
if (!process.env.VERCEL) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Development API server running on port ${port}`);
    });
}

export default app;
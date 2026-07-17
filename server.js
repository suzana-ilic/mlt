import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const app = express();
const PORT = Number(process.env.PORT) || 8765;
const TOKEN = process.env.ANALYTICS_TOKEN || 'dev-token-change-in-production';
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'analytics.json');
const MAX_EVENTS = 20000;

app.use(express.json({ limit: '4kb' }));
app.use(express.static(__dirname, { index: 'index.html' }));

function loadStore() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (_) {}
  return { events: [] };
}

function saveStore(store) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2));
}

function referrerHost(referrer) {
  if (!referrer) return 'direct';
  try {
    return new URL(referrer).hostname.replace(/^www\./, '') || 'direct';
  } catch (_) {
    return 'unknown';
  }
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : '';
  const token = bearer || req.query.token || '';
  if (token !== TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

app.post('/api/track', (req, res) => {
  const { path: pagePath, referrer, sessionId } = req.body || {};
  if (!pagePath || typeof pagePath !== 'string' || pagePath.length > 512) {
    return res.status(400).json({ error: 'Invalid path' });
  }
  if (pagePath.indexOf('dashboard') !== -1) {
    return res.status(204).end();
  }

  const store = loadStore();
  store.events.push({
    id: crypto.randomUUID(),
    ts: new Date().toISOString(),
    path: pagePath,
    referrer: typeof referrer === 'string' ? referrer.slice(0, 2048) : null,
    referrerHost: referrerHost(referrer),
    sessionId: typeof sessionId === 'string' ? sessionId.slice(0, 64) : null
  });

  if (store.events.length > MAX_EVENTS) {
    store.events = store.events.slice(-MAX_EVENTS);
  }

  saveStore(store);
  res.status(204).end();
});

app.get('/api/stats', auth, (_req, res) => {
  const store = loadStore();
  const events = store.events;
  const today = new Date().toISOString().slice(0, 10);

  const referrers = {};
  const paths = {};
  const byDay = {};
  const sessions = new Set();
  const sessionsToday = new Set();

  let viewsToday = 0;

  for (const ev of events) {
    const day = ev.ts.slice(0, 10);
    referrers[ev.referrerHost] = (referrers[ev.referrerHost] || 0) + 1;
    paths[ev.path] = (paths[ev.path] || 0) + 1;

    if (!byDay[day]) byDay[day] = { views: 0, sessions: new Set() };
    byDay[day].views += 1;
    if (ev.sessionId) byDay[day].sessions.add(ev.sessionId);

    if (ev.sessionId) sessions.add(ev.sessionId);
    if (day === today) {
      viewsToday += 1;
      if (ev.sessionId) sessionsToday.add(ev.sessionId);
    }
  }

  const daySeries = Object.keys(byDay)
    .sort()
    .slice(-30)
    .map((day) => ({
      day,
      views: byDay[day].views,
      sessions: byDay[day].sessions.size
    }));

  const topReferrers = Object.entries(referrers)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([name, count]) => ({ name, count }));

  const topPaths = Object.entries(paths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  const recent = events
    .slice(-40)
    .reverse()
    .map((ev) => ({
      ts: ev.ts,
      path: ev.path,
      referrerHost: ev.referrerHost
    }));

  res.json({
    totalViews: events.length,
    totalSessions: sessions.size,
    viewsToday,
    sessionsToday: sessionsToday.size,
    topReferrers,
    topPaths,
    daySeries,
    recent
  });
});

const server = app.listen(PORT, () => {
  console.log(`MLT site running at http://localhost:${PORT}`);
  console.log(`Dashboard: http://localhost:${PORT}/dashboard.html`);
  if (TOKEN === 'dev-token-change-in-production') {
    console.log('Warning: set ANALYTICS_TOKEN in .env before deploying.');
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    console.error('Stop the other process, or set a different PORT in .env');
    console.error(`Example: lsof -ti :${PORT} | xargs kill`);
    process.exit(1);
  }
  throw err;
});

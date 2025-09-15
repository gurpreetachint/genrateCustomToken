// index.js
require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// SECURITY: simple rate limiter (tune in prod)
app.use(rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30 // max 30 requests per minute per IP
}));

// Initialize Admin SDK
// Option A: using serviceAccountKey.json file (local dev)
// const serviceAccount = require('./serviceAccountKey.json');
// admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

// Option B: using env var containing file path to service account JSON
const fs = require('fs');
const path = require('path');

let serviceAccount;
try {
  // Check if we have a direct JSON string
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  } 
  // Otherwise, read from the file path
  else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON_PATH) {
    const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_PATH;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    serviceAccount = JSON.parse(fileContent);
  } else {
    console.error('Neither FIREBASE_SERVICE_ACCOUNT_JSON nor FIREBASE_SERVICE_ACCOUNT_JSON_PATH env var is set');
    process.exit(1);
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

// Simple auth middleware: require a server-side secret header
function requireServerSecret(req, res, next) {
  const secret = process.env.SERVER_API_KEY;
  if (!secret) return res.status(500).json({ error: 'Server not configured' });
  const provided = req.header('x-server-key');
  if (!provided || provided !== secret) return res.status(403).json({ error: 'Forbidden' });
  next();
}

/**
 * POST /createCustomToken
 * body: { uid: string, claims?: { ... } }
 * returns: { token: string }
 */
app.post('/createCustomToken', requireServerSecret, async (req, res) => {
  try {
    const { uid, claims } = req.body;
    if (!uid) return res.status(400).json({ error: 'uid required' });

    // create token. `claims` is optional additional developer claims.
    const token = await admin.auth().createCustomToken(uid, claims || undefined);

    // send the token back to trusted caller (client will exchange this for firebase ID token)
    res.json({ token });
  } catch (err) {
    console.error('createCustomToken error', err);
    res.status(500).json({ error: 'failed to create custom token' });
  }
});

// Home route with basic info
app.get('/', (req, res) => {
  res.json({
    name: 'Firebase Token Server',
    version: '1.0.0',
    endpoints: [
      {
        path: '/createCustomToken',
        method: 'POST',
        description: 'Creates a Firebase custom authentication token',
        requires: 'x-server-key header, uid in request body'
      }
    ]
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Token server listening on ${PORT}`));

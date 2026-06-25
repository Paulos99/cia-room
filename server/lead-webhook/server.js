'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const multer = require('multer');

const PORT = Number(process.env.PORT) || 3000;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const API_KEY = process.env.API_KEY || '';

const DATA_DIR = path.join(__dirname, 'data');
const LEADS_DIR = path.join(DATA_DIR, 'leads');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

[DATA_DIR, LEADS_DIR, UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const app = express();

app.use(cors({
  origin: ALLOWED_ORIGIN === '*' ? true : ALLOWED_ORIGIN,
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'X-API-Key', 'Authorization'],
}));

app.use(express.json({ limit: '2mb' }));

function checkApiKey(req, res, next) {
  if (!API_KEY) return next();
  const key = req.get('X-API-Key') || '';
  const auth = req.get('Authorization') || '';
  if (key === API_KEY || auth === 'Bearer ' + API_KEY) return next();
  return res.status(401).json({ ok: false, message: 'Неверный API-ключ' });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^\w.\-()+\s]/g, '_');
      cb(null, Date.now() + '-' + safe);
    },
  }),
  limits: {
    files: 10,
    fileSize: 25 * 1024 * 1024,
  },
});

function saveLeadRecord(record) {
  const filename = (record.requestId || Date.now()) + '.json';
  const filepath = path.join(LEADS_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(record, null, 2), 'utf8');
  return filepath;
}

function handleLead(req, res) {
  try {
    let payload;

    if (req.is('multipart/form-data')) {
      if (!req.body.payload) {
        return res.status(400).json({ ok: false, message: 'Отсутствует поле payload' });
      }
      payload = JSON.parse(req.body.payload);
    } else {
      payload = req.body;
    }

    if (!payload || !payload.requestId) {
      return res.status(400).json({ ok: false, message: 'Некорректный payload: нужен requestId' });
    }

    const files = (req.files || []).map((f) => ({
      originalName: f.originalname,
      savedAs: f.filename,
      size: f.size,
      mimetype: f.mimetype,
      path: f.path,
    }));

    const record = {
      receivedAt: new Date().toISOString(),
      payload,
      files,
    };

    const savedPath = saveLeadRecord(record);
    console.log('[lead]', payload.requestId, 'saved to', savedPath, files.length ? '(' + files.length + ' files)' : '');

    return res.status(201).json({
      ok: true,
      message: 'Заявка принята',
      leadId: payload.requestId,
    });
  } catch (err) {
    console.error('[lead] error:', err);
    return res.status(500).json({ ok: false, message: 'Ошибка обработки заявки' });
  }
}

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'cia-lead-webhook' });
});

app.post('/api/leads', checkApiKey, upload.array('attachments', 10), handleLead);

app.use((_req, res) => {
  res.status(404).json({ ok: false, message: 'Not found' });
});

app.listen(PORT, () => {
  console.log('CIA lead webhook listening on http://localhost:' + PORT);
  console.log('POST /api/leads');
  console.log('CORS origin:', ALLOWED_ORIGIN);
  if (API_KEY) console.log('API key: enabled');
});

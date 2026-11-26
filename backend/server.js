const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, 'encrypted_files');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}.enc`),
});
const upload = multer({ storage });

const vaultDB = {};
const usersDB = {};

function parseDevice(ua = '') {
  let os = 'Desktop System';
  if (/Windows/i.test(ua)) os = 'Windows PC';
  else if (/Mac/i.test(ua)) os = 'MacBook / macOS';
  else if (/Android/i.test(ua)) os = 'Android Device';
  else if (/iPhone|iPad/i.test(ua)) os = 'iOS Device';
  else if (/Linux/i.test(ua)) os = 'Linux Workstation';

  let browser = 'Browser';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Chrome/i.test(ua)) browser = 'Chrome';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua)) browser = 'Safari';

  return `${os} • ${browser}`;
}

function formatDuration(seconds) {
  if (!seconds || seconds < 1) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function wipePhysicalBlob(record, reasonText) {
  if (record.filePath && fs.existsSync(record.filePath)) {
    try {
      fs.unlinkSync(record.filePath);
    } catch (e) {}
  }
  if (!record.destroyed) {
    record.destroyed = true;
    record.destroyReason = reasonText;
    record.logs.push({
      action: reasonText,
      user: 'System Policy',
      device: 'VaultX Engine',
      timestamp: new Date().toLocaleTimeString(),
      severity: 'danger',
    });
  }
}

function checkFileStatus(id) {
  const record = vaultDB[id];
  if (!record) return { valid: false, reason: 'Vault record not found.' };

  if (record.breached) {
    return {
      valid: false,
      reason: 'Access permanently revoked due to security policy violation (Screenshot attempt).',
    };
  }

  if (record.destroyed) {
    return {
      valid: false,
      reason: record.destroyReason || 'This document is no longer available.',
    };
  }

  const now = Date.now();
  if (record.expiresAt && now > record.expiresAt) {
    wipePhysicalBlob(record, 'Link Expired — Encrypted Blob Wiped');
    return { valid: false, reason: 'Link has expired. Encrypted file permanently deleted.' };
  }

  if (record.maxDownloads && record.downloadsCount >= record.maxDownloads) {
    wipePhysicalBlob(record, 'View Limit Reached — Encrypted Blob Wiped');
    return { valid: false, reason: 'Maximum view limit reached. File permanently deleted.' };
  }

  return { valid: true, record };
}

// 0. VAULTX ACCOUNT LOGIN / REGISTER
app.post('/api/auth/login', (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (usersDB[cleanEmail]) {
    if (usersDB[cleanEmail].password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid password for this VaultX account.' });
    }
    return res.json({
      success: true,
      user: { name: usersDB[cleanEmail].name, email: cleanEmail },
    });
  }

  const displayName = (name && name.trim()) || cleanEmail.split('@')[0];
  usersDB[cleanEmail] = { name: displayName, email: cleanEmail, password };
  res.json({
    success: true,
    user: { name: displayName, email: cleanEmail },
  });
});

// 1. UPLOAD ENCRYPTED BLOB
app.post('/api/upload', upload.single('encryptedFile'), (req, res) => {
  try {
    const {
      originalName,
      mimeType,
      iv,
      expiryMinutes,
      maxDownloads,
      passwordHash,
      allowDownload,
      antiCameraMode,
      senderName,
      senderEmail,
    } = req.body;

    const id = uuidv4().slice(0, 8);
    const device = parseDevice(req.headers['user-agent']);
    const senderLabel = senderName ? `${senderName} (${senderEmail})` : 'Authenticated Sender';
    const expiresAt =
      expiryMinutes && Number(expiryMinutes) > 0
        ? Date.now() + Number(expiryMinutes) * 60 * 1000
        : null;

    vaultDB[id] = {
      id,
      filePath: req.file.path,
      originalName,
      mimeType,
      iv,
      expiresAt,
      maxDownloads: maxDownloads && Number(maxDownloads) > 0 ? Number(maxDownloads) : null,
      downloadsCount: 0,
      passwordHash: passwordHash || null,
      allowDownload: allowDownload === 'true',
      antiCameraMode: antiCameraMode === 'true',
      senderLabel,
      destroyed: false,
      breached: false,
      destroyReason: '',
      activeSessionSeconds: 0,
      createdAt: new Date().toLocaleTimeString(),
      logs: [
        {
          action: `Encrypted & Uploaded (${allowDownload === 'true' ? 'Download Enabled' : 'View-Only'})`,
          user: senderLabel,
          device,
          timestamp: new Date().toLocaleTimeString(),
          severity: 'info',
        },
      ],
    };

    res.json({ success: true, fileId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

// 2. GET METADATA & LOG LINK OPEN
app.get('/api/meta/:id', (req, res) => {
  const { id } = req.params;
  const status = checkFileStatus(id);

  if (!status.valid) {
    return res.status(410).json({ success: false, message: status.reason });
  }

  const { record } = status;
  const device = parseDevice(req.headers['user-agent']);
  const viewerName = req.query.viewerName;
  const viewerEmail = req.query.viewerEmail;
  const userLabel = viewerName ? `${viewerName} (${viewerEmail})` : 'Unauthenticated Visitor';

  record.logs.push({
    action: viewerName ? 'Recipient Logged In & Verified Link' : 'Link Opened (Awaiting Login)',
    user: userLabel,
    device,
    timestamp: new Date().toLocaleTimeString(),
    severity: 'info',
  });

  res.json({
    success: true,
    id: record.id,
    originalName: record.originalName,
    mimeType: record.mimeType,
    iv: record.iv,
    senderLabel: record.senderLabel,
    hasPassword: Boolean(record.passwordHash),
    allowDownload: record.allowDownload,
    antiCameraMode: record.antiCameraMode,
    expiresAt: record.expiresAt,
    maxDownloads: record.maxDownloads,
    downloadsCount: record.downloadsCount,
  });
});

// 3. VERIFY PASSWORD & SERVE ENCRYPTED BLOB
app.post('/api/download/:id', (req, res) => {
  const { id } = req.params;
  const { passwordHash, viewerName, viewerEmail } = req.body;
  const status = checkFileStatus(id);

  if (!status.valid) {
    return res.status(410).json({ success: false, message: status.reason });
  }

  const { record } = status;
  const device = parseDevice(req.headers['user-agent']);
  const userLabel = viewerName ? `${viewerName} (${viewerEmail})` : 'Recipient';

  if (record.passwordHash && record.passwordHash !== passwordHash) {
    record.logs.push({
      action: 'Failed Document Password Attempt',
      user: userLabel,
      device,
      timestamp: new Date().toLocaleTimeString(),
      severity: 'warning',
    });
    return res.status(401).json({ success: false, message: 'Incorrect document password!' });
  }

  record.downloadsCount += 1;
  record.logs.push({
    action: `Document Unlocked & Viewing Started (Access #${record.downloadsCount})`,
    user: userLabel,
    device,
    timestamp: new Date().toLocaleTimeString(),
    severity: 'success',
  });

  const fileBuffer = fs.readFileSync(record.filePath);

  if (record.maxDownloads && record.downloadsCount >= record.maxDownloads) {
    wipePhysicalBlob(record, 'Single-Use View Limit Consumed — Server Blob Wiped');
  }

  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(fileBuffer);
});

// 4. HEARTBEAT / SESSION DURATION TRACKER
app.post('/api/heartbeat/:id', (req, res) => {
  const { id } = req.params;
  const { seconds, viewerName, viewerEmail } = req.body;
  const record = vaultDB[id];

  if (!record) return res.json({ success: false });
  if (record.breached) return res.status(403).json({ success: false, breached: true });

  const device = parseDevice(req.headers['user-agent']);
  const userLabel = viewerName ? `${viewerName} (${viewerEmail})` : 'Recipient';
  record.activeSessionSeconds = Number(seconds) || record.activeSessionSeconds;

  const existingIdx = record.logs.findIndex((l) => l.isDurationLog);
  const durationEntry = {
    action: `Active Viewing Duration: ${formatDuration(record.activeSessionSeconds)}`,
    user: userLabel,
    device,
    timestamp: new Date().toLocaleTimeString(),
    severity: 'info',
    isDurationLog: true,
  };

  if (existingIdx !== -1) {
    record.logs[existingIdx] = durationEntry;
  } else {
    record.logs.push(durationEntry);
  }

  res.json({ success: true });
});

// 5. PERMANENT BREACH LOCKOUT ON SCREENSHOT ATTEMPT
app.post('/api/alert/:id', (req, res) => {
  const { id } = req.params;
  const { durationSeconds, viewerName, viewerEmail } = req.body;
  const record = vaultDB[id];
  const device = parseDevice(req.headers['user-agent']);
  const userLabel = viewerName ? `${viewerName} (${viewerEmail})` : 'Recipient';

  if (record && !record.breached) {
    record.breached = true;
    const stayedFor = durationSeconds ? ` (Viewed for ${formatDuration(durationSeconds)})` : '';
    record.logs.push({
      action: `SCREENSHOT ATTEMPTED — Access Permanently Terminated${stayedFor}`,
      user: userLabel,
      device,
      timestamp: new Date().toLocaleTimeString(),
      severity: 'danger',
    });
    wipePhysicalBlob(record, 'File Permanently Locked After Screenshot Violation');
  }

  res.json({ success: true, locked: true });
});

// 6. GET REAL-TIME ACCESS LOGS
app.get('/api/logs/:id', (req, res) => {
  const { id } = req.params;
  const record = vaultDB[id];
  if (!record) {
    return res.json({ success: true, destroyed: true, breached: false, logs: [] });
  }

  if (!record.destroyed && !record.breached) {
    checkFileStatus(id);
  }

  res.json({
    success: true,
    destroyed: record.destroyed,
    breached: record.breached,
    downloadsCount: record.downloadsCount,
    maxDownloads: record.maxDownloads,
    expiresAt: record.expiresAt,
    logs: record.logs,
  });
});

// 7. MANUAL SELF-DESTRUCT
app.delete('/api/destroy/:id', (req, res) => {
  const { id } = req.params;
  const record = vaultDB[id];
  if (record) {
    wipePhysicalBlob(record, 'Sender Triggered Instant Revocation');
  }
  res.json({ success: true, message: 'File permanently destroyed!' });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`VaultX Server running on http://localhost:${PORT}`));
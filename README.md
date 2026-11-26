# VaultX — Zero-Knowledge Ephemeral File Sharing

**Your Files. Your Keys. Your Control.**

VaultX is a zero-knowledge, ephemeral file-sharing web application built with **React**, **Node.js/Express**, and the **Web Crypto API**. Files are encrypted locally inside the sender's browser using **AES-256-GCM** before upload, ensuring the backend server only ever stores unreadable ciphertext while the sender retains complete post-share control.

---

## Key Features

* **Client-Side AES-256-GCM Encryption:** Files are encrypted directly in browser memory using a locally generated 256-bit key and a unique 96-bit initialization vector (IV) before leaving the device.
* **URL Fragment Key Isolation (`#key`):** The decryption key lives strictly inside the URL `#fragment`, which browsers never transmit in HTTP requests—keeping the server completely blind.
* **Dual Identity Authentication Gate:** Both senders and recipients must authenticate with their VaultX identity so every view, session duration, and security event is tied to a verified user.
* **Volatile RAM-Only View Mode (`0-Disk`):** When View-Only mode is active, downloads are disabled and decrypted content is rendered strictly in volatile browser RAM without saving to the local disk.
* **Stealth Anti-Capture & Permanent Breach Lockout:** Detects `PrintScreen`, Snipping Tool overlays, print shortcuts (`Ctrl+P`/`Ctrl+S`), and tab switching—immediately wiping browser RAM, deleting the server blob, and permanently locking the link.
* **Anti-Phone-Camera Spotlight Shield:** Optional peek-hole cursor mask that obscures the document and reveals only a small radius around the pointer to deter full-page external camera capture.
* **Real-Time Forensics & Self-Destruct Controls:** Tracks recipient identity, device/browser fingerprint, login timestamps, and active viewing duration in real time, with automated expiry timers (`1m`–`24h`), burn limits (`1`/`3`/`5`/`∞`), and an instant manual kill-switch.

---

## System Workflow

```text
[Sender Login & Upload] ──► Local AES-256-GCM Encryption ──► Link Split at '#'
                                                               ├─► /share/:id ──► Blind Server (.enc Blob)
                                                               └─► #key       ──► Client Browser Only
                                                                                    │
[Live Logs & Auto-Wipe] ◄── RAM Viewer + Spotlight + Anti-Capture ◄── [Recipient Login & Decrypt]# VaultX

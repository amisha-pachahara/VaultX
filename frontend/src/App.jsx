import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  Upload,
  Copy,
  Check,
  Clock,
  Eye,
  EyeOff,
  FileText,
  AlertTriangle,
  ExternalLink,
  Terminal,
  Flame,
  X,
  Download,
  Ban,
  CameraOff,
  MonitorSmartphone,
  CheckCircle2,
  ShieldX,
  LogOut,
  UserCheck,
  Mail,
  User,
  KeyRound,
  ArrowRight,
  Fingerprint,
  Key,
  ShieldCheck,
  Cpu,
  FolderLock,
  CircleDot,
} from 'lucide-react';
import {
  generateEncryptionKey,
  exportKeyToBase64Url,
  importKeyFromBase64Url,
  encryptFile,
  decryptFile,
  hashPassword,
} from './utils/crypto';

const API_BASE = 'http://localhost:5000/api';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const FLOATING_SYMBOLS = [
  { Icon: Lock, left: '7%', duration: '20s', delay: '0s', size: 20 },
  { Icon: Shield, left: '18%', duration: '25s', delay: '4s', size: 26 },
  { Icon: Key, left: '29%', duration: '22s', delay: '2s', size: 19 },
  { Icon: Fingerprint, left: '41%', duration: '27s', delay: '6s', size: 28 },
  { Icon: EyeOff, left: '54%', duration: '21s', delay: '1.5s', size: 20 },
  { Icon: ShieldCheck, left: '66%', duration: '24s', delay: '5s', size: 24 },
  { Icon: Cpu, left: '77%', duration: '23s', delay: '3s', size: 22 },
  { Icon: Lock, left: '88%', duration: '26s', delay: '7s', size: 19 },
  { Icon: KeyRound, left: '94%', duration: '19s', delay: '2.5s', size: 20 },
];

function FloatingAmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute -bottom-32 -left-24 w-[560px] h-[560px] rounded-full bg-rose-600/20 blur-[150px] animate-glow-slow" />
      <div className="absolute -top-28 right-10 w-[480px] h-[480px] rounded-full bg-pink-600/15 blur-[150px] animate-glow-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[340px] rounded-full bg-fuchsia-900/15 blur-[140px]" />

      {FLOATING_SYMBOLS.map((item, index) => {
        const IconComponent = item.Icon;
        return (
          <div
            key={index}
            style={{
              left: item.left,
              animationDuration: item.duration,
              animationDelay: item.delay,
            }}
            className="absolute bottom-0 text-pink-400/30 animate-float-symbol drop-shadow-[0_0_10px_rgba(236,72,153,0.4)]"
          >
            <IconComponent size={item.size} strokeWidth={1.6} />
          </div>
        );
      })}
    </div>
  );
}

export default function App() {
  const path = window.location.pathname;
  const isShareRoute = path.startsWith('/share/');
  const shareFileId = isShareRoute ? path.split('/share/')[1] : null;

  const storageKey = isShareRoute ? 'vaultx_recipient_user' : 'vaultx_sender_user';
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activePage, setActivePage] = useState(() => {
    if (isShareRoute) return 'recipient';
    return currentUser ? 'workspace' : 'home';
  });

  const handleAuthSuccess = (userObj) => {
    sessionStorage.setItem(storageKey, JSON.stringify(userObj));
    setCurrentUser(userObj);
    if (!isShareRoute) setActivePage('workspace');
  };

  const handleLogout = () => {
    sessionStorage.removeItem(storageKey);
    setCurrentUser(null);
    if (!isShareRoute) setActivePage('home');
  };

  return (
    <div className="min-h-screen bg-[#060508] text-zinc-100 relative selection:bg-pink-500/30">
      <FloatingAmbientBackground />

      <header className="relative z-40 max-w-7xl mx-auto px-5 sm:px-8 pt-6 pb-4">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => {
              if (isShareRoute) {
                window.location.href = '/';
              } else {
                setActivePage('home');
              }
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-105 transition">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-editorial font-bold text-2xl tracking-wide text-white">
              VaultX
            </span>
          </button>

          {!isShareRoute && (
            <nav className="hidden md:flex items-center gap-1.5 bg-[#121016]/90 border border-white/10 backdrop-blur-xl px-2.5 py-1.5 rounded-full shadow-xl">
              <button
                onClick={() => setActivePage('home')}
                className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer ${
                  activePage === 'home'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => setActivePage('features')}
                className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer ${
                  activePage === 'features'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => setActivePage('security')}
                className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition cursor-pointer ${
                  activePage === 'security'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md shadow-pink-500/30'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                Security
              </button>
            </nav>
          )}

          <div className="flex items-center gap-3">
            {!isShareRoute && (
              <>
                <button
                  onClick={() => setActivePage(currentUser ? 'workspace' : 'auth')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition cursor-pointer ${
                    activePage === 'workspace'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg shadow-pink-500/30'
                      : 'bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/40 text-pink-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </button>

                <button
                  onClick={() => setActivePage(currentUser ? 'workspace' : 'auth')}
                  className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-[#141219] hover:bg-zinc-800 border border-white/10 text-zinc-300 transition cursor-pointer"
                >
                  <FolderLock className="w-3.5 h-3.5 text-pink-400" />
                  Active Vault
                </button>
              </>
            )}

            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141219] border border-white/10 text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-zinc-200 font-medium">{currentUser.name}</span>
                </div>

                {isShareRoute && (
                  <a
                    href="/"
                    className="text-xs font-semibold px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white transition"
                  >
                    + Send File
                  </a>
                )}

                <button
                  onClick={handleLogout}
                  title="Log Out"
                  className="p-2 rounded-full bg-[#141219] hover:bg-red-500/15 border border-white/10 hover:border-red-500/40 text-zinc-400 hover:text-red-400 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              !isShareRoute && (
                <div className="flex items-center gap-3 pl-1">
                  <button
                    onClick={() => setActivePage('auth')}
                    className="px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setActivePage('auth')}
                    className="px-5 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-lg shadow-pink-600/30 cursor-pointer transition"
                  >
                    Get Started
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {isShareRoute ? (
          <div className="max-w-6xl mx-auto px-5 py-10">
            {!currentUser ? (
              <VaultXAuthGate role="recipient" onSuccess={handleAuthSuccess} />
            ) : (
              <RecipientPortal fileId={shareFileId} currentUser={currentUser} />
            )}
          </div>
        ) : activePage === 'home' ? (
          <HomeHeroPage
            currentUser={currentUser}
            onStart={() => setActivePage(currentUser ? 'workspace' : 'auth')}
            onExplore={() => setActivePage('features')}
          />
        ) : activePage === 'features' ? (
          <FeaturesPage
            onStart={() => setActivePage(currentUser ? 'workspace' : 'auth')}
          />
        ) : activePage === 'security' ? (
          <SecurityPage
            onStart={() => setActivePage(currentUser ? 'workspace' : 'auth')}
          />
        ) : !currentUser ? (
          <div className="max-w-6xl mx-auto px-5 py-10">
            <VaultXAuthGate
              role="sender"
              onSuccess={handleAuthSuccess}
              onBackHome={() => setActivePage('home')}
            />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-5 py-8">
            <SenderDashboard currentUser={currentUser} />
          </div>
        )}
      </main>
    </div>
  );
}

/* ============================================================================
   PAGE 1: HOME HERO PAGE
============================================================================ */
function HomeHeroPage({ currentUser, onStart, onExplore }) {
  return (
    <section className="max-w-5xl mx-auto px-5 pt-14 sm:pt-20 pb-16 text-center">
      <h1 className="font-editorial text-5xl sm:text-7xl font-bold tracking-normal leading-[1.18] mb-8">
        <span className="bg-gradient-to-r from-rose-300 via-pink-400 to-rose-500 bg-clip-text text-transparent">
          Secure File Sharing
        </span>
        <br />
        <span className="bg-gradient-to-r from-rose-300 via-pink-400 to-rose-500 bg-clip-text text-transparent">
          Redefined
        </span>
      </h1>

      <p className="max-w-xl mx-auto text-zinc-300/90 text-base sm:text-lg leading-[1.75] tracking-wide mb-11">
        Give senders precise control over how files are accessed, stored, and expired. Zero server knowledge. Zero compromises.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-5 mb-20">
        <button
          onClick={onStart}
          className="px-8 py-4 rounded-xl font-semibold text-sm tracking-wide bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-xl shadow-pink-600/30 flex items-center gap-2.5 cursor-pointer transition transform hover:-translate-y-0.5"
        >
          <ArrowRight className="w-4 h-4" />
          {currentUser ? 'Open Vault Workspace' : 'Get Started Free'}
        </button>

        <button
          onClick={onExplore}
          className="px-8 py-4 rounded-xl font-semibold text-sm tracking-wide bg-[#141218]/90 hover:bg-zinc-800/90 border border-white/15 text-zinc-200 flex items-center gap-2.5 cursor-pointer transition"
        >
          <CircleDot className="w-4 h-4 text-pink-400" />
          Explore Features
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-[#120f16]/85 border border-white/10 backdrop-blur-xl rounded-2xl py-9 px-8 shadow-2xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          <div className="pt-2 sm:pt-0 space-y-2">
            <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-300 via-orange-300 to-pink-400 bg-clip-text text-transparent">
              AES-256
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 tracking-wide">
              Client-Side Encryption
            </p>
          </div>

          <div className="pt-6 sm:pt-0 space-y-2">
            <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-300 via-pink-400 to-rose-500 bg-clip-text text-transparent">
              100%
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 tracking-wide">
              Zero-Knowledge Privacy
            </p>
          </div>

          <div className="pt-6 sm:pt-0 space-y-2">
            <div className="text-3xl sm:text-4xl font-extrabold text-amber-300">
              0-Disk
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 tracking-wide">
              RAM-Only View Mode
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   PAGE 2: FEATURES PAGE
============================================================================ */
function FeaturesPage({ onStart }) {
  return (
    <section className="max-w-6xl mx-auto px-5 pt-12 pb-20">
      <div className="text-center mb-14 space-y-3">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-pink-400">
          Platform Capabilities
        </span>
        <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-white leading-tight">
          Total Control Even After Hitting Send
        </h2>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
          Every transfer is protected by client-side cryptography, volatile memory rendering, and live recipient forensics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-7 mb-14">
        <div className="bg-[#120f16]/85 border border-white/10 hover:border-pink-500/40 rounded-2xl p-8 backdrop-blur-md transition space-y-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-pink-400" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            URL Fragment Key Isolation
          </h3>
          <p className="text-sm text-zinc-400 leading-[1.75]">
            Your 256-bit decryption key stays inside the <span className="text-pink-300 font-mono">#fragment</span> of the link and never reaches our servers. Even a server breach exposes only unreadable ciphertext.
          </p>
        </div>

        <div className="bg-[#120f16]/85 border border-white/10 hover:border-rose-500/40 rounded-2xl p-8 backdrop-blur-md transition space-y-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            Stealth Screenshot Lockout
          </h3>
          <p className="text-sm text-zinc-400 leading-[1.75]">
            Zero prior warnings tipped off to the recipient. The instant PrintScreen or tab switching occurs, RAM is wiped and the link permanently self-destructs.
          </p>
        </div>

        <div className="bg-[#120f16]/85 border border-white/10 hover:border-amber-500/40 rounded-2xl p-8 backdrop-blur-md transition space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <MonitorSmartphone className="w-5 h-5 text-amber-300" />
          </div>
          <h3 className="text-lg font-bold text-white tracking-wide">
            Live Forensics & Spotlight Shield
          </h3>
          <p className="text-sm text-zinc-400 leading-[1.75]">
            Track authenticated recipient identity, device OS, exact viewing duration, and security alerts live—plus enable Spotlight mode to prevent full-screen phone camera photos.
          </p>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onStart}
          className="px-8 py-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-xl shadow-pink-600/30 inline-flex items-center gap-2.5 cursor-pointer transition"
        >
          <ArrowRight className="w-4 h-4" />
          Try VaultX Now
        </button>
      </div>
    </section>
  );
}

/* ============================================================================
   PAGE 3: SECURITY PAGE
============================================================================ */
function SecurityPage({ onStart }) {
  return (
    <section className="max-w-5xl mx-auto px-5 pt-12 pb-20 space-y-10">
      <div className="text-center space-y-3">
        <span className="text-xs font-mono uppercase tracking-[0.2em] text-pink-400">
          Zero-Knowledge Cryptographic Model
        </span>
        <h2 className="font-editorial text-3xl sm:text-5xl font-bold text-white">
          How VaultX Protects Your Data
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-[#120f16]/85 border border-white/10 rounded-2xl p-7 space-y-2.5">
          <span className="text-xs font-mono text-pink-400">LAYER 01</span>
          <h3 className="text-lg font-bold text-white">Web Crypto AES-256-GCM</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Encryption happens 100% locally in browser memory with a unique 96-bit random IV per file before any network packet leaves your device.
          </p>
        </div>

        <div className="bg-[#120f16]/85 border border-white/10 rounded-2xl p-7 space-y-2.5">
          <span className="text-xs font-mono text-pink-400">LAYER 02</span>
          <h3 className="text-lg font-bold text-white">Mandatory Dual Identity Gate</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Both sender and recipient must sign in with their VaultX identity—every view, duration heartbeat, and violation is tied to a verified user profile.
          </p>
        </div>

        <div className="bg-[#120f16]/85 border border-white/10 rounded-2xl p-7 space-y-2.5">
          <span className="text-xs font-mono text-pink-400">LAYER 03</span>
          <h3 className="text-lg font-bold text-white">Zero-Disk RAM Rendering</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            In View-Only mode, decrypted bytes never touch the recipient’s Downloads folder—they exist solely in volatile browser memory until closed or expired.
          </p>
        </div>

        <div className="bg-[#120f16]/85 border border-white/10 rounded-2xl p-7 space-y-2.5">
          <span className="text-xs font-mono text-pink-400">LAYER 04</span>
          <h3 className="text-lg font-bold text-white">Instant Breach Revocation</h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            If a recipient attempts PrintScreen or switches tabs away from a protected document, the server unlinks the encrypted blob and locks the link forever.
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <button
          onClick={onStart}
          className="px-8 py-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-xl shadow-pink-600/30 inline-flex items-center gap-2.5 cursor-pointer transition"
        >
          <Lock className="w-4 h-4" />
          Launch Secure Vault
        </button>
      </div>
    </section>
  );
}

/* ============================================================================
   VAULTX LOGIN GATE (REQUIRED FOR BOTH SENDER & RECIPIENT)
============================================================================ */
function VaultXAuthGate({ role, onSuccess, onBackHome }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Authentication failed.');
      } else {
        onSuccess(data.user);
      }
    } catch (err) {
      setError('Cannot reach VaultX server on port 5000.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6">
      <div className="bg-[#120f16]/90 border border-pink-500/30 backdrop-blur-xl rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 border border-pink-500/40 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6 text-pink-400" />
          </div>
          <span className="inline-block text-[10px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/30">
            {role === 'recipient' ? 'Recipient Identity Verification' : 'Sender Workspace Login'}
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-white">
            {role === 'recipient'
              ? 'Sign in to View File'
              : isRegisterMode
              ? 'Create VaultX Account'
              : 'Sign in to VaultX'}
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {role === 'recipient'
              ? 'Your VaultX identity is logged in the sender’s audit trail before decryption.'
              : 'Authenticate to encrypt files, generate self-destructing links, and monitor live access logs.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(isRegisterMode || role === 'recipient') && (
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required={isRegisterMode}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kanika Jha"
                  className="w-full bg-zinc-950/90 border border-zinc-800 focus:border-pink-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-zinc-950/90 border border-zinc-800 focus:border-pink-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
              Account Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950/90 border border-zinc-800 focus:border-pink-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/30 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-lg shadow-pink-600/25 transition cursor-pointer"
          >
            {submitting
              ? 'Authenticating...'
              : role === 'recipient'
              ? 'Continue to Encrypted Vault'
              : isRegisterMode
              ? 'Create Account & Enter'
              : 'Sign In to VaultX'}
          </button>
        </form>

        <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
            }}
            className="text-zinc-400 hover:text-pink-400 transition cursor-pointer"
          >
            {isRegisterMode ? 'Already have an account? Sign In' : 'Create new account'}
          </button>

          {onBackHome && (
            <button
              type="button"
              onClick={onBackHome}
              className="text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
            >
              ← Back to Home
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   VIEW 1: SENDER DASHBOARD
============================================================================ */
function SenderDashboard({ currentUser }) {
  const [file, setFile] = useState(null);
  const [expiryMinutes, setExpiryMinutes] = useState(5);
  const [maxViews, setMaxViews] = useState(1);
  const [allowDownload, setAllowDownload] = useState(false);
  const [antiCameraMode, setAntiCameraMode] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [encryptStep, setEncryptStep] = useState(0);
  const [vaultResult, setVaultResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const [logs, setLogs] = useState([]);
  const [destroyed, setDestroyed] = useState(false);
  const [breached, setBreached] = useState(false);
  const [viewsCount, setViewsCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState('');

  const fileInputRef = useRef(null);

  const handleEncryptAndUpload = async () => {
    if (!file) return;
    try {
      setEncryptStep(1);
      const key = await generateEncryptionKey();
      const exportedKey = await exportKeyToBase64Url(key);

      setEncryptStep(2);
      const { encryptedBlob, ivBase64, ciphertextHexPreview } = await encryptFile(file, key);
      const hashedPwd = await hashPassword(password);

      setEncryptStep(3);
      const formData = new FormData();
      formData.append('encryptedFile', encryptedBlob, 'encrypted.bin');
      formData.append('originalName', file.name);
      formData.append('mimeType', file.type || 'application/octet-stream');
      formData.append('iv', ivBase64);
      formData.append('expiryMinutes', expiryMinutes);
      formData.append('maxDownloads', maxViews);
      formData.append('passwordHash', hashedPwd);
      formData.append('allowDownload', String(allowDownload));
      formData.append('antiCameraMode', String(antiCameraMode));
      formData.append('senderName', currentUser.name);
      formData.append('senderEmail', currentUser.email);

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        const shareUrl = `${window.location.origin}/share/${data.fileId}#${exportedKey}`;
        setVaultResult({
          fileId: data.fileId,
          shareUrl,
          exportedKey,
          ivBase64,
          ciphertextHexPreview,
          originalName: file.name,
          originalSize: file.size,
          expiresAt: Date.now() + expiryMinutes * 60 * 1000,
          maxViews,
          allowDownload,
          antiCameraMode,
          hasPassword: Boolean(password),
        });
        setDestroyed(false);
        setBreached(false);
        setViewsCount(0);
      }
    } catch (err) {
      alert('Error encrypting/uploading file. Make sure backend is running on port 5000!');
      console.error(err);
    } finally {
      setEncryptStep(0);
    }
  };

  useEffect(() => {
    if (!vaultResult?.fileId) return;

    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API_BASE}/logs/${vaultResult.fileId}`);
        const data = await res.json();
        if (data.success) {
          setLogs(data.logs || []);
          setDestroyed(Boolean(data.destroyed));
          setBreached(Boolean(data.breached));
          if (typeof data.downloadsCount === 'number') {
            setViewsCount(data.downloadsCount);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 1500);
    return () => clearInterval(interval);
  }, [vaultResult]);

  useEffect(() => {
    if (!vaultResult?.expiresAt || destroyed || breached) return;
    const timer = setInterval(() => {
      const diff = vaultResult.expiresAt - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00');
        setDestroyed(true);
        clearInterval(timer);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      }
    }, 500);
    return () => clearInterval(timer);
  }, [vaultResult, destroyed, breached]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(vaultResult.shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualDestroy = async () => {
    if (!vaultResult?.fileId) return;
    await fetch(`${API_BASE}/destroy/${vaultResult.fileId}`, { method: 'DELETE' });
    setDestroyed(true);
  };

  const resetAll = () => {
    setFile(null);
    setVaultResult(null);
    setLogs([]);
    setPassword('');
    setDestroyed(false);
    setBreached(false);
  };

  if (!vaultResult) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-9 space-y-3">
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold tracking-wide text-white">
            Encrypt & Share Confidential Files
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-lg mx-auto">
            Client-side <span className="text-pink-400 font-mono">AES-256-GCM</span> encryption with verified recipient login, viewing duration logs, and screenshot lockout.
          </p>
        </div>

        <div className="bg-[#120f16]/85 border border-white/10 backdrop-blur-xl rounded-2xl p-7 shadow-2xl space-y-7">
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-zinc-700 hover:border-pink-500/70 bg-zinc-950/60 rounded-xl p-9 text-center cursor-pointer transition group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            {file ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3 rounded-full bg-pink-500/15 border border-pink-500/30 mb-1">
                  <FileText className="w-8 h-8 text-pink-400" />
                </div>
                <p className="font-semibold text-white text-lg break-all">{file.name}</p>
                <p className="text-xs font-mono text-zinc-400">
                  {formatBytes(file.size)} • {file.type || 'Binary File'}
                </p>
                <span className="pt-1 text-xs text-pink-400 underline">Click to change file</span>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="p-3.5 rounded-full bg-zinc-800/80 group-hover:bg-pink-500/15 transition mb-1">
                  <Upload className="w-8 h-8 text-zinc-400 group-hover:text-pink-400 transition" />
                </div>
                <p className="font-medium text-zinc-200">Drop sensitive document here or click to browse</p>
                <p className="text-xs text-zinc-500">PDF, Images, Text, Blueprints — encrypted locally before upload</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2.5">
              <Shield className="w-3.5 h-3.5 inline mr-1.5 text-pink-400" />
              Recipient Access Permission
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setAllowDownload(false)}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  !allowDownload
                    ? 'bg-pink-500/10 border-pink-500/60 text-white'
                    : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-pink-400">
                    <Eye className="w-4 h-4" />
                    Option 1: View-Only Mode
                  </span>
                  {!allowDownload && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300">ACTIVE</span>}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Opens in browser viewer. Download button shown as <span className="text-red-400 font-semibold">Unavailable</span>.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAllowDownload(true)}
                className={`p-4 rounded-xl border text-left transition cursor-pointer ${
                  allowDownload
                    ? 'bg-emerald-500/10 border-emerald-500/60 text-white'
                    : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-400">
                    <Download className="w-4 h-4" />
                    Option 2: View & Download
                  </span>
                  {allowDownload && <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">ACTIVE</span>}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Recipient can both preview in browser and save file locally.
                </p>
              </button>
            </div>
          </div>

          <div
            onClick={() => setAntiCameraMode(!antiCameraMode)}
            className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition ${
              antiCameraMode
                ? 'bg-pink-500/15 border-pink-500/60'
                : 'bg-zinc-950/80 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <CameraOff className={`w-5 h-5 shrink-0 ${antiCameraMode ? 'text-pink-400' : 'text-zinc-500'}`} />
              <div>
                <p className="text-xs font-bold text-zinc-200 mb-0.5">
                  Anti-Phone-Camera Spotlight Shield (Peek-Hole Mode)
                </p>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Move cursor over the document to reveal a spotlight circle—prevents full-screen phone photos.
                </p>
              </div>
            </div>
            <span className={`text-[10px] font-mono px-2.5 py-1 rounded ${antiCameraMode ? 'bg-pink-600 text-white font-bold' : 'bg-zinc-800 text-zinc-400'}`}>
              {antiCameraMode ? 'ON' : 'OFF'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                <Clock className="w-3.5 h-3.5 inline mr-1.5 text-amber-300" />
                Self-Destruct Timer
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '1m', val: 1 },
                  { label: '5m', val: 5 },
                  { label: '1h', val: 60 },
                  { label: '24h', val: 1440 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setExpiryMinutes(item.val)}
                    className={`py-2 rounded-lg text-xs font-mono border transition cursor-pointer ${
                      expiryMinutes === item.val
                        ? 'bg-pink-600/20 border-pink-500 text-pink-300 font-semibold'
                        : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
                <Eye className="w-3.5 h-3.5 inline mr-1.5 text-pink-400" />
                Max Access Limit
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '1 (Burn)', val: 1 },
                  { label: '3', val: 3 },
                  { label: '5', val: 5 },
                  { label: '∞', val: 0 },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setMaxViews(item.val)}
                    className={`py-2 rounded-lg text-xs font-mono border transition cursor-pointer ${
                      maxViews === item.val
                        ? 'bg-rose-600/20 border-rose-500 text-rose-300 font-semibold'
                        : 'bg-zinc-950/80 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2">
              <Lock className="w-3.5 h-3.5 inline mr-1.5 text-amber-300" />
              Optional Document Password (SHA-256 Hashed)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank for account-only decryption..."
                className="w-full bg-zinc-950/80 border border-zinc-800 focus:border-pink-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            disabled={!file || encryptStep > 0}
            onClick={handleEncryptAndUpload}
            className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-lg shadow-pink-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            {encryptStep === 0 && (
              <>
                <Lock className="w-4 h-4" />
                Encrypt Locally & Generate Zero-Knowledge Link
              </>
            )}
            {encryptStep === 1 && 'Step 1/3: Generating 256-bit AES Key in Browser...'}
            {encryptStep === 2 && 'Step 2/3: Encrypting File Locally (AES-GCM)...'}
            {encryptStep === 3 && 'Step 3/3: Uploading Blind Ciphertext Blob...'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#120f16]/90 border border-white/10 backdrop-blur-xl rounded-2xl p-5">
        <div className="flex items-center gap-3.5">
          <div
            className={`p-2.5 rounded-xl ${
              breached
                ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                : destroyed
                ? 'bg-amber-500/10 text-amber-400'
                : 'bg-emerald-500/10 text-emerald-400'
            }`}
          >
            {breached ? <ShieldX className="w-6 h-6" /> : destroyed ? <Flame className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="font-bold text-lg text-white flex items-center gap-2.5">
              {vaultResult.originalName}
              <span
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full ${
                  breached
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : destroyed
                    ? 'bg-zinc-800 text-zinc-400'
                    : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {breached ? 'BREACH LOCKED' : destroyed ? 'WIPED / EXPIRED' : vaultResult.allowDownload ? 'DOWNLOAD ALLOWED' : 'VIEW-ONLY LOCKED'}
              </span>
            </h2>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Vault ID: {vaultResult.fileId} • Size: {formatBytes(vaultResult.originalSize)} • Accesses: {viewsCount}/{vaultResult.maxViews || '∞'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!destroyed && !breached && (
            <div className="px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-sm text-amber-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {timeLeft || `${vaultResult.expiryMinutes}:00`}
            </div>
          )}
          <button
            onClick={resetAll}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white transition cursor-pointer"
          >
            + New Transfer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#120f16]/85 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-wider text-pink-400 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Zero-Knowledge Shareable Link
            </h3>

            <div className="flex items-center gap-2.5">
              <input
                type="text"
                readOnly
                value={vaultResult.shareUrl}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-300 outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <a
                href={vaultResult.shareUrl}
                target="_blank"
                rel="noreferrer"
                title="Open Recipient View in New Tab"
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-pink-300 transition shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300">
                  Sent to Server
                </span>
                <p className="font-mono text-xs text-zinc-300 mt-1.5 truncate">
                  /share/{vaultResult.fileId}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Identifies encrypted blob only.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-pink-500/30">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-pink-500/15 text-pink-300">
                  Never Sent to Server (# Fragment)
                </span>
                <p className="font-mono text-xs text-pink-300 mt-1.5 truncate">
                  #{vaultResult.exportedKey}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">256-bit key stays strictly in client URL.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#120f16]/85 border border-white/10 backdrop-blur-xl rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Server Storage Inspector (Zero-Knowledge Proof)
              </h3>
              <span className="text-[11px] font-mono text-zinc-500">IV: {vaultResult.ivBase64.slice(0, 12)}...</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Below is the actual raw ciphertext received and stored by the backend server. Without the URL fragment key, this data is mathematically unreadable:
            </p>
            <div className="bg-black/80 border border-zinc-800 rounded-xl p-4 font-mono text-[11px] text-emerald-400/90 leading-relaxed break-all">
              {vaultResult.ciphertextHexPreview} ... [ENCRYPTED AES-256-GCM BLOB]
            </div>
          </div>
        </div>

        {/* Right Column: Color-Coded Interactive Device & User Audit Logs */}
        <div className="lg:col-span-5 bg-[#120f16]/85 border border-white/10 backdrop-blur-xl rounded-2xl p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800">
              <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-200 flex items-center gap-2">
                <MonitorSmartphone className="w-4 h-4 text-pink-400" />
                Live Recipient & Security Logs
              </h3>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {logs.map((log, idx) => {
                const isDanger =
                  log.severity === 'danger' ||
                  log.action.includes('SCREENSHOT') ||
                  log.action.includes('Locked') ||
                  log.action.includes('Revocation') ||
                  log.action.includes('Failed');

                const isViewingSuccess =
                  log.severity === 'success' ||
                  log.action.includes('Unlocked') ||
                  log.action.includes('Viewing Started');

                let cardStyle = 'bg-zinc-950/90 border-zinc-800 hover:border-zinc-700';
                let titleColor = 'text-white';
                let badge = (
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                    INFO
                  </span>
                );

                if (isDanger) {
                  cardStyle = 'bg-red-950/40 border-red-500/60 shadow-sm shadow-red-500/10';
                  titleColor = 'text-red-400';
                  badge = (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                      ALERT
                    </span>
                  );
                } else if (isViewingSuccess) {
                  cardStyle = 'bg-emerald-950/30 border-emerald-500/50 shadow-sm shadow-emerald-500/10';
                  titleColor = 'text-emerald-400';
                  badge = (
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      VIEWING
                    </span>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all duration-200 flex items-start justify-between gap-3 ${cardStyle}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {badge}
                        <p className={`text-xs font-semibold leading-snug ${titleColor}`}>
                          {log.action}
                        </p>
                      </div>
                      <p className="text-[11px] font-mono text-pink-300/90">
                        User: {log.user || 'Verified User'}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-500">
                        Device: {log.device || 'Client'}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400 shrink-0 bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800">
                      {log.timestamp}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {!destroyed && !breached && (
            <button
              onClick={handleManualDestroy}
              className="w-full py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-400 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Flame className="w-4 h-4" />
              Trigger Instant Self-Destruct (Wipe File Now)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   VIEW 2: RECIPIENT PORTAL (BUG-FREE SCREENSHOT LOCK + SPOTLIGHT CURSOR)
============================================================================ */
function RecipientPortal({ fileId, currentUser }) {
  const [meta, setMeta] = useState(null);
  const [errorReason, setErrorReason] = useState('');
  const [loading, setLoading] = useState(true);

  const [passwordInput, setPasswordInput] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [decrypting, setDecrypting] = useState(false);

  const [viewerUrl, setViewerUrl] = useState(null);
  const [textContent, setTextContent] = useState('');
  const [viewerTimeLeft, setViewerTimeLeft] = useState('');
  const [downloadToast, setDownloadToast] = useState('');

  const [permanentlyLocked, setPermanentlyLocked] = useState(false);
  const lockedRef = useRef(false);
  const secondsViewedRef = useRef(0);
  const [mousePos, setMousePos] = useState({ x: 350, y: 240 });

  const rawHashKey = window.location.hash.replace('#', '');

  useEffect(() => {
    if (!rawHashKey) {
      setErrorReason('Missing decryption key in URL fragment (#key). Decryption is impossible without the full link.');
      setLoading(false);
      return;
    }

    const fetchMetadata = async () => {
      try {
        const params = new URLSearchParams({
          viewerName: currentUser.name,
          viewerEmail: currentUser.email,
        });
        const res = await fetch(`${API_BASE}/meta/${fileId}?${params.toString()}`);
        const data = await res.json();
        if (!res.ok || !data.success) {
          setErrorReason(data.message || 'This secure link has expired or been permanently terminated.');
        } else {
          setMeta(data);
        }
      } catch (err) {
        setErrorReason('Unable to reach VaultX server. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [fileId, rawHashKey, currentUser]);

  useEffect(() => {
    if (!viewerUrl || permanentlyLocked) return;

    const heartbeat = setInterval(() => {
      secondsViewedRef.current += 3;
      fetch(`${API_BASE}/heartbeat/${fileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seconds: secondsViewedRef.current,
          viewerName: currentUser.name,
          viewerEmail: currentUser.email,
        }),
      }).catch(() => {});
    }, 3000);

    return () => clearInterval(heartbeat);
  }, [viewerUrl, permanentlyLocked, fileId, currentUser]);

  useEffect(() => {
    if (!viewerUrl || !meta || meta.allowDownload || permanentlyLocked) return;

    const terminateSessionPermanently = (reason) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      setPermanentlyLocked(true);

      URL.revokeObjectURL(viewerUrl);
      setViewerUrl(null);
      setTextContent('');
      setMeta(null);
      setErrorReason('Security violation detected: Screen capture attempted. Access has been permanently revoked and the sender has been notified.');

      if (navigator.clipboard) {
        navigator.clipboard.writeText('').catch(() => {});
      }

      fetch(`${API_BASE}/alert/${fileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertType: reason,
          durationSeconds: secondsViewedRef.current,
          viewerName: currentUser.name,
          viewerEmail: currentUser.email,
        }),
      }).catch(() => {});
    };

    const handleKeyDown = (e) => {
      if (
        e.key === 'PrintScreen' ||
        e.code === 'PrintScreen' ||
        (e.ctrlKey && (e.key === 'p' || e.key === 'P' || e.key === 's' || e.key === 'S')) ||
        (e.metaKey && e.shiftKey)
      ) {
        e.preventDefault();
        terminateSessionPermanently('Screenshot / Print Shortcut');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        terminateSessionPermanently('Tab Switch / Window Hidden');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [viewerUrl, meta, permanentlyLocked, fileId, currentUser]);

  useEffect(() => {
    if (!viewerUrl || !meta?.expiresAt || permanentlyLocked) return;

    const timer = setInterval(() => {
      const diff = meta.expiresAt - Date.now();
      if (diff <= 0) {
        URL.revokeObjectURL(viewerUrl);
        setViewerUrl(null);
        setTextContent('');
        setErrorReason('Session expired! Decrypted file wiped from browser memory.');
        clearInterval(timer);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setViewerTimeLeft(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      if (viewerUrl) URL.revokeObjectURL(viewerUrl);
    };
  }, [viewerUrl, meta, permanentlyLocked]);

  const handleDecryptAndOpen = async () => {
    if (lockedRef.current || permanentlyLocked) return;
    setPwdError('');
    setDecrypting(true);

    try {
      const hashedPwd = meta.hasPassword ? await hashPassword(passwordInput) : '';

      const res = await fetch(`${API_BASE}/download/${fileId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passwordHash: hashedPwd,
          viewerName: currentUser.name,
          viewerEmail: currentUser.email,
        }),
      });

      if (res.status === 401) {
        setPwdError('Incorrect document password! Access denied.');
        setDecrypting(false);
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setErrorReason(errData.message || 'File expired or access limit reached.');
        setMeta(null);
        setDecrypting(false);
        return;
      }

      const encryptedArrayBuffer = await res.arrayBuffer();
      const cryptoKey = await importKeyFromBase64Url(rawHashKey);
      const restoredBlob = await decryptFile(
        encryptedArrayBuffer,
        cryptoKey,
        meta.iv,
        meta.mimeType
      );

      if (meta.mimeType.startsWith('text/') || meta.originalName.endsWith('.txt') || meta.originalName.endsWith('.md')) {
        const txt = await restoredBlob.text();
        setTextContent(txt);
      }
      secondsViewedRef.current = 0;
      const objectUrl = URL.createObjectURL(restoredBlob);
      setViewerUrl(objectUrl);
    } catch (err) {
      console.error(err);
      setPwdError('Decryption failed! The URL key may be corrupted.');
    } finally {
      setDecrypting(false);
    }
  };

  const handleSaveToDevice = () => {
    if (!meta.allowDownload || !viewerUrl) return;
    const a = document.createElement('a');
    a.href = viewerUrl;
    a.download = meta.originalName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setDownloadToast('File saved to your device!');
    setTimeout(() => setDownloadToast(''), 3000);
  };

  const handleCloseAndWipeMemory = () => {
    if (viewerUrl) URL.revokeObjectURL(viewerUrl);
    setViewerUrl(null);
    setTextContent('');
    setErrorReason('Secure session closed. Decrypted file permanently wiped from RAM.');
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-mono text-zinc-400">Verifying zero-knowledge vault status...</p>
      </div>
    );
  }

  if (errorReason || permanentlyLocked) {
    return (
      <div className="max-w-lg mx-auto bg-red-950/30 border border-red-500/50 backdrop-blur-xl rounded-2xl p-8 text-center space-y-4 mt-8 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/40 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <span className="inline-block text-xs font-mono uppercase px-3 py-1 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
          ACCESS TERMINATED • PERMANENTLY LOCKED
        </span>
        <h2 className="text-2xl font-bold text-white">File Permanently Unavailable</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">{errorReason}</p>
      </div>
    );
  }

  if (viewerUrl) {
    const isPdf = meta.mimeType === 'application/pdf' || meta.originalName.toLowerCase().endsWith('.pdf');
    const isImage = meta.mimeType.startsWith('image/');

    return (
      <div
        onContextMenu={(e) => !meta.allowDownload && e.preventDefault()}
        className="max-w-5xl mx-auto bg-[#120f16]/95 border border-pink-500/40 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl select-none"
      >
        <div className="bg-zinc-950 border-b border-zinc-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {meta.originalName}
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  DECRYPTED IN RAM
                </span>
              </h3>
              <p className="text-[11px] font-mono text-zinc-400">
                Shared by {meta.senderLabel || 'VaultX Sender'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {viewerTimeLeft && (
              <span className="text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-amber-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {viewerTimeLeft}
              </span>
            )}

            {meta.allowDownload ? (
              <button
                onClick={handleSaveToDevice}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
              >
                <Download className="w-4 h-4" />
                Download File
              </button>
            ) : (
              <button
                disabled
                className="px-3.5 py-1.5 rounded-lg bg-zinc-900 border border-red-500/40 text-red-400/90 text-xs font-mono flex items-center gap-1.5 cursor-not-allowed opacity-85"
              >
                <Ban className="w-3.5 h-3.5" />
                Download Unavailable
              </button>
            )}

            <button
              onClick={handleCloseAndWipeMemory}
              className="px-3.5 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
            >
              <X className="w-4 h-4" />
              Close & Wipe
            </button>
          </div>
        </div>

        {downloadToast && (
          <div className="bg-emerald-500/15 border-b border-emerald-500/30 px-5 py-2 text-xs text-emerald-300 font-mono text-center">
            {downloadToast}
          </div>
        )}

        <div
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
          }}
          onTouchMove={(e) => {
            if (e.touches?.[0]) {
              const rect = e.currentTarget.getBoundingClientRect();
              setMousePos({ x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top });
            }
          }}
          className="relative bg-zinc-950 min-h-[72vh] flex items-center justify-center p-4 overflow-hidden cursor-crosshair"
        >
          {meta.antiCameraMode && (
            <div
              style={{
                background: `radial-gradient(circle 135px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, rgba(6, 5, 8, 0.97) 100%)`,
              }}
              className="pointer-events-none absolute inset-0 z-20 transition-none"
            />
          )}

          {isPdf && (
            <iframe
              src={meta.allowDownload ? viewerUrl : `${viewerUrl}#toolbar=0&navpanes=0`}
              title="VaultX Secure PDF Viewer"
              className={`w-full h-[72vh] rounded-xl border border-zinc-800 bg-white ${
                meta.antiCameraMode ? 'pointer-events-none' : ''
              }`}
            />
          )}

          {isImage && (
            <img
              src={viewerUrl}
              alt="Decrypted Vault Content"
              draggable={false}
              className="max-h-[70vh] rounded-xl object-contain shadow-lg pointer-events-none"
            />
          )}

          {textContent && (
            <pre className="w-full h-[68vh] overflow-auto p-6 rounded-xl bg-black/90 border border-zinc-800 font-mono text-sm text-zinc-200 whitespace-pre-wrap">
              {textContent}
            </pre>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-[#120f16]/90 border border-pink-500/30 backdrop-blur-xl rounded-2xl p-7 shadow-2xl space-y-6 mt-8">
      <div className="flex items-center gap-3.5 border-b border-zinc-800 pb-4">
        <div className="p-3 rounded-xl bg-pink-500/15 border border-pink-500/30">
          <Lock className="w-6 h-6 text-pink-400" />
        </div>
        <div>
          <span className="text-[11px] font-mono uppercase text-pink-400">End-to-End Encrypted Vault</span>
          <h2 className="text-lg font-bold text-white break-all">{meta.originalName}</h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">From: {meta.senderLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 text-xs font-mono">
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
          <span className="text-zinc-500 block mb-1">ACCESSES REMAINING</span>
          <span className="text-zinc-200 font-semibold text-sm">
            {meta.maxDownloads ? `${meta.maxDownloads - meta.downloadsCount} Left` : 'Unlimited'}
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
          <span className="text-zinc-500 block mb-1">DOWNLOAD OPTION</span>
          {meta.allowDownload ? (
            <span className="text-emerald-400 font-semibold text-sm">Available</span>
          ) : (
            <span className="text-red-400 font-semibold text-sm">Unavailable</span>
          )}
        </div>
      </div>

      {meta.hasPassword && (
        <div>
          <label className="block text-xs font-mono uppercase text-zinc-400 mb-2">
            Document Password Required
          </label>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            placeholder="Enter vault password..."
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-pink-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
          />
          {pwdError && <p className="text-xs text-red-400 mt-1.5">{pwdError}</p>}
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleDecryptAndOpen}
          disabled={decrypting}
          className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-lg shadow-pink-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Unlock className="w-4 h-4" />
          {decrypting ? 'Decrypting Locally...' : 'Decrypt & View File'}
        </button>

        {!meta.allowDownload && (
          <button
            disabled
            className="w-full py-2.5 rounded-xl font-mono text-xs bg-zinc-950 border border-red-500/30 text-red-400/80 flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Ban className="w-3.5 h-3.5" />
            Download Unavailable
          </button>
        )}
      </div>
    </div>
  );
}
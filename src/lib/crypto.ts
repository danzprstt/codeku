// src/lib/crypto.ts
import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPT_KEY || 'codeku-secret-key-2024-danztech';

// Encode ID to URL-safe encrypted string
export function encodeId(id: string): string {
  const encrypted = CryptoJS.AES.encrypt(id, SECRET_KEY).toString();
  // Make URL-safe: replace +, /, = with URL-safe chars
  return encrypted
    .replace(/\+/g, 'x')
    .replace(/\//g, 'y')
    .replace(/=/g, 'z')
    .replace(/[^a-zA-Z0-9xyz]/g, (char) => char.charCodeAt(0).toString(36));
}

// Decode URL-safe encrypted string back to ID
export function decodeId(encoded: string): string {
  try {
    // Reverse URL-safe encoding
    const base64 = encoded
      .replace(/x/g, '+')
      .replace(/y/g, '/')
      .replace(/z/g, '=');
    const decrypted = CryptoJS.AES.decrypt(base64, SECRET_KEY);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
}

// Encrypt sensitive data (passwords stored encrypted)
export function encryptData(data: string): string {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
}

// Decrypt sensitive data
export function decryptData(encrypted: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
}

// Hash password with salt
export function hashPassword(password: string): string {
  const salt = CryptoJS.lib.WordArray.random(128 / 8).toString();
  const hash = CryptoJS.PBKDF2(password, salt, { keySize: 512 / 32, iterations: 10000 }).toString();
  return `${salt}:${hash}`;
}

// Verify password
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const newHash = CryptoJS.PBKDF2(password, salt, { keySize: 512 / 32, iterations: 10000 }).toString();
  return hash === newHash;
}

// Generate random encrypted ID for URLs
export function generateEncryptedId(realId: string): string {
  const timestamp = Date.now().toString(36);
  const combined = `${realId}|${timestamp}`;
  return encodeId(combined);
}

export function extractRealId(encryptedId: string): string {
  const decoded = decodeId(encryptedId);
  if (!decoded) return '';
  return decoded.split('|')[0];
}

// Rate limiter store (in-memory, per session)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (entry.count >= maxRequests) return false;
  
  entry.count++;
  return true;
}

// Anti-devtools detection
export function initAntiDevtools(): void {
  if (typeof window === 'undefined') return;
  
  let devtoolsOpen = false;
  
  const checkDevtools = () => {
    const threshold = 160;
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      if (!devtoolsOpen) {
        devtoolsOpen = true;
        document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0a0a0f;color:#6366f1;font-family:monospace;font-size:1.2rem;">🔒 Access Denied</div>';
      }
    } else {
      devtoolsOpen = false;
    }
  };
  
  setInterval(checkDevtools, 1000);
  
  // Disable right-click
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  
  // Disable common keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
    }
  });
}

/**
 * storage.js — Sauvegarde saisies utilisateur : compressé (gzip) + chiffré (AES-GCM 256)
 *
 * API :
 *   await SecureStorage.save('key', { ... })
 *   await SecureStorage.load('key')  → null si absent ou erreur
 *   SecureStorage.remove('key')
 *
 * Technique :
 *   1. JSON.stringify → CompressionStream('gzip') → Uint8Array
 *   2. PBKDF2(passphrase + salt aléatoire) → clé AES-GCM 256
 *   3. AES-GCM(iv aléatoire) → chiffré
 *   4. {v, s (salt b64), i (iv b64), d (chiffré b64)} → localStorage
 *
 * Note : le chiffrement client-side n'est pas cryptographiquement secret
 * (la passphrase est dans le code). L'objectif est d'empêcher la lecture
 * directe des données dans DevTools / stockage exporté.
 */
const SecureStorage = (() => {
  const PASS = 'mes-aides-sim-2026';
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  // ── Helpers de conversion ───────────────────────────────────────────────
  function toB64(buf) {
    let s = '';
    const b = new Uint8Array(buf);
    for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
    return btoa(s);
  }
  function fromB64(s) {
    const bin = atob(s);
    const b = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
    return b;
  }

  // ── Dérivation de clé ───────────────────────────────────────────────────
  async function deriveKey(salt) {
    const mat = await crypto.subtle.importKey(
      'raw', enc.encode(PASS), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
      mat,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // ── Compression gzip (CompressionStream natif, Chrome 80+, FF 113+, Safari 16.4+) ──
  async function compress(str) {
    if (typeof CompressionStream === 'undefined') return enc.encode(str);
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    await writer.write(enc.encode(str));
    await writer.close();
    const chunks = [];
    const reader = stream.readable.getReader();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) { out.set(c, off); off += c.length; }
    return out;
  }

  async function decompress(buf) {
    if (typeof DecompressionStream === 'undefined') return dec.decode(buf);
    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    await writer.write(buf);
    await writer.close();
    const chunks = [];
    const reader = stream.readable.getReader();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    const total = chunks.reduce((n, c) => n + c.length, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) { out.set(c, off); off += c.length; }
    return dec.decode(out);
  }

  return {
    /** Chiffre + compresse data et le stocke dans localStorage[key] */
    async save(key, data) {
      try {
        const json = JSON.stringify(data);
        const compressed = await compress(json);
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv   = crypto.getRandomValues(new Uint8Array(12));
        const k    = await deriveKey(salt);
        const enc_ = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, k, compressed);
        localStorage.setItem(key, JSON.stringify({
          v: 1,
          s: toB64(salt),
          i: toB64(iv),
          d: toB64(enc_)
        }));
        return true;
      } catch {
        // Fallback : stockage brut si Web Crypto absent (navigateur très ancien)
        try {
          localStorage.setItem(key, JSON.stringify({ v: 0, d: JSON.stringify(data) }));
          return true;
        } catch { return false; }
      }
    },

    /** Déchiffre et décompresse depuis localStorage[key]. Retourne null si absent. */
    async load(key) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) return null;
        const p = JSON.parse(raw);
        if (p.v === 0) return JSON.parse(p.d);               // fallback brut
        if (p.v !== 1) return null;
        const k   = await deriveKey(fromB64(p.s));
        const buf = await crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: fromB64(p.i) }, k, fromB64(p.d)
        );
        const str = await decompress(new Uint8Array(buf));
        return JSON.parse(str);
      } catch { return null; }
    },

    remove(key) { localStorage.removeItem(key); }
  };
})();

window.SecureStorage = SecureStorage;

import admin from 'firebase-admin';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

function normalizePrivateKey(rawKey: string): string {
  if (!rawKey) return '';
  
  // Debug logging (masked)
  console.log(`[Firebase Debug] Processing Private Key. Length: ${rawKey.length}`);
  
  let key = rawKey.trim(); // Trim whitespace first
  
  // 1. Recursively Remove wrapping quotes (single or double)
  while (
    (key.startsWith('"') && key.endsWith('"')) || 
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    console.log('[Firebase Debug] Removing wrapping quotes');
    key = key.slice(1, -1);
  }

  // 2. Handle literal escaped newlines (\n) - Common in Vercel Env Vars
  if (key.includes('\\n')) {
    console.log('[Firebase Debug] Replacing literal escaped newlines (\\n)');
    key = key.replace(/\\n/g, '\n');
  }

  // 3. Fix Common Header Typos (e.g. "PRIVATEKEY" missing space)
  if (key.includes('-----BEGIN PRIVATEKEY-----')) {
    console.log('[Firebase Debug] Fixing malformed header (PRIVATEKEY -> PRIVATE KEY)');
    key = key.replace('-----BEGIN PRIVATEKEY-----', '-----BEGIN PRIVATE KEY-----');
  }
  if (key.includes('-----END PRIVATEKEY-----')) {
    console.log('[Firebase Debug] Fixing malformed footer (PRIVATEKEY -> PRIVATE KEY)');
    key = key.replace('-----END PRIVATEKEY-----', '-----END PRIVATE KEY-----');
  }

  // 4. Aggressive Repair: Check if Headers are missing or malformed
  const beginTag = '-----BEGIN PRIVATE KEY-----';
  const endTag = '-----END PRIVATE KEY-----';

  // If the key doesn't start with the tag, we might have a naked key or a corrupted one.
  if (!key.includes(beginTag)) {
    console.warn('[Firebase Warning] Key is missing BEGIN header. Attempting to repair...');
    // Clean up potential garbage (like "MII..." at start if user just copied the body)
    // We assume the user pasted the base64 content
    const cleanBody = key.replace(/ /g, '').replace(/\n/g, ''); // Remove all whitespace/newlines from body to reform it
    
    // Check if it looks like base64 (simplified check)
    if (cleanBody.length > 100) {
       // Reconstruct PEM
       // Format: Header + Body (chunked 64 chars) + Footer is ideal, but mostly just header+body+footer works
       key = `${beginTag}\n${cleanBody}\n${endTag}`;
       console.log('[Firebase Debug] Key reconstructed with headers.');
    }
  }

  return key;
}

function buildCredential(): admin.credential.Credential {
  const {
    FIREBASE_PROJECT_ID,
    FIREBASE_PRIVATE_KEY,
    FIREBASE_CLIENT_EMAIL,
    FIREBASE_SERVICE_ACCOUNT_PATH,
  } = process.env;

  console.log(`[Firebase Init] Initializing... Project ID: ${FIREBASE_PROJECT_ID ? 'Set' : 'Missing'}`);

  // Strategy 1: Explicit Env Var Path
  if (FIREBASE_SERVICE_ACCOUNT_PATH) {
    const envPath = path.resolve(process.cwd(), FIREBASE_SERVICE_ACCOUNT_PATH);
    if (existsSync(envPath)) {
      console.log(`[Firebase Init] Loading credentials from file: ${envPath}`);
      try {
        return admin.credential.cert(JSON.parse(readFileSync(envPath, 'utf8')));
      } catch (e) { 
        console.error('[Firebase Init] Failed to parse credential file:', e);
      }
    }
  }

  // Strategy 2: Scan common locations
  const candidates = [
    'service-account.json',
    path.join(process.cwd(), 'service-account.json')
  ];

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    if (existsSync(resolved)) {
      console.log(`[Firebase Init] Found service-account.json at: ${resolved}`);
      try {
        return admin.credential.cert(JSON.parse(readFileSync(resolved, 'utf8')));
      } catch (e) { 
        console.error('[Firebase Init] Failed to parse local JSON:', e);
      }
    }
  }

  // FALLBACK: Environment Variables
  console.log('[Firebase Init] Attempting to use Environment Variables');
  
  if (FIREBASE_PROJECT_ID && FIREBASE_PRIVATE_KEY && FIREBASE_CLIENT_EMAIL) {
    try {
      const normalizedKey = normalizePrivateKey(FIREBASE_PRIVATE_KEY);
      
      const cred = admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        privateKey: normalizedKey,
        clientEmail: FIREBASE_CLIENT_EMAIL,
      });
      
      console.log('[Firebase Init] Credential object created successfully.');
      return cred;
    } catch (error) {
       console.error('[Firebase Init] FATAL ERROR creating credential from Env Vars:', error);
       // Throwing here will cause the 500 error "A server error...", 
       // but we need to stop execution if we can't connect.
       throw error; 
    }
  }

  console.error('[Firebase Init] Missing required Environment Variables (FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)');
  throw new Error('Firebase Initialization Failed: Missing Credentials');
}

// Initialize App
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: buildCredential(),
    });
    console.log('[Firebase Init] App Initialized Successfully');
  }
} catch (error) {
  console.error('[Firebase Init] Global Initialization Error:', error);
  // We re-throw so the process crashes, as we can't run without DB
  throw error;
}

export const db = admin.firestore();
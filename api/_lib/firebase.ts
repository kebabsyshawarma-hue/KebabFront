import admin from 'firebase-admin';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

function normalizePrivateKey(rawKey: string): string {
  if (!rawKey) return '';
  
  // Debug logging (masked)
  console.log(`[Firebase Debug] Processing Private Key. Length: ${rawKey.length}`);
  
  let key = rawKey;
  
  // 1. Remove wrapping double quotes if present (common in .env files)
  if (key.startsWith("'") && key.endsWith("'")) {
    console.log('[Firebase Debug] Removing wrapping double quotes');
    key = key.slice(1, -1);
  }
  
  // 2. Remove wrapping single quotes if present
  if (key.startsWith("'") && key.endsWith("'")) {
    console.log('[Firebase Debug] Removing wrapping single quotes');
    key = key.slice(1, -1);
  }

  // 3. Handle escaped newlines (literal "\n" characters)
  // This is common when keys are pasted into Vercel UI or JSON strings
  if (key.includes('\\n')) {
    console.log('[Firebase Debug] Replacing literal escaped newlines (\\n) with real newlines');
    key = key.replace(/\\n/g, '\n');
  }

  // 4. Ensure correct PEM formatting
  // Sometimes keys lose the dashes or headers if copied poorly, though harder to fix automatically.
  // We mainly check if it looks roughly right.
  if (!key.includes('-----BEGIN PRIVATE KEY-----')) {
    console.warn('[Firebase Warning] Private Key does not start with standard PEM header. This might fail.');
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
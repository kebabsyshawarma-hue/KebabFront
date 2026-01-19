import admin from 'firebase-admin';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

type ServiceAccountConfig = admin.ServiceAccount & { project_id: string };

function normalizePrivateKey(rawKey: string): string {
  if (!rawKey) return '';
  
  // 1. Remove wrapping quotes and standard clean
  let key = rawKey.replace(/^"|"$/g, '');

  // 2. Check if it handles literal escaped newlines (common in JSON/Env)
  if (key.includes('\\n')) {
    key = key.replace(/\\n/g, '\n');
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

  console.log(`[Firebase Init] CWD: ${process.cwd()}`);

  // Strategy 1: Explicit Env Var Path
  if (FIREBASE_SERVICE_ACCOUNT_PATH) {
    const envPath = path.resolve(process.cwd(), FIREBASE_SERVICE_ACCOUNT_PATH);
    console.log(`[Firebase Init] Checking Env Path: ${envPath}`);
    if (existsSync(envPath)) {
      console.log('[Firebase Init] Found via Env Path');
      try {
        return admin.credential.cert(JSON.parse(readFileSync(envPath, 'utf8')));
      } catch (e) { console.error('JSON Parse Error:', e); }
    }
  }

  // Strategy 2: Scan common locations for service-account.json
  const candidates = [
    'service-account.json',
    '../service-account.json',
    '../../service-account.json',
    path.join(process.cwd(), 'service-account.json')
  ];

  for (const candidate of candidates) {
    const resolved = path.resolve(candidate);
    // console.log(`[Firebase Init] Checking Candidate: ${resolved}`); // Optional verbose log
    if (existsSync(resolved)) {
      console.log(`[Firebase Init] Found JSON at: ${resolved}`);
      try {
        return admin.credential.cert(JSON.parse(readFileSync(resolved, 'utf8')));
      } catch (e) { console.error('JSON Parse Error:', e); }
    }
  }

  // FALLBACK: Environment Variables
  console.log('[Firebase Init] Falling back to Env Vars...');
  if (FIREBASE_PROJECT_ID && FIREBASE_PRIVATE_KEY && FIREBASE_CLIENT_EMAIL) {
    try {
      return admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        privateKey: normalizePrivateKey(FIREBASE_PRIVATE_KEY),
        clientEmail: FIREBASE_CLIENT_EMAIL,
      });
    } catch (error) {
       console.error('[Firebase] Failed to init with Env Vars:', (error as Error).message);
    }
  }

  throw new Error('No Firebase credentials found. Provide service-account.json in root or Env Vars.');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: buildCredential(),
  });
}

export const db = admin.firestore();



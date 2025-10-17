import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { db } from '../_lib/firebase';

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  // Authentication and Authorization Check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(403).json({ message: 'Unauthorized: No token provided.' });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await getAuth().verifyIdToken(idToken);
    if (!decodedToken.admin) {
      res.status(403).json({ message: 'Unauthorized: Admin privilege required.' });
      return;
    }
  } catch (error) {
    console.error('Error verifying ID token:', error);
    res.status(403).json({ message: 'Unauthorized: Invalid token.' });
    return;
  }

  // Admin claim logic
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'Email is required.' });
      return;
    }

    const user = await getAuth().getUserByEmail(email);
    await getAuth().setCustomUserClaims(user.uid, { admin: true });

    res.status(200).json({ message: `Successfully made ${email} an admin.` });
  } catch (error: any) {
    console.error('Error setting admin claim:', error);
    res.status(500).json({ message: 'Error setting admin claim', error: error.message });
  }
};

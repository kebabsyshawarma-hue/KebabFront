import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';

// Ensure the required environment variable is present at build time.
if (!process.env.WOMPI_INTEGRITY_SECRET) {
  throw new Error('Missing required environment variable: WOMPI_INTEGRITY_SECRET');
}

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { reference, amount } = req.body;

    const wompiIntegritySecret = process.env.WOMPI_INTEGRITY_SECRET;

    // This check is now somewhat redundant due to the build-time check above,
    // but it's good practice for runtime safety.
    if (!wompiIntegritySecret) {
      console.error('WOMPI_INTEGRITY_SECRET is not configured.');
      res.status(500).json({ error: 'Wompi integrity secret is not configured.' });
      return;
    }

    if (!reference || !amount) {
      console.error('Missing reference or amount in request body.', { reference, amount });
      res.status(400).json({ error: 'Missing reference or amount in request body.' });
      return;
    }

    const amountInCents = amount * 100;
    const currency = 'COP';

    const signature = crypto
      .createHash('sha256')
      .update(`${reference}${amountInCents}${currency}${wompiIntegritySecret}`)
      .digest('hex');

    res.status(200).json({ signature });
  } catch (error: any) {
    console.error('Error generating Wompi signature:', error);
    res.status(500).json({ message: 'Error generating Wompi signature', error: error.message });
  }
};
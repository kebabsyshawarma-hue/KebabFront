import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';
import { db } from './_lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

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
    const wompiEvent = req.body;
    console.log('Received Wompi webhook event:', wompiEvent);

    // --- Webhook Verification (IMPORTANT for security) ---
    const wompiIntegritySecret = process.env.WOMPI_INTEGRITY_SECRET;
    if (!wompiIntegritySecret) {
      console.error('WOMPI_INTEGRITY_SECRET is not configured for webhook verification.');
      return res.status(500).json({ message: 'Webhook secret not configured.' });
    }

    const signature = req.headers['x-wompi-signature'];
    if (!signature) {
      console.error('Missing X-Wompi-Signature header.');
      return res.status(400).json({ message: 'Missing signature.' });
    }

    const [timestamp, hash] = (signature as string).split(',').map(s => s.split('=')[1]);
    const message = `${timestamp}${wompiEvent.event.id}${wompiIntegritySecret}`;
    const calculatedHash = crypto.createHash('sha256').update(message).digest('hex');

    if (calculatedHash !== hash) {
      console.error('Webhook signature mismatch.', { receivedHash: hash, calculatedHash });
      return res.status(401).json({ message: 'Invalid webhook signature.' });
    }
    // --- End Webhook Verification ---

    const eventType = wompiEvent.event.name;
    const transaction = wompiEvent.data.transaction;

    if (eventType === 'transaction.updated' && transaction) {
      const orderId = transaction.reference.split('kebab_')[1]; // Extract orderId from reference
      const newStatus = transaction.status === 'APPROVED' ? 'Approved' : 'Declined';

      if (orderId) {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: newStatus });
        console.log(`Order ${orderId} status updated to ${newStatus} via Wompi webhook.`);
        return res.status(200).json({ message: 'Order status updated successfully.' });
      } else {
        console.error('Could not extract orderId from Wompi reference:', transaction.reference);
        return res.status(400).json({ message: 'Invalid order reference.' });
      }
    }

    console.log('Unhandled Wompi event type or missing transaction data.', { eventType, transaction });
    res.status(200).json({ message: 'Event received, but no action taken.' });

  } catch (error: any) {
    console.error('Error processing Wompi webhook:', error);
    res.status(500).json({ message: 'Error processing webhook', error: error.message });
  }
};

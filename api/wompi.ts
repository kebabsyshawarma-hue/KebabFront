import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as crypto from 'crypto';
import { db } from './_lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default async (req: VercelRequest, res: VercelResponse) => {
  console.log('--- Wompi Webhook Received ---');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    console.log('Responding to OPTIONS request');
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    console.log(`Method ${req.method} not allowed`);
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const wompiEvent = req.body;
    console.log('Received Wompi event:', JSON.stringify(wompiEvent, null, 2));

    // --- V2 Signature Verification ---
    const { signature, timestamp } = wompiEvent;
    const eventsSecret = process.env.WOMPI_EVENTS_SECRET;

    if (!eventsSecret) {
      console.error('CRITICAL: WOMPI_EVENTS_SECRET is not configured.');
      return res.status(500).json({ message: 'Webhook events secret not configured.' });
    }

    const concatenatedProperties = signature.properties
      .map((property: string) => {
        const keys = property.split('.'); // e.g., 'transaction.id'
        let value = wompiEvent; // Start from the root of the event
        for (const key of keys) {
          value = value[key];
          if (value === undefined) {
            console.error(`Could not find property ${property} in event body.`);
            // Return a value that will cause the signature to fail
            return null;
          }
        }
        return value;
      })
      .join('');
      
    if (concatenatedProperties.includes('null')) {
        console.error('CRITICAL: Could not construct signature string from properties.');
        return res.status(400).json({ message: 'Invalid signature properties.' });
    }

    const stringToSign = `${concatenatedProperties}${timestamp}${eventsSecret}`;
    const calculatedChecksum = crypto.createHash('sha256').update(stringToSign).digest('hex');

    console.log(`Calculated checksum: ${calculatedChecksum}`);
    console.log(`Received checksum: ${signature.checksum}`);

    if (calculatedChecksum !== signature.checksum) {
      console.error('CRITICAL: Webhook checksum mismatch.');
      return res.status(401).json({ message: 'Invalid webhook signature.' });
    }
    console.log('Signature verified successfully.');

    const eventType = wompiEvent.event?.name;
    const transaction = wompiEvent.data?.transaction;

    if (eventType === 'transaction.updated' && transaction) {
      console.log('Processing transaction.updated event.');
      const orderId = transaction.reference?.split('kebab_')[1];
      const newStatus = transaction.status === 'APPROVED' ? 'Approved' : 'Declined';

      console.log(`Transaction reference: ${transaction.reference}`);
      console.log(`Extracted orderId: ${orderId}`);
      console.log(`New status: ${newStatus}`);

      if (orderId) {
        const orderRef = doc(db, 'orders', orderId);
        console.log(`Attempting to update order ${orderId} in Firestore...`);
        await updateDoc(orderRef, { status: newStatus, wompiTransactionId: transaction.id });
        console.log(`SUCCESS: Order ${orderId} status updated to ${newStatus}.`);
        return res.status(200).json({ message: 'Order status updated successfully.' });
      } else {
        console.error('Could not extract orderId from Wompi reference:', transaction.reference);
        return res.status(400).json({ message: 'Invalid order reference.' });
      }
    }

    console.log('Event received, but no action taken (not a transaction.updated event or missing data).');
    res.status(200).json({ message: 'Event received, but no action taken.' });

  } catch (error: any) {
    console.error('CRITICAL: Unhandled error in webhook processing:', error);
    res.status(500).json({ message: 'Error processing webhook', error: error.message });
  }
};

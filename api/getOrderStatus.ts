import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from './_lib/firebase';

// Define a type for the items in the order for type safety
type Item = {
  name: string;
  quantity: number;
  price: number;
};

export default async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Order ID is required.' });
  }

  try {
    const ordersRef = db.collection('orders');
    const q = ordersRef.where('shortOrderId', '==', id);
    const querySnapshot = await q.get();

    if (querySnapshot.empty) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const orderDoc = querySnapshot.docs[0];
    const orderData = orderDoc.data();

    const sanitizedData = {
      status: orderData.status,
      fulfillmentStatus: orderData.fulfillmentStatus || 'Pedido recibido',
      createdAt: orderData.createdAt.toDate().toISOString(),
      items: orderData.items.map((item: Item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: orderData.total,
      paymentMethod: orderData.paymentMethod,
      shortOrderId: orderData.shortOrderId,
    };

    return res.status(200).json(sanitizedData);

  } catch (error) {
    console.error('Error fetching order status:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

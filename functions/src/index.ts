import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as crypto from 'crypto';

admin.initializeApp();
const db = admin.firestore();

// Helper middleware to check for admin privileges
const isAdmin = (req: functions.https.Request, res: functions.Response, next: () => void) => {
  const idToken = req.headers.authorization?.split('Bearer ')[1];
  if (!idToken) {
    res.status(403).send('Unauthorized');
    return;
  }

  admin.auth().verifyIdToken(idToken)
    .then((decodedToken) => {
      if (decodedToken.admin) {
        next();
      } else {
        res.status(403).send('Unauthorized');
      }
    })
    .catch(() => {
      res.status(403).send('Unauthorized');
    });
};

// Interfaz para un item del menú
interface MenuItem {
  id?: string; // Firestore ID is a string
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  kcal?: number;
  order?: number;
}

// Interfaz para una categoría
interface Category {
  name: string;
  slug: string;
  items: MenuItem[];
  order: number;
}

// Interfaz para la estructura completa del menú
interface MenuData {
  categories: Category[];
}

interface HeroSlide {
  id?: string;
  title: string;
  subtitle: string;
  image: string;
  type: 'horizontal' | 'vertical';
}

interface SimpleCategory {
  id: string;
  name: string;
}

interface CategoryOrder {
  id: string;
  order: number;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface Order {
  id?: string;
  customerInfo: CustomerInfo;
  orderItems: OrderItem[];
  total: number;
  status: string;
  createdAt: admin.firestore.FieldValue;
}

export const getMenu = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const categoriesCollection = db.collection('categories');
    const categoriesSnapshot = await categoriesCollection.get();
    const categoriesData = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

    const menuCollection = db.collection('menu');
    const menuSnapshot = await menuCollection.get();
    const menuItems: MenuItem[] = menuSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));

    // Agrupar items por categoría
    const categories: { [key: string]: Category } = {};
    menuItems.forEach(item => {
      if (!categories[item.category]) {
        const categoryData = categoriesData.find(c => c.name === item.category);
        categories[item.category] = {
          name: item.category,
          slug: item.category.toLowerCase().replace(/\s+/g, '-'),
          items: [],
          order: categoryData ? categoryData.order : 0,
        };
      }
      categories[item.category].items.push(item);
    });

    const sortedCategories = Object.values(categories).sort((a, b) => a.order - b.order);

    const menuData: MenuData = {
      categories: sortedCategories,
    };

    res.status(200).json(menuData);
  } catch (error: any) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ message: 'Error fetching menu', error: error.message });
  }
});

export const addMenuItem = functions.https.onRequest(async (req, res) => {
    isAdmin(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        try {
            const newItemData: MenuItem = req.body;
            
            const docRef = await db.collection('menu').add({
            name: newItemData.name,
            description: newItemData.description,
            price: newItemData.price,
            category: newItemData.category,
            image: newItemData.image,
            kcal: newItemData.kcal,
            });

            res.status(201).json({ message: 'Item added successfully', id: docRef.id });
        } catch (error: any) {
            console.error('Error adding menu item:', error);
            res.status(500).json({ message: 'Error adding menu item', error: error.message });
        }
    });
});

export const getHeroSlides = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const slidesCol = db.collection('heroSlides');
    const slideSnapshot = await slidesCol.get();
    const slidesList = slideSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(slidesList);
  } catch (error: any) {
    console.error('Error reading hero slides from Firestore:', error);
    res.status(500).json({ message: 'Error reading hero slides', error: error.message });
  }
});

export const addHeroSlide = functions.https.onRequest(async (req, res) => {
    isAdmin(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        try {
            const newSlideData: HeroSlide = req.body;

            // Ensure newSlideData has a type, default to 'horizontal' if not provided
            if (!newSlideData.type) {
            newSlideData.type = 'horizontal';
            }

            const slidesCol = db.collection('heroSlides');
            const docRef = await slidesCol.add(newSlideData);

            res.status(201).json({ message: 'Slide added successfully', slide: { id: docRef.id, ...newSlideData } });
        } catch (error: any) {
            console.error('Error processing slide:', error);
            res.status(500).json({ message: 'Error processing slide', error: error.message });
        }
    });
});

export const getCategories = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const categoriesCollection = db.collection('categories');
    const categoriesSnapshot = await categoriesCollection.get();
    const categories: SimpleCategory[] = categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SimpleCategory));
    res.status(200).json(categories);
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
});

export const addCategory = functions.https.onRequest(async (req, res) => {
    isAdmin(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        try {
            const { name } = req.body;
            if (!name) {
            res.status(400).json({ message: 'Category name is required' });
            return;
            }

            const docRef = await db.collection('categories').add({ name });

            res.status(201).json({ message: 'Category created successfully', id: docRef.id });
        } catch (error: any) {
            console.error('Error creating category:', error);
            res.status(500).json({ message: 'Error creating category', error: error.message });
        }
    });
});

export const updateCategoryOrder = functions.https.onRequest(async (req, res) => {
    isAdmin(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        try {
            const categories: CategoryOrder[] = req.body;
            
            const batch = db.batch();

            categories.forEach(category => {
            const docRef = db.collection('categories').doc(category.id);
            batch.update(docRef, { order: category.order });
            });

            await batch.commit();

            res.status(200).json({ message: 'Category order updated successfully' });
        } catch (error: any) {
            console.error('Error updating category order:', error);
            res.status(500).json({ message: 'Error updating category order', error: error.message });
        }
    });
});

export const manageHeroSlide = functions.https.onRequest(async (req, res) => {
    isAdmin(req, res, async () => {
        const pathSegments = req.path.split('/').filter(Boolean);
        const id = pathSegments[pathSegments.length - 1]; // Assuming ID is the last segment

        if (!id) {
            res.status(400).json({ message: 'ID is required' });
            return;
        }

        try {
            const slideRef = db.collection('heroSlides').doc(id);

            if (req.method === 'GET') {
            const doc = await slideRef.get();
            if (!doc.exists) {
                res.status(404).json({ message: 'Slide not found' });
                return;
            }
            res.status(200).json({ id: doc.id, ...doc.data() });
            } else if (req.method === 'PUT') {
            const updatedSlideData = req.body;
            await slideRef.update(updatedSlideData);
            res.status(200).json({ message: 'Slide updated successfully', slide: { id, ...updatedSlideData } });
            } else if (req.method === 'DELETE') {
            await slideRef.delete();
            res.status(200).json({ message: 'Slide deleted successfully' });
            } else {
            res.status(405).send('Method Not Allowed');
            }
        } catch (error: any) {
            console.error(`Error managing hero slide ${id}:`, error);
            res.status(500).json({ message: `Error managing hero slide ${id}`, error: error.message });
        }
    });
});

export const manageMenuItem = functions.https.onRequest(async (req, res) => {
    isAdmin(req, res, async () => {
        const pathSegments = req.path.split('/').filter(Boolean);
        const id = pathSegments[pathSegments.length - 1]; // Assuming ID is the last segment

        if (!id) {
            res.status(400).json({ message: 'ID is required' });
            return;
        }

        try {
            const docRef = db.collection('menu').doc(id);

            if (req.method === 'GET') {
            const docSnap = await docRef.get();
            if (!docSnap.exists) {
                res.status(404).json({ message: 'Item not found' });
                return;
            }
            res.status(200).json({ id: docSnap.id, ...docSnap.data() });
            } else if (req.method === 'PUT') {
            const updatedItemData = req.body;
            await docRef.update(updatedItemData);
            res.status(200).json({ message: 'Item updated successfully' });
            } else if (req.method === 'DELETE') {
            await docRef.delete();
            res.status(200).json({ message: 'Item deleted successfully' });
            } else {
            res.status(405).send('Method Not Allowed');
            }
        } catch (error: any) {
            console.error(`Error managing menu item ${id}:`, error);
            res.status(500).json({ message: `Error managing menu item ${id}`, error: error.message });
        }
    });
});

export const updateMenuOrder = functions.https.onRequest(async (req, res) => {
    isAdmin(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        try {
            const menuItems: MenuItem[] = req.body;
            
            const batch = db.batch();

            menuItems.forEach(item => {
            const docRef = db.collection('menu').doc(item.id!);
            batch.update(docRef, { order: item.order });
            });

            await batch.commit();

            res.status(200).json({ message: 'Order updated successfully' });
        } catch (error: any) {
            console.error('Error updating menu order:', error);
            res.status(500).json({ message: 'Error updating menu order', error: error.message });
        }
    });
});

export const getOrders = functions.https.onRequest(async (req, res) => {
    isAdmin(req, res, async () => {
        if (req.method !== 'GET') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        try {
            const ordersCollection = db.collection('orders');
            const ordersSnapshot = await ordersCollection.orderBy('createdAt', 'desc').get();
            const orders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            res.status(200).json(orders);
        } catch (error: any) {
            console.error('Error reading orders:', error);
            res.status(500).json({ message: 'Error reading orders', error: error.message });
        }
    });
});

export const addOrder = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const newOrder: Order = req.body;

    const normalizedOrder = {
      ...newOrder,
      customerInfo: newOrder.customerInfo,
      orderItems: newOrder.orderItems,
      status: 'Pending', // Default status for new orders
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('orders').add(normalizedOrder);

    res.status(201).json({ message: 'Order received successfully', order: { id: docRef.id, ...normalizedOrder } });
  } catch (error: any) {
    console.error('Error processing order:', error);
    res.status(500).json({ message: 'Error processing order', error: error.message });
  }
});

export const updateOrderStatus = functions.https.onRequest(async (req, res) => {
    isAdmin(req, res, async () => {
        if (req.method !== 'PATCH') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        try {
            const { id, status } = req.body;

            if (!id || !status) {
            res.status(400).json({ message: 'Order ID and status are required' });
            return;
            }

            const orderRef = db.collection('orders').doc(id);
            await orderRef.update({ status });

            res.status(200).json({ message: 'Order status updated successfully' });
        } catch (error: any) {
            console.error('Error updating order status:', error);
            res.status(500).json({ message: 'Error updating order status', error: error.message });
        }
    });
});

export const getWompiSignature = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const { reference, amount } = req.body;

    const wompiIntegritySecret = functions.config().wompi?.integrity_secret; // Access from Firebase config

    if (!wompiIntegritySecret) {
      res.status(500).json({ error: 'Wompi integrity secret is not configured.' });
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
});

export const setAdminClaim = functions.https.onRequest(async (req, res) => {
    isAdmin(req, res, async () => {
        if (req.method !== 'POST') {
            res.status(405).send('Method Not Allowed');
            return;
        }

        try {
            const { email } = req.body;
            const user = await admin.auth().getUserByEmail(email);
            await admin.auth().setCustomUserClaims(user.uid, { admin: true });
            res.status(200).json({ message: `Successfully made ${email} an admin.` });
        } catch (error: any) {
            console.error('Error setting admin claim:', error);
            res.status(500).json({ message: 'Error setting admin claim', error: error.message });
        }
    });
});

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../_lib/firebase';

// Interfaces from the old functions/src/index.ts
interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  kcal?: number;
  order?: number;
}

interface Category {
  name: string;
  slug: string;
  items: MenuItem[];
  order: number;
}

interface MenuData {
  categories: Category[];
}

export default async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
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
};

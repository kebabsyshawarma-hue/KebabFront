"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWompiSignature = exports.updateOrderStatus = exports.addOrder = exports.getOrders = exports.updateMenuOrder = exports.manageMenuItem = exports.manageHeroSlide = exports.updateCategoryOrder = exports.addCategory = exports.getCategories = exports.addHeroSlide = exports.getHeroSlides = exports.addMenuItem = exports.getMenu = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
admin.initializeApp();
const db = admin.firestore();
exports.getMenu = functions.https.onRequest(async (req, res) => {
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
        const categoriesData = categoriesSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        const menuCollection = db.collection('menu');
        const menuSnapshot = await menuCollection.get();
        const menuItems = menuSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        // Agrupar items por categoría
        const categories = {};
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
        const menuData = {
            categories: sortedCategories,
        };
        res.status(200).json(menuData);
    }
    catch (error) {
        console.error('Error fetching menu:', error);
        res.status(500).json({ message: 'Error fetching menu', error: error.message });
    }
});
exports.addMenuItem = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
        const newItemData = req.body;
        const docRef = await db.collection('menu').add({
            name: newItemData.name,
            description: newItemData.description,
            price: newItemData.price,
            category: newItemData.category,
            image: newItemData.image,
            kcal: newItemData.kcal,
        });
        res.status(201).json({ message: 'Item added successfully', id: docRef.id });
    }
    catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ message: 'Error adding menu item', error: error.message });
    }
});
exports.getHeroSlides = functions.https.onRequest(async (req, res) => {
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
        const slidesList = slideSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json(slidesList);
    }
    catch (error) {
        console.error('Error reading hero slides from Firestore:', error);
        res.status(500).json({ message: 'Error reading hero slides', error: error.message });
    }
});
exports.addHeroSlide = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
        const newSlideData = req.body;
        // Ensure newSlideData has a type, default to 'horizontal' if not provided
        if (!newSlideData.type) {
            newSlideData.type = 'horizontal';
        }
        const slidesCol = db.collection('heroSlides');
        const docRef = await slidesCol.add(newSlideData);
        res.status(201).json({ message: 'Slide added successfully', slide: Object.assign({ id: docRef.id }, newSlideData) });
    }
    catch (error) {
        console.error('Error processing slide:', error);
        res.status(500).json({ message: 'Error processing slide', error: error.message });
    }
});
exports.getCategories = functions.https.onRequest(async (req, res) => {
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
        const categories = categoriesSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json(categories);
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Error fetching categories', error: error.message });
    }
});
exports.addCategory = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Category name is required' });
            return;
        }
        const docRef = await db.collection('categories').add({ name });
        res.status(201).json({ message: 'Category created successfully', id: docRef.id });
    }
    catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ message: 'Error creating category', error: error.message });
    }
});
exports.updateCategoryOrder = functions.https.onRequest(async (req, res) => {
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
        const categories = req.body;
        const batch = db.batch();
        categories.forEach(category => {
            const docRef = db.collection('categories').doc(category.id);
            batch.update(docRef, { order: category.order });
        });
        await batch.commit();
        res.status(200).json({ message: 'Category order updated successfully' });
    }
    catch (error) {
        console.error('Error updating category order:', error);
        res.status(500).json({ message: 'Error updating category order', error: error.message });
    }
});
exports.manageHeroSlide = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
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
            res.status(200).json(Object.assign({ id: doc.id }, doc.data()));
        }
        else if (req.method === 'PUT') {
            const updatedSlideData = req.body;
            await slideRef.update(updatedSlideData);
            res.status(200).json({ message: 'Slide updated successfully', slide: Object.assign({ id }, updatedSlideData) });
        }
        else if (req.method === 'DELETE') {
            await slideRef.delete();
            res.status(200).json({ message: 'Slide deleted successfully' });
        }
        else {
            res.status(405).send('Method Not Allowed');
        }
    }
    catch (error) {
        console.error(`Error managing hero slide ${id}:`, error);
        res.status(500).json({ message: `Error managing hero slide ${id}`, error: error.message });
    }
});
exports.manageMenuItem = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
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
            res.status(200).json(Object.assign({ id: docSnap.id }, docSnap.data()));
        }
        else if (req.method === 'PUT') {
            const updatedItemData = req.body;
            await docRef.update(updatedItemData);
            res.status(200).json({ message: 'Item updated successfully' });
        }
        else if (req.method === 'DELETE') {
            await docRef.delete();
            res.status(200).json({ message: 'Item deleted successfully' });
        }
        else {
            res.status(405).send('Method Not Allowed');
        }
    }
    catch (error) {
        console.error(`Error managing menu item ${id}:`, error);
        res.status(500).json({ message: `Error managing menu item ${id}`, error: error.message });
    }
});
exports.updateMenuOrder = functions.https.onRequest(async (req, res) => {
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
        const menuItems = req.body;
        const batch = db.batch();
        menuItems.forEach(item => {
            const docRef = db.collection('menu').doc(item.id);
            batch.update(docRef, { order: item.order });
        });
        await batch.commit();
        res.status(200).json({ message: 'Order updated successfully' });
    }
    catch (error) {
        console.error('Error updating menu order:', error);
        res.status(500).json({ message: 'Error updating menu order', error: error.message });
    }
});
exports.getOrders = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
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
        const ordersCollection = db.collection('orders');
        const ordersSnapshot = await ordersCollection.orderBy('createdAt', 'desc').get();
        const orders = ordersSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        res.status(200).json(orders);
    }
    catch (error) {
        console.error('Error reading orders:', error);
        res.status(500).json({ message: 'Error reading orders', error: error.message });
    }
});
exports.addOrder = functions.https.onRequest(async (req, res) => {
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
        const newOrder = req.body;
        const normalizedOrder = Object.assign(Object.assign({}, newOrder), { customerInfo: newOrder.customerInfo || newOrder.customerDetails, orderItems: newOrder.orderItems || newOrder.items, status: 'Pending', createdAt: admin.firestore.FieldValue.serverTimestamp() });
        delete normalizedOrder.customerDetails;
        delete normalizedOrder.items;
        const docRef = await db.collection('orders').add(normalizedOrder);
        res.status(201).json({ message: 'Order received successfully', order: Object.assign({ id: docRef.id }, normalizedOrder) });
    }
    catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ message: 'Error processing order', error: error.message });
    }
});
exports.updateOrderStatus = functions.https.onRequest(async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }
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
    }
    catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
});
exports.getWompiSignature = functions.https.onRequest(async (req, res) => {
    var _a;
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
        const wompiIntegritySecret = (_a = functions.config().wompi) === null || _a === void 0 ? void 0 : _a.integrity_secret; // Access from Firebase config
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
    }
    catch (error) {
        console.error('Error generating Wompi signature:', error);
        res.status(500).json({ message: 'Error generating Wompi signature', error: error.message });
    }
});
//# sourceMappingURL=index.js.map
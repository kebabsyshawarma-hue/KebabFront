// No 'use client' needed in Vite, context works out of the box.

import React, { createContext, useState, useContext } from 'react';

// Definimos los tipos de datos que usaremos (ahora como comentarios o JSDoc si se desea).
// interface Product {
//   id: string;
//   name: string;
//   price: number;
//   image: string;
// }

// interface CartItem extends Product {
//   quantity: number;
// }

// interface CartContextType {
//   cart: CartItem[];
//   addToCart: (product: Product) => void;
//   increaseQuantity: (id: string) => void;
//   decreaseQuantity: (id: string) => void;
//   removeFromCart: (productId: string) => void;
//   clearCart: () => void;
//   total: number; // New: total price of the cart
// }

// Creamos el Contexto con un valor por defecto.
const CartContext = createContext(undefined);

// Creamos el Proveedor del Contexto. Este componente envolverá nuestra aplicación.
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        setIsCartOpen(true); // Open cart when adding item
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const increaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item
      ).filter((item) => item.quantity > 0) // Remove if quantity drops to 0
    );
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
    setDeliveryFee(0);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      increaseQuantity, 
      decreaseQuantity, 
      removeFromCart, 
      clearCart, 
      total, 
      subtotal, 
      deliveryFee, 
      setDeliveryFee,
      isCartOpen,
      openCart,
      closeCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar nuestro contexto de carrito más fácilmente.
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
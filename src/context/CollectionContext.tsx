import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '@/lib/supabase';

export interface CollectionItem {
  product_id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  cover_image: string;
}

interface CollectionContextType {
  items: CollectionItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCollection: () => void;
  totalPrice: number;
  itemsCount: number;
  buildSingleProductWhatsAppURL: (product: Product, pageURL: string) => string;
  buildCollectionWhatsAppURL: () => string;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CollectionItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tk_collection');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse collection', e);
      }
    }
  }, []);

  // Save to localStorage when items change
  const saveItems = (newItems: CollectionItem[]) => {
    setItems(newItems);
    localStorage.setItem('tk_collection', JSON.stringify(newItems));
  };

  const addItem = (product: Product, quantity = 1) => {
    const existingIndex = items.findIndex(item => item.product_id === product.id);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += quantity;
      saveItems(updated);
    } else {
      const newItem: CollectionItem = {
        product_id: product.id,
        sku: product.sku,
        name: product.name,
        price: product.price,
        quantity: quantity,
        cover_image: product.cover_image,
      };
      saveItems([...items, newItem]);
    }
  };

  const removeItem = (productId: string) => {
    const filtered = items.filter(item => item.product_id !== productId);
    saveItems(filtered);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    const updated = items.map(item => 
      item.product_id === productId ? { ...item, quantity } : item
    );
    saveItems(updated);
  };

  const clearCollection = () => {
    saveItems([]);
  };

  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const buildSingleProductWhatsAppURL = (product: Product, pageURL: string) => {
    const message = `Hello TEKART 👋\n\nI'm interested in:\n*${product.name}*\nProduct ID: ${product.sku}\nPrice: ₹${product.price}\n\n🔗 ${pageURL}\n\nPlease confirm availability.`;
    return `https://wa.me/919384180516?text=${encodeURIComponent(message)}`;
  };

  const buildCollectionWhatsAppURL = () => {
    if (items.length === 0) return '';
    
    let itemsText = '';
    items.forEach((item, index) => {
      itemsText += `${index + 1}. *${item.name}* (ID: ${item.sku}) × ${item.quantity} — ₹${item.price * item.quantity}\n`;
    });

    const message = `Hello TEKART 👋\n\nI'd like to enquire about these items:\n\n${itemsText}\nTotal estimated: *₹${totalPrice}*\n\n🔗 Collection link: ${window.location.origin}/collection\n\nPlease confirm availability and pricing.`;
    return `https://wa.me/919384180516?text=${encodeURIComponent(message)}`;
  };

  return (
    <CollectionContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCollection,
      totalPrice,
      itemsCount,
      buildSingleProductWhatsAppURL,
      buildCollectionWhatsAppURL
    }}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
};

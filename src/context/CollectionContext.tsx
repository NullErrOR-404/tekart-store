import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, type Product } from '@/lib/supabase';

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

  // Load from localStorage or parse from query URL parameters on mount
  useEffect(() => {
    const loadCollection = async () => {
      // 1. Check for shared collection query params
      const searchParams = new URLSearchParams(window.location.search);
      const sharedItemsStr = searchParams.get('items');

      if (sharedItemsStr) {
        try {
          // Parse format: prod_id1:qty1,prod_id2:qty2,...
          const parsedPairs = sharedItemsStr.split(',').map(pair => {
            const [id, qtyStr] = pair.split(':');
            return { id, quantity: parseInt(qtyStr, 10) || 1 };
          }).filter(item => item.id);

          if (parsedPairs.length > 0) {
            const productIds = parsedPairs.map(p => p.id);
            const { data, error } = await supabase.from('products').select('*');

            if (data && !error) {
              const matchedProducts = data.filter((p: Product) => productIds.includes(p.id));
              const collectionItems: CollectionItem[] = matchedProducts.map((p: Product) => {
                const pair = parsedPairs.find(x => x.id === p.id);
                return {
                  product_id: p.id,
                  sku: p.sku,
                  name: p.name,
                  price: p.price,
                  quantity: pair ? pair.quantity : 1,
                  cover_image: p.cover_image,
                };
              });

              if (collectionItems.length > 0) {
                setItems(collectionItems);
                localStorage.setItem('tk_collection', JSON.stringify(collectionItems));
                
                // Remove the items parameter from the URL to clean up history and avoid reset on refresh
                const cleanURL = window.location.pathname;
                window.history.replaceState({}, '', cleanURL);
                return;
              }
            }
          }
        } catch (e) {
          console.error('Failed to parse shared items from URL', e);
        }
      }

      // 2. Default fallback to local storage
      const saved = localStorage.getItem('tk_collection');
      if (saved) {
        try {
          setItems(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse collection', e);
        }
      }
    };

    loadCollection();
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

    // Encode items as prod_id:qty joined by commas
    const encodedItems = items.map(item => `${item.product_id}:${item.quantity}`).join(',');
    const shareURL = `${window.location.origin}/collection?items=${encodeURIComponent(encodedItems)}`;

    const message = `Hello TEKART 👋\n\nI'd like to enquire about these items:\n\n${itemsText}\nTotal estimated: *₹${totalPrice}*\n\n🔗 Collection link: ${shareURL}\n\nPlease confirm availability and pricing.`;
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

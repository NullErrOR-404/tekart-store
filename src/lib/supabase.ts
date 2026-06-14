import { createClient } from '@supabase/supabase-js';

// Load variables from import.meta.env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// A simple helper to check if variables are set and look valid
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl.startsWith('http') && 
  supabaseAnonKey && 
  supabaseAnonKey.length > 20;

export const isMockMode = !isSupabaseConfigured;

// Define database types matching our schema
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  cover_image?: string;
  priority: number;
  created_at: string;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  short_description?: string;
  description?: string;
  category_id: string;
  price: number;
  buying_price?: number;
  old_price?: number;
  stock: number;
  in_stock: boolean; // client computed or generated
  featured: boolean;
  badge?: string;
  brand?: string;
  gallery: string[];
  cover_image: string;
  tags: string[];
  priority: number;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

// Default Seed Data
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Fashion Accessories',
    slug: 'fashion-accessories',
    description: 'Curated lifestyle accents, bracelets, caps, scarfs, and smart styling additions.',
    icon: '🕶️',
    cover_image: 'https://images.unsplash.com/photo-1576053139778-7e32f2ae3cf4?w=800&auto=format&fit=crop&q=80',
    priority: 1,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat-2',
    name: 'Electronics & Accessories',
    slug: 'electronics',
    description: 'Smart utilities and devices designed for modern living.',
    icon: '⚡',
    cover_image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&auto=format&fit=crop&q=80',
    priority: 2,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat-3',
    name: 'Perfumes',
    slug: 'perfumes',
    description: 'Luxurious olfactory blends that define elegance.',
    icon: '✨',
    cover_image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80',
    priority: 3,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat-4',
    name: 'Deodorants',
    slug: 'deodorants',
    description: 'Fresh and energetic roll-ons and sprays for active protection.',
    icon: '🍃',
    cover_image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80',
    priority: 4,
    created_at: new Date().toISOString()
  },
  {
    id: 'cat-5',
    name: 'Cosmetics',
    slug: 'cosmetics',
    description: 'Organic and dermatologically tested beauty enhancements.',
    icon: '💄',
    cover_image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
    priority: 5,
    created_at: new Date().toISOString()
  }
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'p-1',
    sku: 'TK-ACC-001',
    slug: 'obsidian-beaded-bracelet',
    name: 'Obsidian Beaded Bracelet',
    short_description: 'Natural black obsidian beads with steel accents.',
    description: 'Handcrafted from genuine 8mm black obsidian stones, this bracelet adds a touch of modern minimalism. Believed to provide protective energy. Fitted with a secure, stretchable cord for comfort wear. Unisex.',
    category_id: 'cat-1',
    price: 899.00,
    buying_price: 450.00,
    old_price: 1200.00,
    stock: 15,
    in_stock: true,
    featured: true,
    badge: 'New',
    brand: 'TEKART Curation',
    gallery: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80'
    ],
    cover_image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&auto=format&fit=crop&q=80',
    tags: ['bracelet', 'jewelry', 'accessories'],
    priority: 1,
    seo_title: 'Obsidian Beaded Bracelet - TEKART',
    seo_description: 'Buy premium obsidian beaded bracelets at TEKART storefront.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-2',
    sku: 'TK-ACC-002',
    slug: 'classic-wool-knit-scarf',
    name: 'Classic Wool Knit Scarf',
    short_description: 'Premium wool blend neck scarf for cool styling.',
    description: 'Made from a premium wool-acrylic blend for itch-free warmth. Finished with elegant ribbed borders. Soft, cozy, and long enough to wrap twice.',
    category_id: 'cat-1',
    price: 1499.00,
    buying_price: 750.00,
    old_price: 1999.00,
    stock: 8,
    in_stock: true,
    featured: true,
    badge: 'Trending',
    brand: 'TEKART Curation',
    gallery: [
      'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80'
    ],
    cover_image: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&auto=format&fit=crop&q=80',
    tags: ['scarf', 'apparel', 'accessories'],
    priority: 2,
    seo_title: 'Classic Wool Knit Scarf - TEKART',
    seo_description: 'Premium wool knit scarves at TEKART.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-3',
    sku: 'TK-ELEC-001',
    slug: 'tekart-aura-anc-headphones',
    name: 'TEKART Aura ANC Headphones',
    short_description: 'Over-ear headphones with custom 40mm drivers and active noise cancellation.',
    description: 'Escape the noise and immerse yourself in studio-grade audio quality. The TEKART Aura headphones feature high-fidelity 40mm dynamic drivers that deliver punchy bass, pristine mids, and sparkly highs. Active Noise Cancellation neutralizes low-frequency ambient sounds. Includes Bluetooth 5.2, AAC/SBC decoding, and up to 40 hours of playtime with ANC active.',
    category_id: 'cat-2',
    price: 8999.00,
    buying_price: 4500.00,
    old_price: 12999.00,
    stock: 12,
    in_stock: true,
    featured: true,
    badge: 'Popular',
    brand: 'TEKART Audio',
    gallery: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
    ],
    cover_image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    tags: ['audio', 'headphones', 'anc'],
    priority: 3,
    seo_title: 'TEKART Aura Active Noise-Cancelling Headphones',
    seo_description: 'Studio-grade sound with 40dB hybrid ANC, 40h battery, and comfort fit design.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-4',
    sku: 'TK-ELEC-002',
    slug: 'minimalist-magsafe-wallet',
    name: 'Minimalist MagSafe Leather Wallet',
    short_description: 'Sleek top-grain leather wallet with secure magnetic snap.',
    description: 'Designed for the modern essentials. Cut from premium vegetable-tanned leather, this MagSafe wallet snaps instantly onto the back of your iPhone. Features a smart pull-tab mechanism that easily ejects up to 3 cards. RFDI shielded to protect your banking details.',
    category_id: 'cat-2',
    price: 1499.00,
    buying_price: 750.00,
    old_price: 1999.00,
    stock: 20,
    in_stock: true,
    featured: false,
    badge: 'Sale',
    brand: 'TEKART Gear',
    gallery: [
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80'
    ],
    cover_image: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80',
    tags: ['magsafe', 'wallet', 'accessories'],
    priority: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-5',
    sku: 'TK-PERF-001',
    slug: 'oud-noir-eau-de-parfum',
    name: 'Oud Noir Eau de Parfum',
    short_description: 'A rich fragrance of agarwood, amber, and saffron.',
    description: 'Oud Noir is a deep, sensual, and highly sophisticated oriental woody perfume. Centered around rare Cambodian agarwood, it starts with an aromatic blend of rich saffron and cardamom, cascading down to rose petals, and drying down to warm amber, leathergris, and patchouli. Long lasting projection.',
    category_id: 'cat-3',
    price: 3499.00,
    buying_price: 1800.00,
    old_price: 4999.00,
    stock: 3,
    in_stock: true,
    featured: true,
    badge: 'Best Seller',
    brand: 'TEKART Parfum',
    gallery: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80'
    ],
    cover_image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80',
    tags: ['perfume', 'oud', 'fragrance'],
    priority: 5,
    seo_title: 'Oud Noir Eau de Parfum - Premium Fragrance',
    seo_description: 'Experience Oud Noir, a signature premium blend of agarwood and warm saffron.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-6',
    sku: 'TK-PERF-002',
    slug: 'bergamot-cedarwood-cologne',
    name: 'Bergamot & Cedarwood Cologne',
    short_description: 'Fresh opening citrus notes transitioning to woody cedar.',
    description: 'An elegant day cologne starting with a bright, crisp splash of Calabrian bergamot and grapefruit. The heart unfolds notes of geranium and ginger, grounding in a rich, woody foundation of atlas cedarwood and vetiver. Energizing and premium.',
    category_id: 'cat-3',
    price: 2899.00,
    buying_price: 1450.00,
    old_price: 3500.00,
    stock: 10,
    in_stock: true,
    featured: false,
    badge: '',
    brand: 'TEKART Parfum',
    gallery: [
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80'
    ],
    cover_image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80',
    tags: ['cologne', 'bergamot', 'cedarwood'],
    priority: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-7',
    sku: 'TK-DEO-001',
    slug: 'fresh-citrus-roll-on',
    name: 'Fresh Citrus Active Deodorant Roll-On',
    short_description: 'All-day odor control with natural active extracts. Aluminum-free.',
    description: 'Formulated with organic citrus peels and eucalyptus leaf oil. Free from aluminum, parabens, and synthetic dyes. Provides 24-hour protection while allowing the skin to breathe naturally, leaving a fresh clean trace.',
    category_id: 'cat-4',
    price: 499.00,
    buying_price: 250.00,
    old_price: 599.00,
    stock: 25,
    in_stock: true,
    featured: false,
    badge: 'Natural',
    brand: 'TEKART Body Care',
    gallery: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80'
    ],
    cover_image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&auto=format&fit=crop&q=80',
    tags: ['deodorant', 'hygiene', 'roll-on'],
    priority: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'p-8',
    sku: 'TK-COSM-001',
    slug: 'matte-velvet-liquid-lipstick',
    name: 'Matte Velvet Liquid Lipstick',
    short_description: 'Satin matte finish, intense pigmentation liquid lipstick.',
    description: 'Our matte velvet liquid lipstick glides on effortlessly as a cream and dries down into a weightless, smudge-proof velvet coating. Enriched with avocado oil and vitamin E to prevent chapping. High-impact color that lasts for 12 hours.',
    category_id: 'cat-5',
    price: 899.00,
    buying_price: 450.00,
    old_price: 1200.00,
    stock: 0, // Out of stock for testing toggles
    in_stock: false,
    featured: true,
    badge: 'Popular',
    brand: 'TEKART Cosmetics',
    gallery: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=800&auto=format&fit=crop&q=80'
    ],
    cover_image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80',
    tags: ['lipstick', 'makeup', 'beauty'],
    priority: 8,
    seo_title: 'Matte Velvet Liquid Lipstick - TEKART',
    seo_description: 'Smudge-proof matte velvet liquid lipstick infused with vitamins.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Initialize LocalStorage if empty
const initMockDB = () => {
  if (!localStorage.getItem('tk_categories')) {
    localStorage.setItem('tk_categories', JSON.stringify(DEFAULT_CATEGORIES));
  }
  if (!localStorage.getItem('tk_products')) {
    localStorage.setItem('tk_products', JSON.stringify(DEFAULT_PRODUCTS));
  }
};

if (isMockMode) {
  initMockDB();
}

// Build the Supabase real client (even if placeholder keys are used to avoid runtime build issues)
const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'placeholder-anon-key-placeholder-anon-key-placeholder-anon-key';
export const realSupabase = createClient(
  isSupabaseConfigured ? supabaseUrl : fallbackUrl, 
  isSupabaseConfigured ? supabaseAnonKey : fallbackKey
);

// Create a unified Mock database interface matching standard Supabase select/insert/update/delete structures
class MockClient {
  private getCategories(): Category[] {
    return JSON.parse(localStorage.getItem('tk_categories') || '[]');
  }

  private setCategories(data: Category[]) {
    localStorage.setItem('tk_categories', JSON.stringify(data));
  }

  private getProducts(): Product[] {
    return JSON.parse(localStorage.getItem('tk_products') || '[]');
  }

  private setProducts(data: Product[]) {
    localStorage.setItem('tk_products', JSON.stringify(data));
  }

  // Mimic the JS SDK: supabase.from(table).select(...)
  from(table: string) {
    const isProducts = table === 'products';
    const isCategories = table === 'categories';

    return {
      select: (_columns = '*') => {
        let items: any[] = isProducts ? this.getProducts() : isCategories ? this.getCategories() : [];
        
        // Return a builder chain structure
        const queryResult = {
          data: items,
          error: null,
          eq: (field: string, value: any) => {
            queryResult.data = queryResult.data.filter(item => item[field] === value);
            return queryResult;
          },
          neq: (field: string, value: any) => {
            queryResult.data = queryResult.data.filter(item => item[field] !== value);
            return queryResult;
          },
          order: (field: string, { ascending = true } = {}) => {
            queryResult.data = [...queryResult.data].sort((a, b) => {
              if (a[field] < b[field]) return ascending ? -1 : 1;
              if (a[field] > b[field]) return ascending ? 1 : -1;
              return 0;
            });
            return queryResult;
          },
          single: () => {
            return { data: queryResult.data[0] || null, error: queryResult.data.length ? null : new Error('Row not found') };
          }
        };
        return queryResult;
      },

      insert: (rows: any[]) => {
        let items: any[] = isProducts ? this.getProducts() : isCategories ? this.getCategories() : [];
        const added: any[] = [];

        rows.forEach(row => {
          const newRow = {
            id: row.id || `mock-${Math.random().toString(36).substring(2, 11)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...row,
          };
          if (isProducts) {
            newRow.in_stock = (newRow.stock || 0) > 0;
            newRow.gallery = newRow.gallery || [];
            newRow.tags = newRow.tags || [];
          }
          items.push(newRow);
          added.push(newRow);
        });

        if (isProducts) this.setProducts(items as Product[]);
        if (isCategories) this.setCategories(items as Category[]);

        return {
          data: added,
          error: null,
          select: () => ({ data: added, error: null })
        };
      },

      update: (updates: any) => {
        return {
          eq: (field: string, value: any) => {
            let items: any[] = isProducts ? this.getProducts() : isCategories ? this.getCategories() : [];
            let updated: any[] = [];
            
            items = items.map(item => {
              if (item[field] === value) {
                const updatedItem = {
                  ...item,
                  ...updates,
                  updated_at: new Date().toISOString()
                };
                if (isProducts) {
                  if (updates.stock !== undefined) {
                    updatedItem.in_stock = updates.stock > 0;
                  }
                }
                updated.push(updatedItem);
                return updatedItem;
              }
              return item;
            });

            if (isProducts) this.setProducts(items as Product[]);
            if (isCategories) this.setCategories(items as Category[]);

            return { data: updated, error: null };
          }
        };
      },

      delete: () => {
        return {
          eq: (field: string, value: any) => {
            let items: any[] = isProducts ? this.getProducts() : isCategories ? this.getCategories() : [];
            const deleted = items.filter(item => item[field] === value);
            items = items.filter(item => item[field] !== value);

            if (isProducts) this.setProducts(items as Product[]);
            if (isCategories) this.setCategories(items as Category[]);

            return { data: deleted, error: null };
          }
        };
      }
    };
  }

  // Auth mock
  get auth() {
    return {
      getSession: async () => {
        const token = sessionStorage.getItem('tk_admin_token');
        if (token) {
          return { data: { session: { user: { email: 'owner@tekart.com' } } }, error: null };
        }
        return { data: { session: null }, error: null };
      },
      signInWithPassword: async ({ email, password }: any) => {
        if (email === 'owner@tekart.com' && password === 'admin123') {
          sessionStorage.setItem('tk_admin_token', 'mock-token-abc-123');
          return { data: { user: { email }, session: {} }, error: null };
        }
        return { data: { user: null, session: null }, error: new Error('Invalid email or password in offline mode.') };
      },
      signOut: async () => {
        sessionStorage.removeItem('tk_admin_token');
        return { error: null };
      }
    };
  }

  // Storage mock
  get storage() {
    return {
      from: (_bucket: string) => ({
        upload: async (path: string, file: File) => {
          // In mock mode we convert the file to a base64 Data URL and return a fake path
          const base64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          });
          
          // Generate a fake url that is actually the base64 code, or saving base64 to mock db storage
          const fakeUrl = base64; // Using base64 directly so the browser can render it
          return { data: { path, publicUrl: fakeUrl }, error: null };
        },
        getPublicUrl: (path: string) => {
          // If the path is already a base64 Data URL or HTTP URL, return it directly
          if (path.startsWith('data:') || path.startsWith('http')) {
            return { data: { publicUrl: path } };
          }
          return { data: { publicUrl: `https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop` } };
        }
      })
    };
  }
}

export const mockSupabase = new MockClient();

// Export the active client based on config
export const supabase = isMockMode ? (mockSupabase as any) : realSupabase;

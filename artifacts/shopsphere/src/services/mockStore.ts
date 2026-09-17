export type Role = 'user' | 'buyer' | 'seller' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type ProductStatus = 'active' | 'pending' | 'rejected' | 'out_of_stock';
export type OrderStatus = 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';

export interface User {
  id: string; name: string; email: string; phone?: string; address?: string;
  role: Role; status: UserStatus; createdAt: string; password?: string;
}
export interface Product {
  id: string; name: string; description: string; category: string; price: number;
  stock: number; condition: 'New' | 'Used'; brand?: string; image: string;
  images?: string[];
  sellerId: string; sellerName: string; rating: number; reviewCount: number;
  status: ProductStatus; createdAt: string;
}
export interface CartItem { productId: string; quantity: number; }
export interface OrderItem { productId: string; name: string; image: string; price: number; quantity: number; }
export interface Order {
  id: string; buyerId: string; buyerName?: string; items: OrderItem[]; totalAmount: number;
  shippingAddress: string; paymentMethod: string; status: OrderStatus; createdAt: string;
}
export interface Review {
  id: string; productId: string; userId: string; userName: string; rating: number; comment: string; createdAt: string;
}
export interface Category { id: string; name: string; count: number; }

const now = new Date().toISOString();

export const seedUsers: User[] = [
  { id: 'u-admin', name: 'ShopSphere Admin', email: 'admin@shopsphere.com', role: 'admin', status: 'active', createdAt: now, password: 'Admin123!' },
  { id: 'u-seller-priya', name: 'Priya Sharma', email: 'priya.seller@shopsphere.com', role: 'seller', status: 'active', createdAt: now, password: 'Seller123!', phone: '+91 98112 34567', address: 'Shop 14, Brigade Gateway Campus, Malleshwaram, Bengaluru 560055' },
  { id: 'u-seller-rohan', name: 'Rohan Verma', email: 'rohan.seller@shopsphere.com', role: 'seller', status: 'active', createdAt: now, password: 'Seller123!', phone: '+91 97420 67890', address: 'Studio 204, Powai Tech Quarter, Mumbai 400076' },
  { id: 'u-buyer-aarav', name: 'Aarav Mehta', email: 'aarav.mehta@gmail.com', role: 'buyer', status: 'active', createdAt: now, password: 'Buyer123!', phone: '+91 98201 44552', address: 'Flat 402, Sunshine Residency, HSR Layout Sector 2, Bengaluru 560102' },
  { id: 'u-buyer-sneha', name: 'Sneha Kulkarni', email: 'sneha.kulkarni@gmail.com', role: 'buyer', status: 'active', createdAt: now, password: 'Buyer123!', phone: '+91 98450 11223', address: 'B-12, Green Glen Layout, Bellandur, Bengaluru 560103' },
  { id: 'u-buyer-vikram', name: 'Vikramaditya Rao', email: 'vikram.rao@gmail.com', role: 'buyer', status: 'active', createdAt: now, password: 'Buyer123!', phone: '+91 99002 88991', address: 'Penthouse 8A, Prestige Shantiniketan, Whitefield, Bengaluru 560066' },
];

export const seedProducts: Product[] = [
  {
    id: 'prod-casio-991cw',
    name: 'Casio FX-991CW ClassWiz Scientific Calculator',
    description: '540+ functions, quad-color natural textbook display, QR code equation visualization, and dual solar/battery power. Approved for CBSE, JEE, and University examinations.',
    category: 'Calculators',
    price: 1595,
    stock: 18,
    condition: 'New',
    brand: 'Casio',
    image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
    sellerId: 'u-seller-priya',
    sellerName: 'EduTech & Stationery Hub (Priya Sharma)',
    rating: 4.9,
    reviewCount: 24,
    status: 'active',
    createdAt: now,
  },
  {
    id: 'prod-ti-30xs',
    name: 'Texas Instruments TI-30XS MultiView Scientific Calculator',
    description: 'MultiView 4-line display showing simultaneous calculations and fraction-decimal conversions. Ergonomic non-slip grips and durable slide-on protective hard case.',
    category: 'Calculators',
    price: 2150,
    stock: 12,
    condition: 'New',
    brand: 'Texas Instruments',
    image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&auto=format&fit=crop&q=80',
    sellerId: 'u-seller-priya',
    sellerName: 'EduTech & Stationery Hub (Priya Sharma)',
    rating: 4.8,
    reviewCount: 16,
    status: 'active',
    createdAt: now,
  },
  {
    id: 'prod-parker-frontier',
    name: 'Parker Frontier Matte Black Fountain Pen (Gold Trim)',
    description: 'Iconic matte black epoxy resin finish with 23K gold plated trims. Precision-engineered stainless steel medium nib with twin-channel ink feed for effortless, fatigue-free note-taking.',
    category: 'Pens & Stationery',
    price: 899,
    stock: 25,
    condition: 'New',
    brand: 'Parker',
    image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80',
    sellerId: 'u-seller-priya',
    sellerName: 'EduTech & Stationery Hub (Priya Sharma)',
    rating: 4.9,
    reviewCount: 38,
    status: 'active',
    createdAt: now,
  },
  {
    id: 'prod-uniball-air',
    name: 'Uni-ball Air Micro 0.5mm Rollerball Pen Pack (5 Pens)',
    description: 'Pressure-sensitive tip adapts to your writing angle. Fade-proof, tamper-proof and waterproof Super Ink formulation that doesn\'t bleed through student notebook pages.',
    category: 'Pens & Stationery',
    price: 450,
    stock: 40,
    condition: 'New',
    brand: 'Uni-ball',
    image: 'https://images.unsplash.com/photo-1585336261026-78b1767c2957?w=800&auto=format&fit=crop&q=80',
    sellerId: 'u-seller-priya',
    sellerName: 'EduTech & Stationery Hub (Priya Sharma)',
    rating: 4.7,
    reviewCount: 52,
    status: 'active',
    createdAt: now,
  },
  {
    id: 'prod-classmate-pulse',
    name: 'Classmate Pulse Hardbound Spiral Notebook (300 Pages)',
    description: 'Single line ruling, 70 GSM archival acid-free paper, perforated tear-off sheets, snag-free double spiral wire binding, and water-resistant protective poly cover.',
    category: 'Notebooks',
    price: 260,
    stock: 50,
    condition: 'New',
    brand: 'Classmate',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
    sellerId: 'u-seller-priya',
    sellerName: 'EduTech & Stationery Hub (Priya Sharma)',
    rating: 4.8,
    reviewCount: 64,
    status: 'active',
    createdAt: now,
  },
  {
    id: 'prod-rhodia-webbie',
    name: 'Rhodia Webnotebook A5 Dot Grid Journal (Clairefontaine Vellum)',
    description: 'Italian leatherette hardcover with embossed logo, expanding inner pocket, ribbon marker, and elastic closure. Super-smooth 90 GSM fountain pen friendly paper with zero feathering.',
    category: 'Notebooks',
    price: 1299,
    stock: 15,
    condition: 'New',
    brand: 'Rhodia',
    image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80',
    sellerId: 'u-seller-rohan',
    sellerName: 'Lumina Study & Living Co. (Rohan Verma)',
    rating: 5.0,
    reviewCount: 19,
    status: 'active',
    createdAt: now,
  },
  {
    id: 'prod-philips-led-desk',
    name: 'Philips EyeCare Smart LED Study Table Lamp (Touch Dimmer)',
    description: 'Flicker-free CRI 95+ light with 5 color temperatures (2700K warm white to 6500K daylight study). Flexible 360-degree silicone gooseneck and integrated 10W fast USB device charger.',
    category: 'Table Lamps',
    price: 2499,
    stock: 14,
    condition: 'New',
    brand: 'Philips',
    image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=800&auto=format&fit=crop&q=80',
    sellerId: 'u-seller-rohan',
    sellerName: 'Lumina Study & Living Co. (Rohan Verma)',
    rating: 4.9,
    reviewCount: 41,
    status: 'active',
    createdAt: now,
  },
  {
    id: 'prod-nordic-wood-lamp',
    name: 'Nordic Solid Beechwood Reading Table Lamp with Fabric Shade',
    description: 'Handcrafted solid beechwood base with natural oatmeal linen lampshade. Provides soft, diffused ambient lighting ideal for late-night study sessions and dorm bedrooms.',
    category: 'Table Lamps',
    price: 1850,
    stock: 9,
    condition: 'New',
    brand: 'Nordic Living',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
    sellerId: 'u-seller-rohan',
    sellerName: 'Lumina Study & Living Co. (Rohan Verma)',
    rating: 4.7,
    reviewCount: 15,
    status: 'active',
    createdAt: now,
  },
  {
    id: 'prod-braun-digital-clock',
    name: 'Braun Classic Digital Voice-Activated Alarm Clock (Temp Display)',
    description: 'High-contrast negative LCD screen with indoor temperature sensor, date display, crescendo alarm sound, integrated backlight snooze function, and quiet precision quartz circuitry.',
    category: 'Alarm Clocks',
    price: 1750,
    stock: 20,
    condition: 'New',
    brand: 'Braun',
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=80',
    sellerId: 'u-seller-rohan',
    sellerName: 'Lumina Study & Living Co. (Rohan Verma)',
    rating: 4.8,
    reviewCount: 28,
    status: 'active',
    createdAt: now,
  },
  {
    id: 'prod-sunrise-wake-clock',
    name: 'Aesthetic Sunrise Wake-Up Light & Digital Alarm Clock (FM Radio)',
    description: 'Simulates natural 30-minute gradual sunrise to gently wake you up refreshed. 7 soothing nature sounds, dual alarms, tap-to-snooze, and ambient multi-color bedside lamp.',
    category: 'Alarm Clocks',
    price: 3200,
    stock: 11,
    condition: 'New',
    brand: 'Lumina',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    sellerId: 'u-seller-rohan',
    sellerName: 'Lumina Study & Living Co. (Rohan Verma)',
    rating: 4.9,
    reviewCount: 33,
    status: 'active',
    createdAt: now,
  }
];

export const seedReviews: Review[] = [];

export const seedOrders: Order[] = [
  {
    id: 'ord-1092a1',
    buyerId: 'u-buyer-aarav',
    buyerName: 'Aarav Mehta',
    items: [
      {
        productId: 'prod-casio-991cw',
        name: 'Casio FX-991CW ClassWiz Scientific Calculator',
        image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=800&auto=format&fit=crop&q=80',
        price: 1595,
        quantity: 1
      },
      {
        productId: 'prod-classmate-pulse',
        name: 'Classmate Pulse Hardbound Spiral Notebook (300 Pages)',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
        price: 260,
        quantity: 2
      }
    ],
    totalAmount: 2115,
    shippingAddress: 'Flat 402, Sunshine Residency, HSR Layout Sector 2, Bengaluru 560102',
    paymentMethod: 'UPI (Google Pay)',
    status: 'delivered',
    createdAt: now
  },
  {
    id: 'ord-2041b3',
    buyerId: 'u-buyer-aarav',
    buyerName: 'Aarav Mehta',
    items: [
      {
        productId: 'prod-philips-led-desk',
        name: 'Philips EyeCare Smart LED Study Table Lamp (Touch Dimmer)',
        image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=800&auto=format&fit=crop&q=80',
        price: 2499,
        quantity: 1
      },
      {
        productId: 'prod-braun-digital-clock',
        name: 'Braun Classic Digital Voice-Activated Alarm Clock (Temp Display)',
        image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=80',
        price: 1750,
        quantity: 1
      }
    ],
    totalAmount: 4249,
    shippingAddress: 'Flat 402, Sunshine Residency, HSR Layout Sector 2, Bengaluru 560102',
    paymentMethod: 'Credit Card',
    status: 'shipped',
    createdAt: now
  },
  {
    id: 'ord-3055c8',
    buyerId: 'u-buyer-sneha',
    buyerName: 'Sneha Kulkarni',
    items: [
      {
        productId: 'prod-parker-frontier',
        name: 'Parker Frontier Matte Black Fountain Pen (Gold Trim)',
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80',
        price: 899,
        quantity: 1
      },
      {
        productId: 'prod-rhodia-webbie',
        name: 'Rhodia Webnotebook A5 Dot Grid Journal (Clairefontaine Vellum)',
        image: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=800&auto=format&fit=crop&q=80',
        price: 1299,
        quantity: 1
      },
      {
        productId: 'prod-uniball-air',
        name: 'Uni-ball Air Micro 0.5mm Rollerball Pen Pack (5 Pens)',
        image: 'https://images.unsplash.com/photo-1585336261026-78b1767c2957?w=800&auto=format&fit=crop&q=80',
        price: 450,
        quantity: 1
      }
    ],
    totalAmount: 2648,
    shippingAddress: 'B-12, Green Glen Layout, Bellandur, Bengaluru 560103',
    paymentMethod: 'UPI (PhonePe)',
    status: 'delivered',
    createdAt: now
  },
  {
    id: 'ord-4019d4',
    buyerId: 'u-buyer-sneha',
    buyerName: 'Sneha Kulkarni',
    items: [
      {
        productId: 'prod-sunrise-wake-clock',
        name: 'Aesthetic Sunrise Wake-Up Light & Digital Alarm Clock (FM Radio)',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
        price: 3200,
        quantity: 1
      }
    ],
    totalAmount: 3200,
    shippingAddress: 'B-12, Green Glen Layout, Bellandur, Bengaluru 560103',
    paymentMethod: 'NetBanking',
    status: 'packed',
    createdAt: now
  },
  {
    id: 'ord-5077e6',
    buyerId: 'u-buyer-vikram',
    buyerName: 'Vikramaditya Rao',
    items: [
      {
        productId: 'prod-ti-30xs',
        name: 'Texas Instruments TI-30XS MultiView Scientific Calculator',
        image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&auto=format&fit=crop&q=80',
        price: 2150,
        quantity: 1
      },
      {
        productId: 'prod-parker-frontier',
        name: 'Parker Frontier Matte Black Fountain Pen (Gold Trim)',
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80',
        price: 899,
        quantity: 2
      }
    ],
    totalAmount: 3948,
    shippingAddress: 'Penthouse 8A, Prestige Shantiniketan, Whitefield, Bengaluru 560066',
    paymentMethod: 'Cash on Delivery',
    status: 'placed',
    createdAt: now
  },
  {
    id: 'ord-6088f9',
    buyerId: 'u-buyer-vikram',
    buyerName: 'Vikramaditya Rao',
    items: [
      {
        productId: 'prod-nordic-wood-lamp',
        name: 'Nordic Solid Beechwood Reading Table Lamp with Fabric Shade',
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
        price: 1850,
        quantity: 1
      },
      {
        productId: 'prod-braun-digital-clock',
        name: 'Braun Classic Digital Voice-Activated Alarm Clock (Temp Display)',
        image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=80',
        price: 1750,
        quantity: 1
      }
    ],
    totalAmount: 3600,
    shippingAddress: 'Penthouse 8A, Prestige Shantiniketan, Whitefield, Bengaluru 560066',
    paymentMethod: 'UPI (Paytm)',
    status: 'shipped',
    createdAt: now
  }
];

export const seedCategories: Category[] = [
  { id: 'cat-1', name: 'Calculators', count: 2 },
  { id: 'cat-2', name: 'Pens & Stationery', count: 2 },
  { id: 'cat-3', name: 'Notebooks', count: 2 },
  { id: 'cat-4', name: 'Table Lamps', count: 2 },
  { id: 'cat-5', name: 'Alarm Clocks', count: 2 },
];

export const readStore = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(`shopsphere_v2:${key}`);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
};
export const writeStore = (key: string, value: unknown) =>
  localStorage.setItem(`shopsphere_v2:${key}`, JSON.stringify(value));

export const productService = {
  list: () => readStore<Product[]>('products', seedProducts),
  save: (products: Product[]) => writeStore('products', products),
};
export const orderService = {
  list: () => readStore<Order[]>('orders', seedOrders),
  save: (orders: Order[]) => writeStore('orders', orders),
};
export const userService = {
  list: () => readStore<User[]>('users', seedUsers),
  save: (users: User[]) => writeStore('users', users),
};
export const reviewService = {
  list: () => readStore<Review[]>('reviews', seedReviews),
};
export const categoryService = {
  list: () => readStore<Category[]>('categories', seedCategories),
  save: (categories: Category[]) => writeStore('categories', categories),
};
export const analyticsService = {
  track: (event: string, metadata?: Record<string, unknown>) => {
    const events = readStore<{ event: string; metadata?: Record<string, unknown>; at: string }[]>('analytics', []);
    writeStore('analytics', [...events.slice(-99), { event, metadata, at: new Date().toISOString() }]);
  },
};
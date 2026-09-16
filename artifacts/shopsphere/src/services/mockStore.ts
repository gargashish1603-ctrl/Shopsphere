export type Role = 'user' | 'admin';
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
  sellerId: string; sellerName: string; rating: number; reviewCount: number;
  status: ProductStatus; createdAt: string;
}
export interface CartItem { productId: string; quantity: number; }
export interface OrderItem { productId: string; name: string; image: string; price: number; quantity: number; }
export interface Order {
  id: string; buyerId: string; items: OrderItem[]; totalAmount: number;
  shippingAddress: string; paymentMethod: string; status: OrderStatus; createdAt: string;
}
export interface Review {
  id: string; productId: string; userId: string; userName: string; rating: number; comment: string; createdAt: string;
}
export interface Category { id: string; name: string; count: number; }

const images = [
  'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/3945653/pexels-photo-3945653.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/9095/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/631157/pexels-photo-631157.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/15927879/pexels-photo-15927879.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=900',
];
const now = new Date();
const ago = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();
const sellers = ['Aarav Studio', 'Mira Finds', 'The Reading Room', 'Namma Home', 'Kite & Loom', 'Blue Door Collective'];
const names = ['Aditi Rao', 'Kabir Mehta', 'Neha Iyer', 'Rohan Shah', 'Ishita Sen', 'Vikram Das', 'Tara Nair', 'Arjun Kapoor', 'Meera Joshi', 'Dev Malhotra'];
const productSeeds: [string, string, number, string, string][] = [
  ['Nothing Phone (2a) 5G', 'Electronics', 23999, 'Nothing', 'A clean, fast phone with a remarkably thoughtful interface.'],
  ['Sony WH-1000XM5 Headphones', 'Electronics', 24990, 'Sony', 'Immersive noise cancelling for focus, flights, and slow Sundays.'],
  ['Kindle Paperwhite 11th Gen', 'Electronics', 11999, 'Amazon', 'Warm light and weeks of reading in a pocket-sized screen.'],
  ['JBL Flip 6 Portable Speaker', 'Electronics', 8999, 'JBL', 'Room-filling sound in a compact, splash-proof body.'],
  ['Logitech MX Mechanical Mini', 'Electronics', 10995, 'Logitech', 'Tactile low-profile keys for long, happy work sessions.'],
  ['Fujifilm Instax Mini 12', 'Electronics', 7999, 'Fujifilm', 'Point, shoot, and keep the little moments tangible.'],
  ['Handwoven Kala Cotton Overshirt', 'Fashion', 1850, 'Kite & Loom', 'Breathable handloom cotton, cut for an easy everyday fit.'],
  ['Indigo Block Print Dress', 'Fashion', 2450, 'Mira Finds', 'A relaxed silhouette with a hand-stamped indigo story.'],
  ['Leather Crossbody Satchel', 'Fashion', 3200, 'Aarav Studio', 'Vegetable-tanned leather that gets better with every city.'],
  ['Khadi Camp Collar Shirt', 'Fashion', 1790, 'Kite & Loom', 'Soft khadi with a modern, unfussy camp collar.'],
  ['Canvas Everyday Tote', 'Fashion', 780, 'Blue Door Collective', 'A sturdy, screen-printed carry-all for market mornings.'],
  ['Silver Filigree Studs', 'Fashion', 1250, 'Mira Finds', 'Hand-finished silver studs with a quiet glint.'],
  ['The God of Small Things', 'Books', 399, 'The Reading Room', 'A much-loved paperback in excellent reading condition.'],
  ['A Suitable Boy', 'Books', 520, 'The Reading Room', 'An expansive, engrossing family saga for unhurried weekends.'],
  ['The Art of Indian Cuisine', 'Books', 950, 'Namma Home', 'Regional recipes, pantry notes, and stories worth cooking.'],
  ['Atomic Habits', 'Books', 499, 'The Reading Room', 'A practical, annotated copy for building better rhythms.'],
  ['The Blue Umbrella', 'Books', 220, 'The Reading Room', 'Ruskin Bond’s pocket-sized mountain classic.'],
  ['Pachinko', 'Books', 599, 'The Reading Room', 'A sweeping family story, softly read and ready for a new home.'],
  ['Terracotta Table Lamp', 'Home', 2200, 'Namma Home', 'A warm, sculptural glow shaped by a Jaipur ceramicist.'],
  ['Linen Cushion Cover Set', 'Home', 1150, 'Namma Home', 'Two naturally dyed covers to soften a favourite corner.'],
  ['Brass Lotus Diya', 'Home', 680, 'Aarav Studio', 'A cast brass diya made for slow evening rituals.'],
  ['Rattan Storage Basket', 'Home', 1450, 'Blue Door Collective', 'Handwoven storage with a generous, light-filled silhouette.'],
  ['Marble Serving Board', 'Home', 1800, 'Namma Home', 'Cool white marble with a simple teak handle.'],
  ['Monsoon Tea Set', 'Home', 2400, 'Namma Home', 'Six ceramic cups designed for long conversations.'],
  ['Mysore Yoga Mat', 'Sports', 1499, 'Blue Door Collective', 'A grippy, generous mat for gentle or ambitious practice.'],
  ['Decathlon Road Cycling Helmet', 'Sports', 2650, 'Aarav Studio', 'Lightweight protection with an airy fit.'],
  ['Resistance Band Set', 'Sports', 899, 'Blue Door Collective', 'Five strengths for a practical home workout kit.'],
  ['Handstitched Cricket Ball', 'Sports', 620, 'Aarav Studio', 'A durable red leather ball for serious laneside games.'],
  ['Trek Daypack 20L', 'Sports', 2199, 'Kite & Loom', 'A weather-ready daypack for short trails and longer commutes.'],
  ['Bamboo Desk Organiser', 'Other', 550, 'Namma Home', 'A neat little landing place for cables, cards, and pens.'],
  ['Artisan Coffee Sampler', 'Other', 890, 'Mira Finds', 'Three small-batch Indian roasts, each with a different mood.'],
  ['Handpainted Ceramic Vase', 'Other', 1350, 'Namma Home', 'An imperfect, one-off shape for one beautiful stem.'],
];

export const seedUsers: User[] = [
  { id: 'u-admin', name: 'ShopSphere Admin', email: 'admin@shopsphere.com', role: 'admin', status: 'active', createdAt: ago(420), password: 'Admin123!' },
  { id: 'u-demo', name: 'Priya Menon', email: 'user@shopsphere.com', phone: '+91 98765 43210', address: '14, 2nd Cross, Indiranagar, Bengaluru 560038', role: 'user', status: 'active', createdAt: ago(100), password: 'User123!' },
  ...names.map((name, i) => ({ id: `u-${i + 2}`, name, email: `${name.toLowerCase().replace(' ', '.')}@mail.com`, role: 'user' as Role, status: (i === 5 ? 'suspended' : 'active') as UserStatus, createdAt: ago(30 + i * 15), password: 'Welcome1!' })),
];

export const seedProducts: Product[] = productSeeds.map(([name, category, price, brand, description], i) => ({
  id: `p-${i + 1}`, name, category, price, brand, description, stock: i === 7 ? 0 : 4 + (i * 3) % 19,
  condition: i % 7 === 0 ? 'Used' : 'New', image: images[i % images.length], sellerId: i < 5 ? 'u-demo' : `u-${(i % 6) + 2}`,
  sellerName: i < 5 ? 'Priya Menon' : sellers[i % sellers.length], rating: Number((4.1 + (i % 9) / 10).toFixed(1)), reviewCount: 6 + (i * 7) % 42,
  status: i === 7 ? 'out_of_stock' : 'active', createdAt: ago(i + 1),
}));

export const seedReviews: Review[] = Array.from({ length: 20 }, (_, i) => ({
  id: `r-${i + 1}`, productId: `p-${(i % 12) + 1}`, userId: `u-${(i % 9) + 2}`, userName: names[i % names.length],
  rating: 4 + (i % 2), comment: ['Arrived beautifully packed and exactly as described.', 'The seller was kind, quick, and thoughtful.', 'A genuinely great find. I use it every day.', 'Lovely quality, would happily shop here again.'][i % 4], createdAt: ago(i + 2),
}));

export const seedOrders: Order[] = Array.from({ length: 15 }, (_, i) => {
  const product = seedProducts[i % seedProducts.length];
  const quantity = (i % 3) + 1;
  return {
    id: `ord-${String(1048 - i).padStart(4, '0')}`, buyerId: i % 4 === 0 ? 'u-demo' : `u-${(i % 8) + 2}`,
    items: [{ productId: product.id, name: product.name, image: product.image, price: product.price, quantity }],
    totalAmount: product.price * quantity + 80, shippingAddress: '14, 2nd Cross, Indiranagar, Bengaluru 560038',
    paymentMethod: i % 2 ? 'UPI' : 'Card ending 42', status: (['delivered', 'shipped', 'packed', 'placed', 'cancelled'] as OrderStatus[])[i % 5], createdAt: ago(i * 2 + 3),
  };
});

export const seedCategories: Category[] = ['Electronics', 'Fashion', 'Books', 'Home', 'Sports', 'Other'].map((name, i) => ({
  id: `cat-${i + 1}`, name, count: seedProducts.filter((p) => p.category === name).length,
}));

export const readStore = <T,>(key: string, fallback: T): T => {
  try { const raw = localStorage.getItem(`shopsphere:${key}`); return raw ? JSON.parse(raw) as T : fallback; } catch { return fallback; }
};
export const writeStore = (key: string, value: unknown) => localStorage.setItem(`shopsphere:${key}`, JSON.stringify(value));

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
export const reviewService = { list: () => readStore<Review[]>('reviews', seedReviews) };
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
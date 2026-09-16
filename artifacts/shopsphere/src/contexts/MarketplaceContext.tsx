import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  analyticsService, categoryService, orderService, productService, readStore, reviewService,
  userService,
  writeStore, type CartItem, type Category, type Order, type Product, type Review, type User,
} from '@/services/mockStore';

type Toast = { id: number; message: string; tone?: 'success' | 'error' };
type Ctx = {
  user: User | null; users: User[]; products: Product[]; orders: Order[]; reviews: Review[]; categories: Category[];
  cart: CartItem[]; wishlist: string[]; toasts: Toast[];
  login: (email: string, password: string) => { ok: boolean; message?: string };
  logout: () => void; register: (name: string, email: string, password: string) => { ok: boolean; message?: string };
  addToCart: (productId: string, quantity?: number) => void; updateCart: (productId: string, quantity: number) => void; removeFromCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void; isWishlisted: (productId: string) => boolean; createOrder: (data: Omit<Order, 'id' | 'createdAt'>) => Order;
  saveProduct: (product: Product) => void; deleteProduct: (id: string) => void; updateUser: (user: User) => void; setUserStatus: (id: string, status: User['status']) => void;
  saveCategory: (category: Category) => void; deleteCategory: (id: string) => void; toast: (message: string, tone?: Toast['tone']) => void; dismissToast: (id: number) => void;
};
const MarketplaceContext = createContext<Ctx | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStore<User | null>('session', null));
  const [users, setUsers] = useState<User[]>(() => userService.list());
  const [products, setProducts] = useState<Product[]>(() => productService.list());
  const [orders, setOrders] = useState<Order[]>(() => orderService.list());
  const [reviews] = useState<Review[]>(() => reviewService.list());
  const [categories, setCategories] = useState<Category[]>(() => categoryService.list());
  const [cart, setCart] = useState<CartItem[]>(() => readStore<CartItem[]>('cart', []));
  const [wishlist, setWishlist] = useState<string[]>(() => readStore<string[]>('wishlist', []));
  const [toasts, setToasts] = useState<Toast[]>([]);
  useEffect(() => { writeStore('session', user); }, [user]);
  useEffect(() => { writeStore('cart', cart); }, [cart]);
  useEffect(() => { writeStore('wishlist', wishlist); }, [wishlist]);
  const toast = (message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now(); setToasts((prev) => [...prev, { id, message, tone }]); window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };
  const login = (email: string, password: string) => {
    const found = users.find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase());
    if (!found || found.password !== password) return { ok: false, message: 'That email and password combination is not recognised.' };
    if (found.status === 'suspended') return { ok: false, message: 'This account is currently suspended. Please contact support.' };
    setUser(found); analyticsService.track('login', { userId: found.id }); toast(`Welcome back, ${found.name.split(' ')[0]}.`); return { ok: true };
  };
  const register = (name: string, email: string, password: string) => {
    if (users.some((candidate) => candidate.email.toLowerCase() === email.toLowerCase())) return { ok: false, message: 'An account with that email already exists.' };
    const next: User = { id: `u-${Date.now()}`, name, email, password, role: 'user', status: 'active', createdAt: new Date().toISOString() };
    const nextUsers = [...users, next]; setUsers(nextUsers); userService.save(nextUsers); setUser(next); toast('Your ShopSphere account is ready.'); return { ok: true };
  };
  const addToCart = (productId: string, quantity = 1) => {
    const product = products.find((item) => item.id === productId);
    if (!product || product.stock < 1) { toast('This listing is out of stock.', 'error'); return; }
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      const nextQuantity = Math.min(product.stock, (existing?.quantity || 0) + quantity);
      return existing ? prev.map((item) => item.productId === productId ? { ...item, quantity: nextQuantity } : item) : [...prev, { productId, quantity: nextQuantity }];
    });
    analyticsService.track('add_to_cart', { productId }); toast('Added to your bag.');
  };
  const updateCart = (productId: string, quantity: number) => {
    const stock = products.find((item) => item.id === productId)?.stock || 0;
    setCart((prev) => quantity < 1 || stock < 1 ? prev.filter((item) => item.productId !== productId) : prev.map((item) => item.productId === productId ? { ...item, quantity: Math.min(quantity, stock) } : item));
  };
  const removeFromCart = (productId: string) => { setCart((prev) => prev.filter((item) => item.productId !== productId)); toast('Removed from your bag.'); };
  const toggleWishlist = (productId: string) => setWishlist((prev) => { const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]; toast(next.includes(productId) ? 'Saved to your wishlist.' : 'Removed from wishlist.'); return next; });
  const createOrder = (data: Omit<Order, 'id' | 'createdAt'>) => {
    const order: Order = { ...data, id: `ord-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString() };
    const next = [order, ...orders]; setOrders(next); orderService.save(next); setCart([]); analyticsService.track('order_created', { orderId: order.id, total: order.totalAmount }); return order;
  };
  const saveProduct = (product: Product) => { const next = products.some((p) => p.id === product.id) ? products.map((p) => p.id === product.id ? product : p) : [product, ...products]; setProducts(next); productService.save(next); toast('Listing saved.'); };
  const deleteProduct = (id: string) => { const next = products.filter((p) => p.id !== id); setProducts(next); productService.save(next); toast('Listing removed.'); };
  const updateUser = (updated: User) => { const next = users.map((item) => item.id === updated.id ? updated : item); setUsers(next); userService.save(next); if (user?.id === updated.id) setUser(updated); toast('Profile updated.'); };
  const setUserStatus = (id: string, status: User['status']) => { const updated = users.find((u) => u.id === id); if (updated) updateUser({ ...updated, status }); };
  const saveCategory = (category: Category) => { const next = categories.some((c) => c.id === category.id) ? categories.map((c) => c.id === category.id ? category : c) : [...categories, category]; setCategories(next); categoryService.save(next); toast('Category saved.'); };
  const deleteCategory = (id: string) => { const next = categories.filter((c) => c.id !== id); setCategories(next); categoryService.save(next); toast('Category removed.'); };
  const value = useMemo<Ctx>(() => ({ user, users, products, orders, reviews, categories, cart, wishlist, toasts, login, logout: () => { setUser(null); toast('You have been signed out.'); }, register, addToCart, updateCart, removeFromCart, toggleWishlist, isWishlisted: (id) => wishlist.includes(id), createOrder, saveProduct, deleteProduct, updateUser, setUserStatus, saveCategory, deleteCategory, toast, dismissToast: (id) => setToasts((prev) => prev.filter((t) => t.id !== id)) }), [user, users, products, orders, reviews, categories, cart, wishlist, toasts]);
  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}
export function useMarket() { const value = useContext(MarketplaceContext); if (!value) throw new Error('useMarket must be used within MarketplaceProvider'); return value; }
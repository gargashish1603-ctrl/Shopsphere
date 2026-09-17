import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  analyticsService, categoryService, orderService, productService, readStore, reviewService,
  userService,
  writeStore, type CartItem, type Category, type Order, type Product, type Review, type User,
} from '@/services/mockStore';

type Toast = { id: number; message: string; tone?: 'success' | 'error' };

type Ctx = {
  user: User | null;
  users: User[];
  products: Product[];
  orders: Order[];
  reviews: Review[];
  categories: Category[];
  cart: CartItem[];
  wishlist: string[];
  toasts: Toast[];
  token: string | null;
  login: (email: string, password: string, role?: string) => Promise<{ ok: boolean; message?: string; role?: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string, role?: string) => Promise<{ ok: boolean; message?: string; role?: string }>;
  addToCart: (productId: string, quantity?: number) => void;
  updateCart: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  createOrder: (data: Omit<Order, 'id' | 'createdAt'>) => Order;
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateUser: (user: User) => void;
  setUserStatus: (id: string, status: User['status']) => void;
  saveCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  toast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;
  mode: 'buy' | 'sell';
  setMode: (mode: 'buy' | 'sell') => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
};

const MarketplaceContext = createContext<Ctx | null>(null);

export function MarketplaceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStore<User | null>('session', null));
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('shopsphere_jwt_token'));
  const [users, setUsers] = useState<User[]>(() => userService.list());
  const [products, setProducts] = useState<Product[]>(() => productService.list());
  const [orders, setOrders] = useState<Order[]>(() => orderService.list());
  const [reviews] = useState<Review[]>(() => reviewService.list());
  const [categories, setCategories] = useState<Category[]>(() => categoryService.list());
  const [cart, setCart] = useState<CartItem[]>(() => readStore<CartItem[]>('cart', []));
  const [wishlist, setWishlist] = useState<string[]>(() => readStore<string[]>('wishlist', []));
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mode, setModeState] = useState<'buy' | 'sell'>(() => {
    const saved = localStorage.getItem('shopsphere_mode');
    return (saved === 'sell' || saved === 'buy') ? saved : 'buy';
  });

  const setMode = (newMode: 'buy' | 'sell') => {
    setModeState(newMode);
    localStorage.setItem('shopsphere_mode', newMode);
  };

  useEffect(() => { writeStore('session', user); }, [user]);
  useEffect(() => { writeStore('cart', cart); }, [cart]);
  useEffect(() => { writeStore('wishlist', wishlist); }, [wishlist]);

  const toast = (message: string, tone: Toast['tone'] = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  // Check auth session with JWT backend on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('shopsphere_jwt_token');
    if (storedToken) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` }
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error('Session expired');
        })
        .then((data) => {
          if (data.user) {
            setUser(data.user);
          }
        })
        .catch(() => {});
    }
  }, []);

  // Fetch live products from backend
  const fetchProducts = useCallback(() => {
    const activeToken = token || localStorage.getItem('shopsphere_jwt_token');
    const headers: Record<string, string> = {};
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

    const url = user?.role === 'admin' ? '/api/products?include_all=true' : '/api/products';
    fetch(url, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
          productService.save(data);
        }
      })
      .catch(() => {});
  }, [token, user?.role]);

  useEffect(() => {
    fetchProducts();
    const interval = setInterval(fetchProducts, 8000);
    return () => clearInterval(interval);
  }, [fetchProducts]);

  // Fetch live orders from backend
  const fetchOrders = useCallback(() => {
    const activeToken = token || localStorage.getItem('shopsphere_jwt_token');
    if (activeToken) {
      fetch('/api/orders', {
        headers: { Authorization: `Bearer ${activeToken}` }
      })
        .then((res) => res.ok ? res.json() : [])
        .then((data) => {
          if (Array.isArray(data)) {
            setOrders(data);
            orderService.save(data);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  // Fetch admin users if user is admin
  const fetchUsers = useCallback(() => {
    const activeToken = token || localStorage.getItem('shopsphere_jwt_token');
    if (user?.role === 'admin' && activeToken) {
      fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${activeToken}` }
      })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setUsers(data);
            userService.save(data);
          }
        })
        .catch(() => {});
    }
  }, [user?.role, token]);

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 10000);
    return () => clearInterval(interval);
  }, [fetchUsers]);

  const login = async (email: string, password: string, requestedRole?: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: requestedRole }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        localStorage.setItem('shopsphere_jwt_token', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        analyticsService.track('login', { userId: data.user.id });
        toast(`Welcome back, ${data.user.name.split(' ')[0]}.`);
        return { ok: true, role: data.user.role };
      } else {
        const msg = data.detail || 'Invalid email or password';
        return { ok: false, message: msg };
      }
    } catch {
      // Offline fallback
      const found = users.find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase());
      if (!found || found.password !== password) return { ok: false, message: 'That email and password combination is not recognised.' };
      if (found.status === 'suspended') return { ok: false, message: 'This account is currently suspended. Please contact support.' };
      setUser(found);
      analyticsService.track('login', { userId: found.id });
      toast(`Welcome back, ${found.name.split(' ')[0]}.`);
      return { ok: true, role: found.role };
    }
  };

  const register = async (name: string, email: string, password: string, role: string = 'buyer') => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (res.ok && data.access_token) {
        localStorage.setItem('shopsphere_jwt_token', data.access_token);
        setToken(data.access_token);
        setUser(data.user);
        toast(`Your ${role} account is ready!`);
        return { ok: true, role: data.user.role };
      } else {
        return { ok: false, message: data.detail || 'Registration failed' };
      }
    } catch {
      // Offline fallback
      if (users.some((candidate) => candidate.email.toLowerCase() === email.toLowerCase())) {
        return { ok: false, message: 'An account with that email already exists.' };
      }
      const next: User = { id: `u-${Date.now()}`, name, email, password, role: role as User['role'], status: 'active', createdAt: new Date().toISOString() };
      const nextUsers = [...users, next];
      setUsers(nextUsers);
      userService.save(nextUsers);
      setUser(next);
      toast(`Your ${role} account is ready.`);
      return { ok: true, role };
    }
  };

  const logout = () => {
    localStorage.removeItem('shopsphere_jwt_token');
    setToken(null);
    setUser(null);
    toast('You have been signed out.');
  };

  const addToCart = (productId: string, quantity = 1) => {
    const product = products.find((item) => item.id === productId);
    if (!product || product.stock < 1) { toast('This listing is out of stock.', 'error'); return; }
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      const nextQuantity = Math.min(product.stock, (existing?.quantity || 0) + quantity);
      return existing ? prev.map((item) => item.productId === productId ? { ...item, quantity: nextQuantity } : item) : [...prev, { productId, quantity: nextQuantity }];
    });
    analyticsService.track('add_to_cart', { productId });
    toast('Added to your bag.');
  };

  const updateCart = (productId: string, quantity: number) => {
    const stock = products.find((item) => item.id === productId)?.stock || 0;
    setCart((prev) => quantity < 1 || stock < 1 ? prev.filter((item) => item.productId !== productId) : prev.map((item) => item.productId === productId ? { ...item, quantity: Math.min(quantity, stock) } : item));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    toast('Removed from your bag.');
  };

  const toggleWishlist = (productId: string) => setWishlist((prev) => {
    const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId];
    toast(next.includes(productId) ? 'Saved to your wishlist.' : 'Removed from wishlist.');
    return next;
  });

  const createOrder = (data: Omit<Order, 'id' | 'createdAt'>) => {
    const order: Order = { ...data, id: `ord-${Date.now().toString().slice(-6)}`, createdAt: new Date().toISOString() };
    const next = [order, ...orders];
    setOrders(next);
    orderService.save(next);
    setCart([]);
    analyticsService.track('order_created', { orderId: order.id, total: data.totalAmount });

    const activeToken = token || localStorage.getItem('shopsphere_jwt_token');
    if (activeToken) {
      const firstItem = data.items[0];
      const matchedProd = firstItem ? products.find((p) => p.id === firstItem.productId) : null;
      fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({
          items: data.items,
          totalAmount: data.totalAmount,
          shippingAddress: data.shippingAddress || '',
          paymentMethod: data.paymentMethod || 'UPI',
          sellerId: matchedProd?.sellerId || '',
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((backendOrder) => {
          if (backendOrder) {
            setOrders((prev) => {
              const filtered = prev.filter((o) => o.id !== order.id && o.id !== backendOrder.id);
              const updated = [backendOrder, ...filtered];
              orderService.save(updated);
              return updated;
            });
          }
        })
        .catch(() => {});
    }
    return order;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === orderId ? { ...o, status } : o));
      orderService.save(updated);
      return updated;
    });
    toast(`Order ${orderId} marked as ${status}.`);

    const activeToken = token || localStorage.getItem('shopsphere_jwt_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

    try {
      await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status }),
      });
    } catch {
      // Ignored for offline/fallback
    }
  };

  const saveProduct = async (product: Product) => {
    const next = products.some((p) => p.id === product.id)
      ? products.map((p) => (p.id === product.id ? product : p))
      : [product, ...products];
    setProducts(next);
    productService.save(next);
    toast('Listing saved.');

    const activeToken = token || localStorage.getItem('shopsphere_jwt_token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          id: product.id,
          name: product.name,
          title: product.name,
          description: product.description || '',
          price: product.price,
          stock: product.stock,
          category: product.category || 'Other',
          condition: product.condition || 'New',
          brand: product.brand || '',
          location: 'Online',
          image: product.image,
          images: product.images && product.images.length > 0 ? product.images : [product.image],
          sellerId: product.sellerId || user?.id,
          sellerName: product.sellerName || user?.name,
          rating: product.rating || 5,
          reviewCount: product.reviewCount || 0,
          status: product.status || 'active',
        }),
      });
      if (res.ok) {
        const savedProduct = await res.json();
        setProducts((prev) => {
          const updated = prev.some((p) => p.id === savedProduct.id || p.id === product.id)
            ? prev.map((p) => (p.id === savedProduct.id || p.id === product.id ? savedProduct : p))
            : [savedProduct, ...prev];
          productService.save(updated);
          return updated;
        });
      }
    } catch (e) {}
  };

  const deleteProduct = async (id: string) => {
    const next = products.filter((p) => p.id !== id);
    setProducts(next);
    productService.save(next);
    toast('Listing removed.');

    const activeToken = token || localStorage.getItem('shopsphere_jwt_token');
    const headers: Record<string, string> = {};
    if (activeToken) headers['Authorization'] = `Bearer ${activeToken}`;

    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers,
      });
    } catch (e) {}
  };

  const updateUser = (updated: User) => {
    const next = users.map((item) => item.id === updated.id ? updated : item);
    setUsers(next);
    userService.save(next);
    if (user?.id === updated.id) setUser(updated);
    toast('Profile updated.');
  };

  const setUserStatus = async (id: string, status: User['status']) => {
    if (token) {
      try {
        await fetch(`/api/admin/users/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ status })
        });
      } catch {}
    }
    const updated = users.find((u) => u.id === id);
    if (updated) updateUser({ ...updated, status });
  };

  const saveCategory = (category: Category) => {
    const next = categories.some((c) => c.id === category.id) ? categories.map((c) => c.id === category.id ? category : c) : [...categories, category];
    setCategories(next);
    categoryService.save(next);
    toast('Category saved.');
  };

  const deleteCategory = (id: string) => {
    const next = categories.filter((c) => c.id !== id);
    setCategories(next);
    categoryService.save(next);
    toast('Category removed.');
  };

  const value = useMemo<Ctx>(() => ({
    user,
    users,
    products,
    orders,
    reviews,
    categories,
    cart,
    wishlist,
    toasts,
    token,
    login,
    logout,
    register,
    addToCart,
    updateCart,
    removeFromCart,
    toggleWishlist,
    isWishlisted: (id) => wishlist.includes(id),
    createOrder,
    saveProduct,
    deleteProduct,
    updateUser,
    setUserStatus,
    saveCategory,
    deleteCategory,
    toast,
    dismissToast: (id) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    mode,
    setMode,
    updateOrderStatus
  }), [user, users, products, orders, reviews, categories, cart, wishlist, toasts, token, mode]);

  return <MarketplaceContext.Provider value={value}>{children}</MarketplaceContext.Provider>;
}

export function useMarket() {
  const value = useContext(MarketplaceContext);
  if (!value) throw new Error('useMarket must be used within MarketplaceProvider');
  return value;
}
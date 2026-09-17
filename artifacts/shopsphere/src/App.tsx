import { useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import { Link, Route, Switch, useLocation, useParams } from 'wouter';
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpen, Box, Check, ChevronDown, ChevronRight, ChevronUp,
  CircleAlert, CircleCheck, CreditCard, Eye, Filter, Heart, Home as HomeIcon, LayoutDashboard,
  ListFilter, LogOut, Menu, Package, Pencil, Plus, Search, Settings, ShoppingBag, ShoppingCart,
  SlidersHorizontal, Sparkles, Star, Store, Trash2, Truck, UploadCloud, UserRound, Users, X, Zap,
} from 'lucide-react';
import { MarketplaceProvider, useMarket } from '@/contexts/MarketplaceContext';
import type { Order, Product, ProductStatus } from '@/services/mockStore';
import { ErrorBoundary } from '@/components/error-boundary';
import NotFound from '@/pages/not-found';

const money = (value: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
const date = (value: string) => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
const cn = (...classes: (string | false | undefined)[]) => classes.filter(Boolean).join(' ');

function Button({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'soft' | 'outline' | 'ghost' | 'danger' }) {
  const styles = { primary: 'bg-primary text-primary-foreground hover:brightness-95', soft: 'bg-secondary text-secondary-foreground hover:bg-secondary/75', outline: 'border border-border bg-card hover:border-primary hover:text-primary', ghost: 'hover:bg-muted', danger: 'bg-destructive text-destructive-foreground hover:brightness-95' };
  return <button className={cn('inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all active:scale-[.98] disabled:pointer-events-none disabled:opacity-50', styles[variant], className)} {...props}>{children}</button>;
}
function Field({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return <label className="grid gap-1.5 text-sm font-semibold">{label}<input className={cn('w-full rounded-xl border bg-card px-3.5 py-3 text-sm font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15', error ? 'border-destructive' : 'border-input')} {...props} />{error && <span className="text-xs font-medium text-destructive">{error}</span>}</label>;
}
function Textarea({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
  return <label className="grid gap-1.5 text-sm font-semibold">{label}<textarea className="min-h-28 w-full resize-y rounded-xl border border-input bg-card px-3.5 py-3 text-sm font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" {...props} /></label>;
}
function StatusPill({ children, tone = 'muted' }: { children: React.ReactNode; tone?: 'success' | 'warning' | 'danger' | 'muted' }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[.08em]', tone === 'success' && 'bg-primary/10 text-primary', tone === 'warning' && 'bg-accent/15 text-accent-foreground', tone === 'danger' && 'bg-destructive/10 text-destructive', tone === 'muted' && 'bg-muted text-muted-foreground')}>{children}</span>;
}
function EmptyState({ icon: Icon = ShoppingBag, title, body, action }: { icon?: typeof ShoppingBag; title: string; body: string; action?: React.ReactNode }) {
  return <div className="surface flex min-h-64 flex-col items-center justify-center rounded-3xl p-8 text-center"><div className="mb-4 rounded-2xl bg-secondary p-4 text-primary"><Icon size={25} /></div><h3 className="serif text-2xl font-semibold">{title}</h3><p className="mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>{action && <div className="mt-5">{action}</div>}</div>;
}
function Stars({ rating }: { rating: number }) {
  return <span className="inline-flex items-center gap-0.5 text-accent" aria-label={`${rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={13} fill={i < Math.round(rating) ? 'currentColor' : 'none'} />)}</span>;
}
function ProductCard({ product }: { product: Product }) {
  const { addToCart, toggleWishlist, isWishlisted } = useMarket();
  return <article className="group lift surface relative overflow-hidden rounded-3xl" data-testid={`card-product-${product.id}`}>
    <Link href={`/product/${product.id}`} className="block">
      <div className="image-wash relative aspect-[1.12] overflow-hidden"><img src={product.image} alt={product.name} className="h-full w-full object-cover mix-blend-multiply transition duration-500 group-hover:scale-105" /><div className="absolute left-3 top-3"><StatusPill tone={product.condition === 'Used' ? 'warning' : 'success'}>{product.condition}</StatusPill></div></div>
    </Link>
    <button aria-label={isWishlisted(product.id) ? 'Remove from wishlist' : 'Save product'} data-testid={`button-wishlist-${product.id}`} onClick={() => toggleWishlist(product.id)} className={cn('absolute right-3 top-3 rounded-full bg-card/90 p-2 shadow-sm transition hover:scale-105', isWishlisted(product.id) ? 'text-accent' : 'text-muted-foreground')}><Heart size={17} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} /></button>
     <div className="p-4"><div className="mb-1 flex items-center justify-between gap-2"><span className="text-[11px] font-bold uppercase tracking-[.14em] text-muted-foreground">{product.category}</span><span className={cn('mono text-xs', product.stock === 0 ? 'font-semibold text-destructive' : product.stock < 4 ? 'text-accent-foreground' : 'text-muted-foreground')}>{product.stock === 0 ? 'Out of stock' : product.stock < 4 ? `Only ${product.stock} left` : `${product.stock} left`}</span></div><Link href={`/product/${product.id}`} className="block"><h3 className="min-h-11 font-semibold leading-snug group-hover:text-primary">{product.name}</h3></Link><div className="mt-1 text-xs text-muted-foreground">Sold by {product.sellerName}</div><div className="mt-2 flex items-center gap-2"><Stars rating={product.rating} /><span className="text-xs text-muted-foreground">{product.rating} · {product.reviewCount}</span></div><div className="mt-4 flex items-center justify-between gap-2"><strong className="serif text-xl">{money(product.price)}</strong><Button disabled={product.stock === 0} aria-label={product.stock === 0 ? `${product.name} is out of stock` : `Add ${product.name} to bag`} data-testid={`button-add-cart-${product.id}`} onClick={() => addToCart(product.id)} className="px-3 py-2"><ShoppingCart size={15} /><span className="hidden sm:inline">{product.stock === 0 ? 'Sold out' : 'Add'}</span></Button></div></div>
  </article>;
}
function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) return <EmptyState title="Nothing in this corner yet" body="Try a wider search or browse another category." action={<Link href="/shop" className="text-sm font-bold text-primary">Reset discovery</Link>} />;
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>;
}

function Header() {
  const { user, cart, wishlist, mode, setMode } = useMarket();
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const [search, setSearch] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) setLocation(`/shop?search=${encodeURIComponent(search.trim())}`);
  };

  const activeMode = location.startsWith('/seller') ? 'sell' : mode;

  const handleModeSwitch = (targetMode: 'buy' | 'sell') => {
    setMode(targetMode);
    if (targetMode === 'sell') {
      if (!location.startsWith('/seller')) {
        setLocation('/seller');
      }
    } else {
      if (location.startsWith('/seller')) {
        setLocation('/shop');
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:px-8">
        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Open navigation">
          <Menu size={22} />
        </button>
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Store size={19} />
          </span>
          <span className="serif text-xl font-bold tracking-tight">
            Shop<span className="text-accent">Sphere</span>
          </span>
        </Link>

        {/* Global Search */}
        <form onSubmit={submit} className="ml-auto hidden max-w-md flex-1 items-center rounded-full border border-border bg-card px-3 md:flex">
          <Search size={17} className="text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search the market"
            aria-label="Search products"
            data-testid="input-global-search"
            className="w-full bg-transparent px-2.5 py-2.5 text-sm outline-none"
          />
          <kbd className="mono rounded bg-muted px-2 py-1 text-[10px] text-muted-foreground">/</kbd>
        </form>

        {/* Top Mode Switch Button: [ 🛍️ Buy | 🏷️ Sell ] */}
        <div className="flex items-center rounded-full bg-muted/80 p-1 border border-border/70 shadow-inner">
          <button
            type="button"
            onClick={() => handleModeSwitch('buy')}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200',
              activeMode === 'buy'
                ? 'bg-background text-primary shadow-sm ring-1 ring-border/50'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="View website as a Buyer"
          >
            <ShoppingBag size={13} className={activeMode === 'buy' ? 'text-primary' : ''} />
            <span>Buy</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch('sell')}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-200',
              activeMode === 'sell'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="View website as a Seller"
          >
            <Store size={13} className={activeMode === 'sell' ? 'text-primary-foreground' : ''} />
            <span>Sell</span>
          </button>
        </div>

        {/* Context-aware Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {activeMode === 'buy' ? (
            <>
              <Link href="/shop" className={cn('rounded-full px-3 py-2 text-sm font-semibold', location === '/shop' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground')}>
                Discover
              </Link>
              {user && (
                <Link href="/orders" className={cn('rounded-full px-3 py-2 text-sm font-semibold', location.startsWith('/orders') ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground')}>
                  My Orders
                </Link>
              )}
            </>
          ) : (
            <>
              <Link href="/seller" className={cn('rounded-full px-3 py-2 text-sm font-semibold', location === '/seller' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground')}>
                Studio
              </Link>
              <Link href="/seller/add-product" className={cn('rounded-full px-3 py-2 text-sm font-semibold', location === '/seller/add-product' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground')}>
                + Add Listing
              </Link>
            </>
          )}
          {user?.role === 'admin' && (
            <Link href="/admin" className={cn('flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10', location.startsWith('/admin') ? 'bg-accent/15' : '')}>
              <ShieldIcon /> Admin
            </Link>
          )}
        </nav>

        {/* Quick user icons */}
        <div className="flex items-center gap-1">
          <Link href="/wishlist" className="relative rounded-full p-2.5 text-muted-foreground hover:bg-muted hover:text-accent" aria-label="Wishlist">
            <Heart size={19} />
            {wishlist.length > 0 && <b className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] text-white">{wishlist.length}</b>}
          </Link>
          <Link href="/cart" className="relative rounded-full p-2.5 text-muted-foreground hover:bg-muted hover:text-primary" aria-label="Shopping cart">
            <ShoppingCart size={19} />
            {cart.length > 0 && <b className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] text-white">{cart.length}</b>}
          </Link>
          {user ? (
            <Link href="/profile" className="ml-1 hidden h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground sm:flex" aria-label="Profile">
              {user.name.slice(0, 1)}
            </Link>
          ) : (
            <Link href="/login" className="ml-1 hidden rounded-full border border-border px-3 py-2 text-sm font-semibold sm:block">
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {open && (
        <div className="border-t border-border px-4 py-3 md:hidden">
          <form onSubmit={submit} className="mb-3 flex items-center rounded-xl border border-border bg-card px-3">
            <Search size={17} className="text-muted-foreground" />
            <input autoFocus value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search the market" aria-label="Mobile search" className="w-full bg-transparent px-2 py-3 text-sm outline-none" />
          </form>

          {/* Mobile Switch button */}
          <div className="mb-3 flex items-center rounded-2xl bg-muted/80 p-1 border border-border/80">
            <button
              type="button"
              onClick={() => {
                handleModeSwitch('buy');
                setOpen(false);
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition',
                activeMode === 'buy' ? 'bg-background text-primary shadow-sm ring-1 ring-border/50' : 'text-muted-foreground'
              )}
            >
              <ShoppingBag size={14} /> Buy Mode
            </button>
            <button
              type="button"
              onClick={() => {
                handleModeSwitch('sell');
                setOpen(false);
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition',
                activeMode === 'sell' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground'
              )}
            >
              <Store size={14} /> Sell Mode
            </button>
          </div>

          <div className="grid gap-1">
            {activeMode === 'buy' ? (
              <>
                <Link onClick={() => setOpen(false)} href="/shop" className="rounded-xl px-3 py-3 font-semibold">
                  Discover Finds
                </Link>
                {user && (
                  <Link onClick={() => setOpen(false)} href="/orders" className="rounded-xl px-3 py-3 font-semibold">
                    My Orders
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link onClick={() => setOpen(false)} href="/seller" className="rounded-xl px-3 py-3 font-semibold">
                  Seller Studio
                </Link>
                <Link onClick={() => setOpen(false)} href="/seller/add-product" className="rounded-xl px-3 py-3 font-semibold">
                  + Add New Listing
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link onClick={() => setOpen(false)} href="/admin" className="rounded-xl px-3 py-3 font-semibold text-accent">
                Admin Console
              </Link>
            )}
            {user ? (
              <Link onClick={() => setOpen(false)} href="/profile" className="rounded-xl px-3 py-3 font-semibold">
                My account
              </Link>
            ) : (
              <Link onClick={() => setOpen(false)} href="/login" className="rounded-xl px-3 py-3 font-semibold">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
function Toasts() { const { toasts, dismissToast } = useMarket(); return <div className="fixed bottom-5 right-5 z-50 grid gap-2">{toasts.map((t) => <div key={t.id} className="pop flex items-center gap-3 rounded-2xl bg-foreground px-4 py-3 text-sm text-background shadow-xl"><CircleCheck size={17} className={t.tone === 'error' ? 'text-destructive' : 'text-accent'} />{t.message}<button onClick={() => dismissToast(t.id)} aria-label="Dismiss notification"><X size={14} /></button></div>)}</div>; }
function Shell({ children }: { children: React.ReactNode }) {
  return <div className="grain min-h-[100dvh]"><Header /><main>{children}</main><Toasts /><footer className="mt-20 border-t border-border bg-secondary/40"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-9 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8"><div><div className="serif text-lg font-bold text-foreground">ShopSphere</div><p className="mt-1">Good things, closer to home.</p></div><div className="flex gap-5"><Link href="/shop" className="hover:text-primary">Browse</Link><Link href="/seller" className="hover:text-primary">Start selling</Link><Link href="/profile" className="hover:text-primary">Account</Link></div><span className="mono text-xs">Made for India · 2025</span></div></footer></div>;
}
function Guard({ children, role }: { children: React.ReactNode; role?: 'admin' | 'user' | 'seller' | 'buyer' }) {
  const { user } = useMarket();
  if (!user) return <RedirectCard title="Sign in to continue" body="Your bag, orders, and seller tools are waiting on the other side." href="/login" label="Sign in" />;
  if (role === 'admin' && user.role !== 'admin') return <RedirectCard title="Admin Area" body="You need an admin account to view this console." href="/unauthorized" label="See why" />;
  if (role && role !== 'admin' && role !== 'user' && user.role !== role && user.role !== 'admin') {
    return <RedirectCard title="This shelf is private" body="You don't have permission to view this area." href="/unauthorized" label="See why" />;
  }
  return <>{children}</>;
}
function RedirectCard({ title, body, href, label }: { title: string; body: string; href: string; label: string }) { return <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-5 text-center"><div className="rounded-3xl bg-secondary p-5 text-primary"><LockIcon /></div><h1 className="serif mt-5 text-4xl">{title}</h1><p className="mt-3 text-muted-foreground">{body}</p><Link href={href} className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground">{label}</Link></div>; }
function LockIcon() { return <CircleAlert size={26} />; }

function Home() {
  const { products, categories } = useMarket();
  return <><section className="relative overflow-hidden bg-primary text-primary-foreground"><div className="absolute -right-32 -top-28 h-96 w-96 rounded-full border-[30px] border-accent/25" /><div className="absolute bottom-[-130px] left-[38%] h-80 w-80 rounded-full bg-accent/20 blur-3xl" /><div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-28"><div className="fade-up relative z-10"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-xs font-semibold"><Sparkles size={14} className="text-accent" />A brighter way to shop locally</div><h1 className="serif max-w-2xl text-5xl font-semibold leading-[.98] tracking-tight sm:text-7xl">Find the things<br /><em className="text-accent">worth keeping.</em></h1><p className="mt-6 max-w-lg text-base leading-7 text-primary-foreground/75 sm:text-lg">Shop thoughtful finds from independent Indian sellers. Less noise, more character, and a better story behind every buy.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/shop" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3.5 font-bold text-white transition hover:brightness-105">Start exploring <ArrowRight size={17} /></Link><Link href="/seller" className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 px-5 py-3.5 font-bold transition hover:bg-primary-foreground/10">Open your shop</Link></div><div className="mt-10 flex gap-8 text-sm text-primary-foreground/70"><span><strong className="text-2xl text-primary-foreground">30+</strong><br />curated finds</span><span><strong className="text-2xl text-primary-foreground">6</strong><br />Indian categories</span><span><strong className="text-2xl text-primary-foreground">4.8</strong><br />buyer trust score</span></div></div><div className="relative mx-auto w-full max-w-md lg:max-w-none"><div className="relative overflow-hidden rounded-[2rem] border border-primary-foreground/15 bg-primary-foreground/10 p-3 shadow-2xl"><img src={products[1]?.image} alt="Featured headphones" className="aspect-[.93] w-full rounded-[1.5rem] object-cover mix-blend-luminosity opacity-90" /><div className="absolute bottom-7 left-7 right-7 flex items-end justify-between rounded-2xl bg-background/95 p-4 text-foreground shadow-lg"><div><div className="text-[10px] font-bold uppercase tracking-[.16em] text-muted-foreground">Today's edit</div><div className="serif mt-1 text-xl font-semibold">{products[1]?.name}</div><div className="mt-1 font-semibold">{money(products[1]?.price || 0)}</div></div><Link href={`/product/${products[1]?.id}`} className="rounded-full bg-primary p-3 text-primary-foreground"><ArrowUpRightIcon /></Link></div></div><div className="absolute -left-5 top-8 rounded-2xl bg-accent px-4 py-3 text-sm font-bold text-white shadow-lg"><Zap size={15} className="mr-1 inline" />Seller-loved</div></div></div></section>
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8"><div className="mb-5 flex items-end justify-between"><div><span className="mono text-xs uppercase tracking-[.16em] text-accent">Browse by feeling</span><h2 className="serif mt-1 text-3xl font-semibold">A little bit of everything</h2></div><Link href="/shop" className="hidden items-center gap-1 text-sm font-bold text-primary sm:flex">All categories <ArrowRight size={15} /></Link></div><div className="mobile-scroll flex gap-3 pb-2">{categories.map((category, i) => <Link href={`/shop?category=${category.name}`} key={category.id} className={cn('min-w-36 rounded-2xl p-4 transition hover:-translate-y-1', i % 3 === 0 ? 'bg-secondary' : i % 3 === 1 ? 'bg-primary text-primary-foreground' : 'bg-accent text-white')}><CategoryIcon name={category.name} /><div className="mt-7 font-bold">{category.name}</div><div className="mt-1 text-xs opacity-70">{category.count + 2} finds</div></Link>)}</div></section>
    <section className="mx-auto max-w-7xl px-5 py-5 lg:px-8"><div className="mb-5 flex items-end justify-between"><div><span className="mono text-xs uppercase tracking-[.16em] text-accent">Fresh on the shelf</span><h2 className="serif mt-1 text-3xl font-semibold">New finds, good timing</h2></div><Link href="/shop?sort=newest" className="flex items-center gap-1 text-sm font-bold text-primary">See all <ArrowRight size={15} /></Link></div><ProductGrid products={products.slice(0, 8)} /></section>
    <section className="mx-auto my-16 max-w-7xl px-5 lg:px-8"><div className="grid gap-4 md:grid-cols-3"><Value icon={<UserRound />} title="People, not warehouses" body="Meet the independent makers and curators behind your next favourite thing." /><Value icon={<ShieldIcon />} title="Buying with confidence" body="Clear condition notes, honest reviews, and support when you need it." /><Value icon={<Truck />} title="From here to there" body="Simple delivery tracking from a local seller to your doorstep." /></div></section>
    <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-16 lg:grid-cols-[1fr_1.2fr] lg:px-8"><div className="rounded-3xl bg-secondary p-8 sm:p-10"><span className="mono text-xs uppercase tracking-[.16em] text-accent">The ShopSphere note</span><h2 className="serif mt-4 text-4xl leading-tight">A marketplace with a point of view.</h2><p className="mt-4 leading-7 text-muted-foreground">Not an endless scroll. A considered collection of useful, beautiful, and wonderfully specific things — from sellers you can actually get to know.</p><Link href="/shop" className="mt-7 inline-flex items-center gap-2 font-bold text-primary">See what caught our eye <ArrowRight size={16} /></Link></div><div className="grid grid-cols-2 gap-4"><MiniStat value="₹2.1L" label="seller earnings unlocked" /><MiniStat value="96%" label="orders delivered on time" /><MiniStat value="18 min" label="average browse session" /><MiniStat value="1.2k" label="independent listings" /></div></section>
  </>;
}
function ArrowUpRightIcon() { return <ArrowRight size={18} className="-rotate-45" />; }
function ShieldIcon() { return <CircleCheck />; }
function Value({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) { return <div className="surface rounded-3xl p-6"><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">{icon}</div><h3 className="serif text-2xl">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p></div>; }
function MiniStat({ value, label }: { value: string; label: string }) { return <div className="surface flex flex-col justify-center rounded-3xl p-5"><strong className="serif text-3xl text-primary">{value}</strong><span className="mt-1 text-sm text-muted-foreground">{label}</span></div>; }
function CategoryIcon({ name }: { name: string }) { const Icon = name === 'Electronics' ? Zap : name === 'Fashion' ? Sparkles : name === 'Books' ? BookOpen : name === 'Home' ? HomeIcon : name === 'Sports' ? CircleCheck : Box; return <Icon size={22} />; }

function Shop() {
  const { products, categories } = useMarket();
  const query = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(query.get('search') || '');
  const [category, setCategory] = useState(query.get('category') || 'All');
  const [condition, setCondition] = useState('All');
  const [sort, setSort] = useState(query.get('sort') || 'featured');
  const [showFilters, setShowFilters] = useState(false);
  const filtered = useMemo(() => {
     let result = products.filter((p) => p.status === 'active' || p.status === 'out_of_stock').filter((p) => [p.name, p.description, p.category, p.brand, p.sellerName].join(' ').toLowerCase().includes(search.toLowerCase()));
    if (category !== 'All') result = result.filter((p) => p.category === category);
    if (condition !== 'All') result = result.filter((p) => p.condition === condition);
    if (sort === 'low') result.sort((a, b) => a.price - b.price); if (sort === 'high') result.sort((a, b) => b.price - a.price); if (sort === 'rating') result.sort((a, b) => b.rating - a.rating); if (sort === 'newest') result.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return result;
  }, [products, search, category, condition, sort]);
  return <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><span className="mono text-xs uppercase tracking-[.16em] text-accent">The marketplace</span><h1 className="serif mt-2 text-5xl">Find your next <em>favourite</em></h1><p className="mt-2 text-muted-foreground">Thoughtful finds from independent sellers across India.</p></div><Button variant="outline" className="sm:hidden" onClick={() => setShowFilters(!showFilters)}><SlidersHorizontal size={16} /> Filters</Button></div><div className="mt-8 grid gap-7 lg:grid-cols-[210px_1fr]"><aside className={cn('lg:block', showFilters ? 'block' : 'hidden')}><div className="sticky top-24 space-y-6"><div><div className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">Search</div><div className="flex items-center rounded-xl border border-input bg-card px-3"><Search size={16} className="text-muted-foreground" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Try headphones" className="w-full bg-transparent px-2 py-3 text-sm outline-none" /></div></div><div><div className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">Category</div><div className="grid gap-1">{['All', ...categories.map((c) => c.name)].map((item) => <button key={item} onClick={() => setCategory(item)} className={cn('flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm', category === item ? 'bg-primary font-bold text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}>{item}{category === item && <Check size={14} />}</button>)}</div></div><div><div className="mb-3 text-xs font-bold uppercase tracking-[.14em] text-muted-foreground">Condition</div>{['All', 'New', 'Used'].map((item) => <button key={item} onClick={() => setCondition(item)} className={cn('mr-1 rounded-full border px-3 py-1.5 text-xs font-semibold', condition === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground')}>{item}</button>)}</div></div></aside><div><div className="mb-4 flex items-center justify-between"><span className="text-sm text-muted-foreground"><strong className="text-foreground">{filtered.length}</strong> finds</span><label className="flex items-center gap-2 text-sm text-muted-foreground">Sort by <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-border bg-card px-3 py-2 font-semibold text-foreground outline-none"><option value="featured">Featured</option><option value="newest">Newest</option><option value="rating">Top rated</option><option value="low">Price: low first</option><option value="high">Price: high first</option></select></label></div><ProductGrid products={filtered} /></div></div></div>;
}

function ProductDetail() {
  const { id } = useParams<{ id: string }>(); const { products, reviews, addToCart, toggleWishlist, isWishlisted } = useMarket(); const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1); const [, setLocation] = useLocation();
  const [selectedImg, setSelectedImg] = useState<string>('');
  useEffect(() => { if (product) setSelectedImg(product.image); }, [product?.id, product?.image]);
  if (!product) return <NotFound />;
  const activeImage = selectedImg || product.image;
  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];
  const productReviews = reviews.filter((r) => r.productId === product.id); const recommendations = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const buy = () => { addToCart(product.id, qty); setLocation('/checkout'); };
  return <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8"><Link href="/shop" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft size={16} /> Back to market</Link><div className="grid gap-9 lg:grid-cols-[1.1fr_.9fr]"><div><div className="image-wash overflow-hidden rounded-[2rem]"><img src={activeImage} alt={product.name} className="aspect-square h-full w-full object-cover mix-blend-multiply transition-all duration-300" /></div>{allImages.length > 1 && <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">{allImages.map((img, idx) => <button key={idx} type="button" onClick={() => setSelectedImg(img)} className={cn('relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all', activeImage === img ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-border/60 opacity-70 hover:opacity-100')}><img src={img} alt="" className="h-full w-full object-cover" /></button>)}</div>}</div><div className="py-2"><div className="flex items-center justify-between"><StatusPill tone={product.condition === 'Used' ? 'warning' : 'success'}>{product.condition} condition</StatusPill><button onClick={() => toggleWishlist(product.id)} className={cn('rounded-full border border-border p-3', isWishlisted(product.id) ? 'text-accent' : 'text-muted-foreground')} aria-label="Save product"><Heart size={18} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} /></button></div><div className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-muted-foreground">{product.category} · {product.brand}</div><h1 className="serif mt-2 text-4xl leading-tight sm:text-5xl">{product.name}</h1><div className="mt-4 flex items-center gap-3"><Stars rating={product.rating} /><span className="text-sm text-muted-foreground">{product.rating} ({product.reviewCount} reviews)</span></div><p className="mt-6 text-base leading-7 text-muted-foreground">{product.description}</p><div className="mt-7 flex items-end justify-between"><strong className="serif text-4xl">{money(product.price)}</strong><span className={cn('text-sm font-semibold', product.stock ? 'text-primary' : 'text-destructive')}>{product.stock ? `${product.stock} available today` : 'Currently out of stock'}</span></div><div className="mt-7 flex flex-wrap gap-3"><div className="flex items-center rounded-full border border-border bg-card"><button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2.5 text-muted-foreground" aria-label="Decrease quantity">−</button><span className="mono min-w-8 text-center text-sm">{qty}</span><button onClick={() => setQty(Math.min(product.stock || 1, qty + 1))} className="px-3 py-2.5 text-muted-foreground" aria-label="Increase quantity">+</button></div><Button disabled={!product.stock} onClick={() => addToCart(product.id, qty)} className="flex-1 sm:flex-none"><ShoppingCart size={17} /> Add to bag</Button><Button disabled={!product.stock} variant="soft" onClick={buy}>Buy now</Button></div><div className="mt-8 grid grid-cols-3 gap-2 border-y border-border py-5 text-center text-xs text-muted-foreground"><span><ShieldIcon /><b className="mt-1 block text-foreground">Buyer protected</b></span><span><Truck className="mx-auto" /><b className="mt-1 block text-foreground">Tracked delivery</b></span><span><CircleCheck className="mx-auto" /><b className="mt-1 block text-foreground">Honest listing</b></span></div><div className="mt-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary font-bold text-secondary-foreground">{product.sellerName[0]}</div><div><div className="text-xs text-muted-foreground">Sold by</div><strong>{product.sellerName}</strong></div><span className="ml-auto rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">4.9 seller score</span></div></div></div><section className="mt-16 grid gap-10 lg:grid-cols-[1.1fr_.9fr]"><div><span className="mono text-xs uppercase tracking-[.16em] text-accent">Good to know</span><h2 className="serif mt-2 text-3xl">Why this product?</h2><div className="mt-5 grid gap-3 sm:grid-cols-3"><Value icon={<CircleCheck />} title="Clear details" body="What you see is what ships, including the condition." /><Value icon={<Truck />} title="Seller packed" body="Independent sellers package every order with care." /><Value icon={<Heart />} title="Worth keeping" body="Rated by people who bought, used, and returned." /></div></div><div><div className="flex items-center justify-between"><h2 className="serif text-3xl">Reviews</h2><span className="text-sm text-muted-foreground">{productReviews.length} shown</span></div><div className="mt-5 grid gap-3">{(productReviews.length ? productReviews : reviews.slice(0, 2)).map((review) => <div key={review.id} className="surface rounded-2xl p-4"><div className="flex items-center justify-between"><strong className="text-sm">{review.userName}</strong><Stars rating={review.rating} /></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{review.comment}</p><span className="mt-2 block text-xs text-muted-foreground">{date(review.createdAt)}</span></div>)}</div></div></section>{recommendations.length > 0 && <section className="mt-16"><div className="mb-5 flex items-end justify-between"><h2 className="serif text-3xl">More from this corner</h2><Link href={`/shop?category=${product.category}`} className="text-sm font-bold text-primary">View all</Link></div><ProductGrid products={recommendations} /></section>}</div>;
}

function Auth({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const { login, register } = useMarket();
  const [, setLocation] = useLocation();
  const isRegister = mode === 'register';
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.includes('@') || password.length < 6 || (isRegister && name.trim().length < 2)) {
      setError(isRegister ? 'Add your name, a valid email, and a password of at least 6 characters.' : 'Enter a valid email and password of at least 6 characters.');
      return;
    }
    setLoading(true);
    const result = isRegister ? await register(name.trim(), email, password, role) : await login(email, password, role);
    setLoading(false);

    if (!result.ok) {
      setError(result.message || 'Something went wrong.');
    } else {
      if (result.role === 'admin') {
        setLocation('/admin');
      } else if (result.role === 'seller') {
        setLocation('/seller');
      } else {
        setLocation('/shop');
      }
    }
  };

  return (
    <div className="grid min-h-[calc(100dvh-70px)] lg:grid-cols-2">
      <div className="hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-white">
            <Store size={19} />
          </span>
          <span className="serif text-xl font-bold">
            Shop<span className="text-accent">Sphere</span>
          </span>
        </Link>
        <div>
          <span className="mono text-xs uppercase tracking-[.16em] text-accent">A more human market</span>
          <h1 className="serif mt-5 max-w-lg text-6xl leading-[.95]">
            Come for the find.<br />
            <em className="text-accent">Stay for the story.</em>
          </h1>
          <p className="mt-6 max-w-md leading-7 text-primary-foreground/70">
            Keep your wishlist close, follow your orders, and discover sellers worth returning to.
          </p>
        </div>
        <span className="text-sm text-primary-foreground/60">Good things, closer to home.</span>
      </div>

      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground lg:hidden">
            <ArrowLeft size={16} /> ShopSphere
          </Link>

          <div className="mb-6">
            <span className="mono text-xs uppercase tracking-[.16em] text-accent">
              {isRegister ? 'Join the market' : 'Welcome back'}
            </span>
            <h1 className="serif mt-2 text-4xl">
              {isRegister ? 'Make yourself at home.' : 'Good to see you again.'}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isRegister ? 'Select your role and start your marketplace journey.' : 'Sign in as a Buyer or Seller to continue.'}
            </p>
          </div>

          {/* Buyer / Seller Role Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              {isRegister ? 'I want to register as:' : 'I am signing in as:'}
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-secondary/80 p-1.5 border border-border">
              <button
                type="button"
                onClick={() => setRole('buyer')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all',
                  role === 'buyer'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <ShoppingCart size={17} className={role === 'buyer' ? 'text-primary' : ''} />
                Buyer
              </button>
              <button
                type="button"
                onClick={() => setRole('seller')}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all',
                  role === 'seller'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Store size={17} className={role === 'seller' ? 'text-accent' : ''} />
                Seller
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {role === 'buyer'
                ? '🛍️ Browse and buy unique handcrafted finds, track orders, and keep wishlists.'
                : '📦 List your products, manage customer orders, and track sales revenue.'}
            </p>
          </div>

          <form onSubmit={submit} className="grid gap-4" noValidate>
            {isRegister && (
              <Field
                label={role === 'seller' ? 'Store / Seller name' : 'Your name'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'seller' ? 'Artisan Crafts Co.' : 'Priya Menon'}
                autoComplete="name"
              />
            )}
            <Field
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />

            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
                <CircleAlert size={17} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" disabled={loading} className="mt-2 w-full py-3.5">
              {loading ? 'Processing...' : isRegister ? `Create my ${role} account` : `Sign in as ${role}`} <ArrowRight size={16} />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isRegister ? 'Already a member? ' : 'New to ShopSphere? '}
            <Link href={isRegister ? '/login' : '/register'} className="font-bold text-primary">
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </div>

          <div className="mt-6 rounded-2xl border border-border/80 bg-secondary/40 p-4 text-center">
            <p className="text-xs font-semibold text-muted-foreground">Need demo credentials for testing?</p>
            <a
              href="/ShopSphere_User_Credentials.pdf"
              download="ShopSphere_User_Credentials.pdf"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <BookOpen size={14} /> Download Credentials PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const { user, updateUser, logout, orders, products } = useMarket(); const [editing, setEditing] = useState(false); const [name, setName] = useState(user?.name || ''); const [phone, setPhone] = useState(user?.phone || ''); const [address, setAddress] = useState(user?.address || '');
  if (!user) return null;
  const save = () => { updateUser({ ...user, name, phone, address }); setEditing(false); };
  return <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><span className="mono text-xs uppercase tracking-[.16em] text-accent">Your corner</span><h1 className="serif mt-2 text-5xl">Hello, {user.name.split(' ')[0]}.</h1><p className="mt-2 text-muted-foreground">Your saved finds, orders, and seller tools in one place.</p></div><Button variant="outline" onClick={logout}><LogOut size={16} /> Sign out</Button></div><div className="mt-9 grid gap-6 lg:grid-cols-[1fr_1.4fr]"><section className="surface rounded-3xl p-6 sm:p-8"><div className="flex items-center justify-between"><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-2xl font-bold text-secondary-foreground">{user.name[0]}</div><div><h2 className="serif text-2xl">{user.name}</h2><p className="text-sm text-muted-foreground">{user.email}</p></div></div><button onClick={() => setEditing(!editing)} aria-label="Edit profile" className="rounded-full border border-border p-2.5 text-muted-foreground hover:text-primary"><Pencil size={16} /></button></div>{editing ? <div className="mt-7 grid gap-4"><Field label="Name" value={name} onChange={(e) => setName(e.target.value)} /><Field label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} /><Textarea label="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} /><div className="flex gap-2"><Button onClick={save}>Save changes</Button><Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button></div></div> : <div className="mt-8 grid gap-5 border-t border-border pt-6 text-sm"><div><span className="text-muted-foreground">Phone</span><p className="mt-1 font-semibold">{user.phone || 'Add a phone number'}</p></div><div><span className="text-muted-foreground">Default address</span><p className="mt-1 max-w-sm font-semibold leading-6">{user.address || 'Add your delivery address'}</p></div></div>}</section><div className="grid gap-4 sm:grid-cols-2"><Link href="/orders" className="surface lift rounded-3xl p-6"><Package className="text-primary" /><h3 className="serif mt-7 text-2xl">Your orders</h3><p className="mt-1 text-sm text-muted-foreground">{orders.filter((o) => o.buyerId === user.id).length} orders to track</p></Link><Link href="/wishlist" className="surface lift rounded-3xl p-6"><Heart className="text-accent" /><h3 className="serif mt-7 text-2xl">Wishlist</h3><p className="mt-1 text-sm text-muted-foreground">Saved for a better moment</p></Link><Link href="/seller" className="surface lift rounded-3xl bg-primary p-6 text-primary-foreground sm:col-span-2"><Store /><h3 className="serif mt-7 text-2xl">Your seller studio</h3><p className="mt-1 text-sm text-primary-foreground/70">{products.filter((p) => p.sellerId === user.id).length} listings · See your shop performance</p></Link></div></div></div>;
}

function Wishlist() { const { wishlist, products } = useMarket(); const saved = products.filter((p) => wishlist.includes(p.id)); return <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div><span className="mono text-xs uppercase tracking-[.16em] text-accent">Saved for later</span><h1 className="serif mt-2 text-5xl">Your wishlist.</h1><p className="mt-2 text-muted-foreground">{saved.length ? `${saved.length} finds waiting for their moment.` : 'Keep the good stuff close.'}</p></div><div className="mt-9">{saved.length ? <ProductGrid products={saved} /> : <EmptyState icon={Heart} title="A little empty here" body="Tap the heart on something you love and it will show up here." action={<Link href="/shop" className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Browse the market</Link>} />}</div></div>; }

function Cart() {
  const { cart, products, updateCart, removeFromCart } = useMarket(); const [, setLocation] = useLocation(); const lines = cart.map((item) => ({ item, product: products.find((p) => p.id === item.productId) })).filter((line): line is { item: typeof cart[number]; product: Product } => Boolean(line.product)); const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.item.quantity, 0); const shipping = subtotal ? 80 : 0;
  return <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8"><span className="mono text-xs uppercase tracking-[.16em] text-accent">Your bag</span><h1 className="serif mt-2 text-5xl">Ready when you are.</h1>{!lines.length ? <div className="mt-9"><EmptyState icon={ShoppingCart} title="Your bag is taking a breather" body="Find something that feels like you, then bring it here." action={<Link href="/shop" className="rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Keep browsing</Link>} /></div> : <div className="mt-9 grid gap-7 lg:grid-cols-[1fr_340px]"><div className="grid gap-3">{lines.map(({ item, product }) => <div key={item.productId} className="surface flex gap-4 rounded-2xl p-3 sm:p-4"><img src={product.image} alt={product.name} className="h-24 w-24 rounded-xl object-cover sm:h-32 sm:w-32" /><div className="flex min-w-0 flex-1 flex-col"><div className="flex justify-between gap-2"><div><span className="text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">{product.category}</span><Link href={`/product/${product.id}`} className="mt-1 block font-semibold leading-snug hover:text-primary">{product.name}</Link></div><button onClick={() => removeFromCart(product.id)} aria-label={`Remove ${product.name}`} className="h-fit rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 size={16} /></button></div><div className="mt-auto flex items-center justify-between"><div className="flex items-center rounded-full border border-border"><button onClick={() => updateCart(product.id, item.quantity - 1)} className="px-2.5 py-1.5 text-muted-foreground" aria-label="Decrease quantity">−</button><span className="mono min-w-7 text-center text-xs">{item.quantity}</span><button onClick={() => updateCart(product.id, item.quantity + 1)} className="px-2.5 py-1.5 text-muted-foreground" aria-label="Increase quantity">+</button></div><strong>{money(product.price * item.quantity)}</strong></div></div></div>)}</div><aside className="surface h-fit rounded-3xl p-6"><h2 className="serif text-2xl">Order summary</h2><div className="mt-6 grid gap-3 border-b border-border pb-5 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{money(subtotal)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{money(shipping)}</span></div></div><div className="flex justify-between py-5"><strong>Total</strong><strong className="serif text-2xl">{money(subtotal + shipping)}</strong></div><Button className="w-full py-3.5" onClick={() => setLocation('/checkout')}>Continue to checkout <ArrowRight size={16} /></Button><p className="mt-3 text-center text-xs text-muted-foreground">Secure demo checkout · no real payment</p></aside></div>}</div>;
}

function Checkout() {
  const { user, cart, products, createOrder, toast } = useMarket(); const [, setLocation] = useLocation(); const [address, setAddress] = useState(user?.address || ''); const [payment, setPayment] = useState('UPI'); const [done, setDone] = useState<Order | null>(null);
  const lines = cart.map((item) => ({ item, product: products.find((p) => p.id === item.productId) })).filter((line): line is { item: typeof cart[number]; product: Product } => Boolean(line.product)); const total = lines.reduce((sum, l) => sum + l.product.price * l.item.quantity, 80);
  if (done) return <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-5 text-center"><div className="rounded-full bg-primary/10 p-5 text-primary"><CircleCheck size={40} /></div><h1 className="serif mt-6 text-5xl">It’s on its way.</h1><p className="mt-3 text-muted-foreground">Order {done.id} is confirmed. We’ll keep you posted as it moves.</p><Link href={`/orders/${done.id}`} className="mt-7 inline-flex rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground">Track this order <ArrowRight size={16} /></Link></div>;
  if (!cart.length) return <div className="mx-auto max-w-xl px-5 py-16"><EmptyState icon={ShoppingCart} title="Nothing to check out" body="Add a product to your bag before starting delivery." action={<Link href="/shop" className="font-bold text-primary">Browse products</Link>} /></div>;
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!user) return; if (!address.trim()) { toast('Add a delivery address first.', 'error'); return; } const order = createOrder({ buyerId: user.id, items: lines.map(({ item, product }) => ({ productId: product.id, name: product.name, image: product.image, price: product.price, quantity: item.quantity })), totalAmount: total, shippingAddress: address, paymentMethod: payment, status: 'placed' }); setDone(order); };
  return <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8"><div className="mb-8"><span className="mono text-xs uppercase tracking-[.16em] text-accent">One good last step</span><h1 className="serif mt-2 text-5xl">Checkout.</h1></div><div className="grid gap-8 lg:grid-cols-[1fr_350px]"><form onSubmit={submit} className="grid gap-6"><section className="surface rounded-3xl p-6 sm:p-8"><h2 className="serif text-2xl">Where should we send it?</h2><Textarea label="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="House, street, area, city, PIN" /></section><section className="surface rounded-3xl p-6 sm:p-8"><h2 className="serif text-2xl">How would you like to pay?</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{['UPI', 'Card', 'Cash on delivery'].map((option) => <button type="button" key={option} onClick={() => setPayment(option)} className={cn('flex items-center gap-2 rounded-2xl border p-4 text-left text-sm font-semibold', payment === option ? 'border-primary bg-primary/5 text-primary' : 'border-border')}><CreditCard size={17} />{option}</button>)}</div><p className="mt-4 text-xs text-muted-foreground">This is a safe demo. No money will be charged.</p></section><Button type="submit" className="w-full py-4 sm:w-fit">Place demo order <ArrowRight size={16} /></Button></form><aside className="surface h-fit rounded-3xl p-6"><h2 className="serif text-2xl">Your order</h2><div className="mt-5 grid gap-3">{lines.map(({ item, product }) => <div key={product.id} className="flex gap-3 text-sm"><img src={product.image} alt="" className="h-12 w-12 rounded-lg object-cover" /><div className="min-w-0 flex-1"><div className="truncate font-semibold">{product.name}</div><div className="text-muted-foreground">Qty {item.quantity}</div></div><span className="font-semibold">{money(product.price * item.quantity)}</span></div>)}</div><div className="mt-5 flex justify-between border-t border-border pt-5"><strong>Total</strong><strong className="serif text-2xl">{money(total)}</strong></div></aside></div></div>;
}

function Orders() { const { user, orders } = useMarket(); const [filter, setFilter] = useState('all'); const mine = orders.filter((o) => o.buyerId === user?.id).filter((o) => filter === 'all' || o.status === filter); return <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8"><span className="mono text-xs uppercase tracking-[.16em] text-accent">Your history</span><h1 className="serif mt-2 text-5xl">Orders.</h1><div className="mobile-scroll mt-7 flex gap-2">{['all', 'placed', 'packed', 'shipped', 'delivered', 'cancelled'].map((s) => <button key={s} onClick={() => setFilter(s)} className={cn('whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold capitalize', filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{s}</button>)}</div><div className="mt-6 grid gap-3">{mine.length ? mine.map((order) => <OrderRow key={order.id} order={order} />) : <EmptyState icon={Package} title="No orders here yet" body="Your next good find will show up in this tidy little history." action={<Link href="/shop" className="font-bold text-primary">Start browsing</Link>} />}</div></div>; }
function OrderRow({ order }: { order: Order }) { const item = order.items[0]; const tone = order.status === 'cancelled' ? 'danger' : order.status === 'delivered' ? 'success' : order.status === 'placed' ? 'warning' : 'muted'; return <Link href={`/orders/${order.id}`} className="surface lift flex items-center gap-4 rounded-2xl p-4"><img src={item.image} alt="" className="h-16 w-16 rounded-xl object-cover" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><strong className="truncate">{item.name}</strong><StatusPill tone={tone}>{order.status}</StatusPill></div><p className="mt-1 text-sm text-muted-foreground">{order.id} · {date(order.createdAt)} · {order.items.length} item{order.items.length > 1 ? 's' : ''}</p></div><div className="hidden text-right sm:block"><strong>{money(order.totalAmount)}</strong><p className="mt-1 text-xs text-muted-foreground">{order.paymentMethod}</p></div><ChevronRight size={18} className="text-muted-foreground" /></Link>; }

function OrderDetail() { const { id } = useParams<{ id: string }>(); const { orders } = useMarket(); const order = orders.find((o) => o.id === id); if (!order) return <NotFound />; const steps = ['placed', 'packed', 'shipped', 'delivered']; const current = steps.indexOf(order.status); return <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8"><Link href="/orders" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ArrowLeft size={16} /> All orders</Link><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><span className="mono text-xs uppercase tracking-[.16em] text-accent">{order.id}</span><h1 className="serif mt-2 text-5xl">Order details.</h1><p className="mt-2 text-muted-foreground">Placed {date(order.createdAt)}</p></div><StatusPill tone={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'danger' : 'warning'}>{order.status}</StatusPill></div><div className="mt-9 grid gap-6 lg:grid-cols-[1fr_310px]"><section className="surface rounded-3xl p-6 sm:p-8"><h2 className="serif text-2xl">Where it is now</h2>{order.status === 'cancelled' ? <div className="mt-7 rounded-2xl bg-destructive/10 p-5 text-sm text-destructive">This order was cancelled. If you were charged, your refund will be handled automatically.</div> : <div className="mt-8 grid grid-cols-4">{steps.map((step, i) => <div key={step} className="relative text-center"><div className={cn('relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full border-4 border-card', i <= current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>{i <= current ? <Check size={16} /> : <span className="mono text-xs">{i + 1}</span>}</div>{i < steps.length - 1 && <div className={cn('absolute left-1/2 top-5 h-0.5 w-full', i < current ? 'bg-primary' : 'bg-muted')} /> }<span className="mt-3 block text-[11px] font-bold capitalize text-muted-foreground">{step}</span></div>)}</div>}<div className="mt-10 grid gap-3">{order.items.map((item) => <div key={item.productId} className="flex gap-3 border-t border-border pt-4"><img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl object-cover" /><div className="flex-1"><strong>{item.name}</strong><p className="mt-1 text-sm text-muted-foreground">Quantity {item.quantity}</p></div><strong>{money(item.price * item.quantity)}</strong></div>)}</div></section><aside className="surface h-fit rounded-3xl p-6"><h2 className="serif text-2xl">Delivery notes</h2><div className="mt-5 grid gap-5 text-sm"><div><span className="text-xs uppercase tracking-wider text-muted-foreground">Address</span><p className="mt-1 font-semibold leading-6">{order.shippingAddress}</p></div><div><span className="text-xs uppercase tracking-wider text-muted-foreground">Payment</span><p className="mt-1 font-semibold">{order.paymentMethod}</p></div><div className="flex justify-between border-t border-border pt-4"><strong>Total paid</strong><strong className="serif text-xl">{money(order.totalAmount)}</strong></div></div></aside></div></div>; }

function OrderInspectionModal({
  order,
  onClose,
  onStatusChange,
}: {
  order: Order | null;
  onClose: () => void;
  onStatusChange: (orderId: string, status: Order['status']) => void;
}) {
  if (!order) return null;
  const statuses: Order['status'][] = ['placed', 'packed', 'shipped', 'delivered', 'cancelled'];
  const statusStyles: Record<string, string> = {
    placed: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    packed: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    shipped: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800',
    delivered: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    cancelled: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="surface relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 sm:p-8 shadow-2xl border border-border">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="mono text-xs font-bold uppercase tracking-wider text-accent">{order.id}</span>
              <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-bold capitalize', statusStyles[order.status] || 'bg-muted text-foreground')}>
                {order.status}
              </span>
            </div>
            <h2 className="serif mt-1 text-3xl font-semibold">Sale Order Details</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Placed on {date(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Fulfillment Status Actions */}
        <div className="mt-5 rounded-2xl bg-secondary/60 p-4 border border-border/70">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Update Order Fulfillment Status:</div>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => onStatusChange(order.id, st)}
                disabled={order.status === st}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition-all',
                  order.status === st
                    ? 'bg-primary text-primary-foreground shadow-sm cursor-default'
                    : 'border border-border bg-card text-muted-foreground hover:border-primary hover:text-primary active:scale-95'
                )}
              >
                {order.status === st ? `✓ ${st}` : `Mark ${st}`}
              </button>
            ))}
          </div>
        </div>

        {/* Customer & Shipping Information */}
        <div className="mt-5 grid gap-4 rounded-2xl border border-border p-4 sm:grid-cols-2 text-sm bg-card">
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Buyer Name</span>
            <p className="mt-1 font-bold text-foreground text-base">{order.buyerName || 'ShopSphere Customer'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Customer ID: {order.buyerId || 'N/A'}</p>
          </div>
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Payment Information</span>
            <p className="mt-1 font-bold text-foreground text-base">{order.paymentMethod || 'UPI / NetBanking'}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">Total Amount: {money(order.totalAmount)}</p>
          </div>
          <div className="sm:col-span-2 border-t border-border pt-3">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Shipping & Delivery Address</span>
            <p className="mt-1 font-medium leading-relaxed text-foreground/90">{order.shippingAddress || 'No address specified'}</p>
          </div>
        </div>

        {/* Items in this Order */}
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Items Sold in this Order ({order.items.length})</h3>
          <div className="grid gap-2.5">
            {order.items.map((item, idx) => (
              <div key={`${item.productId}-${idx}`} className="flex items-center gap-3.5 rounded-2xl border border-border/80 bg-card p-3.5">
                <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-foreground">{item.name}</strong>
                  <span className="text-xs text-muted-foreground">Quantity: {item.quantity} · {money(item.price)} each</span>
                </div>
                <strong className="text-sm font-bold text-foreground">{money(item.price * item.quantity)}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
          <Button variant="soft" onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}

function SellerProduct({
  product,
  onInspectOrder,
}: {
  product: Product;
  onInspectOrder: (order: Order) => void;
}) {
  const { deleteProduct, orders, updateOrderStatus } = useMarket();
  const [expanded, setExpanded] = useState(false);

  // Filter orders that contain this specific product
  const productOrders = orders.filter((o) =>
    o.items.some((item) => item.productId === product.id)
  );

  const totalUnitsSold = productOrders.reduce((sum, o) => {
    const item = o.items.find((i) => i.productId === product.id);
    return sum + (item ? item.quantity : 0);
  }, 0);

  const totalRevenue = productOrders.reduce((sum, o) => {
    const item = o.items.find((i) => i.productId === product.id);
    return sum + (item ? item.price * item.quantity : 0);
  }, 0);

  const statusTone = product.status === 'active' ? 'success' : 'warning';

  return (
    <div className="surface overflow-hidden rounded-2xl border border-border/80 transition-all hover:border-border">
      {/* Product Summary Row */}
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
        <img src={product.image} alt={product.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <strong className="truncate text-base font-semibold">{product.name}</strong>
            <StatusPill tone={statusTone}>{product.status}</StatusPill>
          </div>

          {/* Performance & Stock Metrics */}
          <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="font-bold text-foreground">{money(product.price)}</span>
            <span>·</span>
            <span>{product.stock} in stock</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 font-semibold text-primary">
              <Package size={12} /> {totalUnitsSold} sold
            </span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 font-bold text-primary">
              {money(totalRevenue)} revenue
            </span>
          </div>
        </div>

        {/* Listing Control Actions */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all',
              expanded
                ? 'bg-primary text-primary-foreground shadow-sm'
                : productOrders.length > 0
                ? 'bg-secondary text-primary hover:bg-secondary/70'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
            title="View and interact with sales for this listing"
          >
            <ShoppingBag size={13} />
            <span>Sales ({productOrders.length})</span>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          <Link href={`/seller/edit/${product.id}`} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-primary" aria-label="Edit listing">
            <Pencil size={15} />
          </Link>

          <button
            onClick={() => {
              if (window.confirm(`Are you sure you want to remove "${product.name}"?`)) {
                deleteProduct(product.id);
              }
            }}
            aria-label="Delete listing"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Expandable Sales & Fulfillment Tray Directly Under Listing */}
      {expanded && (
        <div className="border-t border-border/80 bg-secondary/20 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="serif text-lg font-semibold flex items-center gap-2 text-foreground">
              <ShoppingBag size={16} className="text-primary" />
              Sales & Orders for this item
            </h4>
            <span className="text-xs text-muted-foreground">
              {productOrders.length} order{productOrders.length === 1 ? '' : 's'} placed · {totalUnitsSold} unit{totalUnitsSold === 1 ? '' : 's'} sold
            </span>
          </div>

          {productOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              <p>No orders received for this listing yet.</p>
              <p className="mt-1 text-xs text-muted-foreground/75">Once buyers purchase this product, each order will appear here with customer details and fulfillment tools.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {productOrders.map((order) => {
                const orderItem = order.items.find((i) => i.productId === product.id);
                const qty = orderItem ? orderItem.quantity : 1;
                const itemTotal = orderItem ? orderItem.price * qty : product.price;

                const statusPillTone: Record<string, 'success' | 'warning' | 'danger' | 'muted'> = {
                  placed: 'warning',
                  packed: 'warning',
                  shipped: 'success',
                  delivered: 'success',
                  cancelled: 'danger',
                };

                return (
                  <div key={order.id} className="surface rounded-xl border border-border/80 p-3.5 shadow-sm transition-all hover:border-primary/40">
                    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                      {/* Left: Order and Buyer info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="mono text-xs font-bold text-accent">{order.id}</span>
                          <span className="text-xs text-muted-foreground">· {date(order.createdAt)}</span>
                          <StatusPill tone={statusPillTone[order.status] || 'muted'}>
                            {order.status}
                          </StatusPill>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-semibold text-foreground">Buyer: {order.buyerName || 'Customer'}</span>
                          <span>·</span>
                          <span className="text-muted-foreground">{qty} unit{qty > 1 ? 's' : ''} ordered ({money(itemTotal)})</span>
                          {order.shippingAddress && (
                            <>
                              <span>·</span>
                              <span className="truncate text-muted-foreground max-w-[200px]" title={order.shippingAddress}>
                                📍 {order.shippingAddress}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Right: Interactive Order Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {order.status === 'placed' && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, 'packed')}
                            className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition"
                          >
                            Mark Packed
                          </button>
                        )}
                        {order.status === 'packed' && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, 'shipped')}
                            className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition"
                          >
                            Mark Shipped
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 px-3 py-1 text-xs font-bold hover:bg-emerald-600 hover:text-white transition"
                          >
                            Mark Delivered
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onInspectOrder(order)}
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition"
                          title="View customer address, contact, and fulfillment details"
                        >
                          <Eye size={12} />
                          <span>Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DashStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="surface rounded-2xl p-4 sm:p-5 border border-border/80">
      <div className="flex items-center justify-between text-primary">
        <span className="rounded-xl bg-secondary p-2">{icon}</span>
        <span className="mono text-2xl font-bold text-foreground">{value}</span>
      </div>
      <div className="mt-4 text-xs font-bold uppercase tracking-[.12em] text-muted-foreground">{label}</div>
    </div>
  );
}

function Seller() {
  const { user, products, orders, setMode, updateOrderStatus } = useMarket();
  const [, setLocation] = useLocation();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [salesFilter, setSalesFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) return null;

  // Filter listings belonging to this seller
  const mine = products.filter((p) => p.sellerId === user.id);

  // Orders that contain at least one item from this seller
  const received = orders.filter((o) =>
    o.items.some((item) => mine.some((p) => p.id === item.productId))
  );

  // Calculate total earnings from all items sold by this seller
  const totalEarnings = received.reduce((sum, o) => {
    const sellerItemsTotal = o.items
      .filter((item) => mine.some((p) => p.id === item.productId))
      .reduce((itemSum, item) => itemSum + item.price * item.quantity, 0);
    return sum + sellerItemsTotal;
  }, 0);

  // Calculate total units sold
  const totalUnitsSold = received.reduce((sum, o) => {
    const units = o.items
      .filter((item) => mine.some((p) => p.id === item.productId))
      .reduce((unitSum, item) => unitSum + item.quantity, 0);
    return sum + units;
  }, 0);

  // Filtered sales in the sales console
  const filteredSales = received
    .filter((o) => salesFilter === 'all' || o.status === salesFilter)
    .filter((o) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        (o.buyerName && o.buyerName.toLowerCase().includes(q)) ||
        o.items.some((item) => item.name.toLowerCase().includes(q))
      );
    });

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      {/* Top Banner Header */}
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <span className="mono text-xs uppercase tracking-[.16em] text-accent">Seller Studio</span>
          <h1 className="serif mt-2 text-4xl sm:text-5xl font-semibold">Make room for good work.</h1>
          <p className="mt-2 text-muted-foreground">Manage your listings, interact with buyer orders, and track your shop growth.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => {
              setMode('buy');
              setLocation('/shop');
            }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition"
          >
            <ShoppingBag size={16} /> View as Buyer
          </button>
          <Link href="/seller/add-product" className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-95">
            <Plus size={16} /> Add a listing
          </Link>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="mt-9 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <DashStat label="Live listings" value={String(mine.filter((p) => p.status === 'active').length)} icon={<Box />} />
        <DashStat label="Orders received" value={String(received.length)} icon={<Package />} />
        <DashStat label="Units Sold" value={String(totalUnitsSold)} icon={<ShoppingBag />} />
        <DashStat label="Total Earnings" value={money(totalEarnings)} icon={<BarChart3 />} />
      </div>

      {/* Main Studio Columns */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.25fr_.75fr]">
        {/* Left Column: Your Listings with Embedded Per-Listing Sales */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="serif text-3xl font-semibold">Your listings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Click "Sales" on any listing to inspect and fulfill orders directly under it.</p>
            </div>
            <Link href="/seller/add-product" className="text-sm font-bold text-primary hover:underline">
              Add new
            </Link>
          </div>

          <div className="grid gap-3.5">
            {mine.length ? (
              mine.map((p) => (
                <SellerProduct key={p.id} product={p} onInspectOrder={setSelectedOrder} />
              ))
            ) : (
              <EmptyState
                icon={Store}
                title="Your shelf is ready"
                body="Add your first listing and start being discovered."
                action={<Link href="/seller/add-product" className="font-bold text-primary">Create listing</Link>}
              />
            )}
          </div>
        </section>

        {/* Right Column: Interactive Sales & Orders Console */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="serif text-3xl font-semibold">Recent sales</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Fulfill and manage your incoming customer orders.</p>
            </div>
            <span className="mono text-xs font-bold text-accent">{received.length} total</span>
          </div>

          <div className="surface rounded-3xl p-5 border border-border/80 shadow-sm">
            {/* Search and Filters */}
            <div className="mb-4 grid gap-2.5">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter sales by buyer or order ID..."
                  className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {['all', 'placed', 'packed', 'shipped', 'delivered', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSalesFilter(st)}
                    className={cn(
                      'whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition',
                      salesFilter === st
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders List */}
            {filteredSales.length > 0 ? (
              <div className="grid gap-3">
                {filteredSales.map((o) => {
                  const sellerItems = o.items.filter((item) =>
                    mine.some((p) => p.id === item.productId)
                  );
                  const firstItem = sellerItems[0] || o.items[0];

                  const statusPillTone: Record<string, 'success' | 'warning' | 'danger' | 'muted'> = {
                    placed: 'warning',
                    packed: 'warning',
                    shipped: 'success',
                    delivered: 'success',
                    cancelled: 'danger',
                  };

                  return (
                    <div
                      key={o.id}
                      className="group rounded-2xl border border-border/70 p-3.5 transition-all hover:border-primary/40 bg-card hover:shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-secondary p-2 text-primary shrink-0">
                          <ShoppingBag size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <strong className="truncate text-sm font-semibold text-foreground">
                              {firstItem ? firstItem.name : 'Ordered Item'}
                            </strong>
                            <strong className="text-sm font-bold text-foreground">{money(o.totalAmount)}</strong>
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            <span className="mono text-accent font-semibold">{o.id}</span>
                            <span>·</span>
                            <span>{date(o.createdAt)}</span>
                            <span>·</span>
                            <span className="font-medium text-foreground/80">{o.buyerName || 'Buyer'}</span>
                          </div>

                          {/* Action Footer */}
                          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5">
                            <StatusPill tone={statusPillTone[o.status] || 'muted'}>{o.status}</StatusPill>
                            <div className="flex items-center gap-1.5">
                              {o.status === 'placed' && (
                                <button
                                  type="button"
                                  onClick={() => updateOrderStatus(o.id, 'packed')}
                                  className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-primary hover:bg-primary hover:text-primary-foreground transition"
                                >
                                  Pack
                                </button>
                              )}
                              {o.status === 'packed' && (
                                <button
                                  type="button"
                                  onClick={() => updateOrderStatus(o.id, 'shipped')}
                                  className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary hover:bg-primary hover:text-primary-foreground transition"
                                >
                                  Ship
                                </button>
                              )}
                              {o.status === 'shipped' && (
                                <button
                                  type="button"
                                  onClick={() => updateOrderStatus(o.id, 'delivered')}
                                  className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-0.5 text-[11px] font-bold hover:bg-emerald-600 hover:text-white transition"
                                >
                                  Deliver
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(o)}
                                className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary transition"
                              >
                                <Eye size={11} /> Details
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-sm text-muted-foreground">
                <Package size={28} className="mx-auto mb-2 text-muted-foreground/50" />
                <p>No orders matching your criteria.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Detailed Order Fulfillment Modal */}
      {selectedOrder && (
        <OrderInspectionModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusChange={async (orderId, newStatus) => {
            await updateOrderStatus(orderId, newStatus);
            setSelectedOrder((prev) => (prev && prev.id === orderId ? { ...prev, status: newStatus } : prev));
          }}
        />
      )}
    </div>
  );
}

function ProductForm({ edit = false }: { edit?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const { products, user, saveProduct } = useMarket();
  const existing = products.find((p) => p.id === id);
  const [, setLocation] = useLocation();
  const [name, setName] = useState(existing?.name || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [category, setCategory] = useState(existing?.category || 'Other');
  const [price, setPrice] = useState(String(existing?.price || ''));
  const [stock, setStock] = useState(String(existing?.stock || ''));
  const [condition, setCondition] = useState<Product['condition']>(existing?.condition || 'New');

  const initialMedia = existing?.images && existing.images.length > 0
    ? existing.images
    : (existing?.image ? [existing.image] : []);
  const [mediaList, setMediaList] = useState<string[]>(initialMedia);
  const [coverIndex, setCoverIndex] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [readingFiles, setReadingFiles] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!user) return null;

  const handleFiles = (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!list.length) {
      alert('Please upload image files (e.g. PNG, JPG, WebP, SVG).');
      return;
    }
    setReadingFiles(true);
    let done = 0;
    const added: string[] = [];
    list.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          added.push(e.target.result as string);
        }
        done++;
        if (done === list.length) {
          setMediaList((prev) => [...prev, ...added]);
          setReadingFiles(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const addFromUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setMediaList((prev) => [...prev, trimmed]);
    setUrlInput('');
  };

  const removeMedia = (index: number) => {
    setMediaList((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (coverIndex >= next.length) {
        setCoverIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) return;
    const primaryImage = mediaList[coverIndex] || mediaList[0] || 'https://images.pexels.com/photos/9095/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=900';
    saveProduct({
      id: existing?.id || `p-${Date.now()}`,
      name,
      description,
      category,
      price: Number(price),
      stock: Number(stock),
      condition,
      image: primaryImage,
      images: mediaList.length > 0 ? mediaList : [primaryImage],
      sellerId: existing?.sellerId || user.id,
      sellerName: existing?.sellerName || user.name,
      rating: existing?.rating || 5,
      reviewCount: existing?.reviewCount || 0,
      status: Number(stock) > 0 ? 'active' : 'out_of_stock',
      createdAt: existing?.createdAt || new Date().toISOString(),
    });
    setLocation('/seller');
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8">
      <Link href="/seller" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
        <ArrowLeft size={16} /> Seller studio
      </Link>
      <h1 className="serif text-5xl">{edit ? 'Tune your listing.' : 'Put it out there.'}</h1>
      <p className="mt-2 text-muted-foreground">{edit ? 'Keep the details fresh and useful.' : 'Tell the market why this deserves a new home.'}</p>
      
      <form onSubmit={submit} className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="surface grid gap-4 rounded-3xl p-6 sm:p-8">
          <Field label="Product name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Handwoven cotton shirt" required />
          <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What makes this a good find?" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (INR)" type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <Field label="Stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-semibold">
              Category
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-input bg-card px-3.5 py-3 text-sm font-normal outline-none">
                <option>Electronics</option>
                <option>Fashion</option>
                <option>Books</option>
                <option>Home</option>
                <option>Sports</option>
                <option>Other</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-semibold">
              Condition
              <select value={condition} onChange={(e) => setCondition(e.target.value as Product['condition'])} className="rounded-xl border border-input bg-card px-3.5 py-3 text-sm font-normal outline-none">
                <option>New</option>
                <option>Used</option>
              </select>
            </label>
          </div>
          <Button type="submit" className="mt-3 w-fit">
            Save listing <Check size={16} />
          </Button>
        </section>

        <aside className="surface h-fit rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="serif text-2xl">Photos & media</h2>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
              {mediaList.length} photo{mediaList.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Drag and drop photos or upload from your computer.</p>

          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200',
              dragActive
                ? 'border-primary bg-primary/10 ring-4 ring-primary/20 scale-[1.01]'
                : 'border-border hover:border-primary/60 hover:bg-muted/30'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
                e.target.value = '';
              }}
            />
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl transition-transform', dragActive ? 'bg-primary text-primary-foreground scale-110' : 'bg-secondary text-primary')}>
              <UploadCloud size={24} className={dragActive ? 'animate-bounce' : ''} />
            </div>
            <strong className="mt-3 text-sm font-semibold">
              {dragActive ? 'Drop photos here' : 'Drag & drop photos or media'}
            </strong>
            <p className="mt-1 text-xs text-muted-foreground">
              or <span className="font-semibold text-primary underline">browse from device</span>
            </p>
            <span className="mono mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/80">
              Supports PNG, JPG, WebP, GIF, SVG
            </span>
          </div>

          {readingFiles && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-primary">
              <Sparkles size={14} className="animate-spin" /> Processing photos...
            </div>
          )}

          {/* Direct URL input fallback */}
          <div className="mt-4 flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFromUrl(e); } }}
              placeholder="Or paste an image link..."
              className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs outline-none focus:border-primary"
            />
            <Button type="button" variant="soft" onClick={addFromUrl} className="shrink-0 px-3 py-2 text-xs">
              Add
            </Button>
          </div>

          {/* Media Preview & Selection Gallery */}
          {mediaList.length > 0 ? (
            <div className="mt-5 space-y-3">
              <div className="relative overflow-hidden rounded-2xl border border-border">
                <img
                  src={mediaList[coverIndex] || mediaList[0]}
                  alt="Product Cover"
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                  <Star size={12} className="text-accent" fill="currentColor" /> Cover photo
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {mediaList.map((src, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'group relative aspect-square overflow-hidden rounded-xl border-2 transition-all',
                      coverIndex === idx ? 'border-primary ring-2 ring-primary/30' : 'border-border/60 hover:border-primary/50'
                    )}
                  >
                    <img
                      src={src}
                      alt=""
                      onClick={() => setCoverIndex(idx)}
                      className="h-full w-full cursor-pointer object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setCoverIndex(idx)}
                        title="Set as cover"
                        className={cn('rounded-full p-1 text-xs', coverIndex === idx ? 'bg-primary text-white' : 'bg-white/90 text-black hover:bg-white')}
                      >
                        <Star size={11} fill={coverIndex === idx ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeMedia(idx)}
                        title="Remove photo"
                        className="rounded-full bg-destructive/90 p-1 text-white hover:bg-destructive"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                    {coverIndex === idx && (
                      <span className="absolute left-1 top-1 rounded bg-primary px-1 py-0.5 text-[9px] font-bold text-primary-foreground">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Click any thumbnail to set as primary cover photo, or hover to remove.
              </p>
            </div>
          ) : (
            <div className="image-wash mt-4 overflow-hidden rounded-2xl">
              <div className="flex aspect-square items-center justify-center text-sm text-muted-foreground">
                Preview appears here
              </div>
            </div>
          )}
        </aside>
      </form>
    </div>
  );
}

function AdminNav() { return <div className="mobile-scroll mb-8 flex gap-2">{[['/admin', 'Overview', LayoutDashboard], ['/admin/users', 'Users', Users], ['/admin/products', 'Products', Box], ['/admin/orders', 'Orders', Package], ['/admin/categories', 'Categories', ListFilter], ['/admin/analytics', 'Analytics', BarChart3], ['/admin/settings', 'Settings', Settings]].map(([href, label, Icon]) => <Link key={href as string} href={href as string} className="flex shrink-0 items-center gap-2 rounded-full bg-muted px-3.5 py-2 text-xs font-bold text-muted-foreground hover:bg-primary hover:text-primary-foreground"><Icon size={14} />{label as string}</Link>)}</div>; }
function AdminLayout({ title, children }: { title: string; children: React.ReactNode }) { return <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-accent"><ShieldIcon /> Admin console</div><h1 className="serif text-5xl">{title}</h1><div className="mt-7"><AdminNav />{children}</div></div>; }
function Admin() { const { users, products, orders } = useMarket(); const revenue = orders.reduce((s, o) => s + o.totalAmount, 0); return <AdminLayout title="Keep the market healthy."><div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><DashStat label="Gross sales" value={money(revenue)} icon={<BarChart3 />} /><DashStat label="Active users" value={String(users.filter((u) => u.status === 'active').length)} icon={<Users />} /><DashStat label="Live products" value={String(products.filter((p) => p.status === 'active').length)} icon={<Box />} /><DashStat label="Open orders" value={String(orders.filter((o) => !['delivered', 'cancelled'].includes(o.status)).length)} icon={<Truck />} /></div><div className="mt-7 grid gap-6 lg:grid-cols-[1.15fr_.85fr]"><section className="surface rounded-3xl p-6"><div className="flex items-center justify-between"><h2 className="serif text-2xl">Sales pulse</h2><span className="mono text-xs text-muted-foreground">last 30 days</span></div><div className="mt-8 flex h-48 items-end gap-2">{[42, 64, 48, 82, 58, 76, 91, 68, 78, 96, 73, 88].map((height, i) => <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-2"><div className={cn('w-full max-w-8 rounded-t-lg transition group-hover:bg-accent', i === 9 ? 'bg-accent' : 'bg-primary/70')} style={{ height: `${height}%` }} /><span className="mono text-[9px] text-muted-foreground">{['W1', '', 'W2', '', 'W3', '', 'W4', '', 'W5', '', 'W6', ''][i]}</span></div>)}</div></section><section className="surface rounded-3xl p-6"><h2 className="serif text-2xl">Order status</h2><div className="mt-7 grid gap-4">{(['delivered', 'shipped', 'packed', 'placed', 'cancelled'] as const).map((status) => { const count = orders.filter((o) => o.status === status).length; return <div key={status}><div className="mb-1 flex justify-between text-sm"><span className="capitalize">{status}</span><strong>{count}</strong></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={cn('h-full rounded-full', status === 'delivered' ? 'bg-primary' : status === 'cancelled' ? 'bg-destructive' : 'bg-accent')} style={{ width: `${Math.max(7, count / orders.length * 100)}%` }} /></div></div>; })}</div></section></div><div className="mt-7 grid gap-7 lg:grid-cols-[1.15fr_.85fr]"><section><h2 className="serif mb-4 text-2xl">Recent orders</h2><div className="surface overflow-hidden rounded-3xl">{orders.slice(0, 6).map((o) => <OrderRow key={o.id} order={o} />)}</div></section><section><h2 className="serif mb-4 text-2xl">Recent products</h2><div className="surface rounded-3xl p-4">{products.slice(0, 6).map((p) => <Link key={p.id} href={`/product/${p.id}`} className="flex items-center gap-3 border-b border-border py-3 last:border-0"><img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" /><span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span><span className="text-xs text-muted-foreground">{money(p.price)}</span></Link>)}</div></section></div></AdminLayout>; }

function AdminUsers() { const { users, setUserStatus } = useMarket(); const [query, setQuery] = useState(''); const shown = users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase())); return <AdminLayout title="People on the market."><div className="mb-5 flex items-center rounded-xl border border-input bg-card px-3 sm:max-w-sm"><Search size={16} className="text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search people" className="w-full bg-transparent px-2 py-3 text-sm outline-none" /></div><div className="surface overflow-x-auto rounded-3xl"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="p-4">Person</th><th className="p-4">Role</th><th className="p-4">Joined</th><th className="p-4">Status</th><th className="p-4 text-right">Action</th></tr></thead><tbody>{shown.map((user) => <tr key={user.id} className="border-t border-border"><td className="p-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-bold text-secondary-foreground">{user.name[0]}</div><div><strong>{user.name}</strong><div className="text-xs text-muted-foreground">{user.email}</div></div></div></td><td className="p-4 capitalize">{user.role}</td><td className="p-4 text-muted-foreground">{date(user.createdAt)}</td><td className="p-4"><StatusPill tone={user.status === 'active' ? 'success' : 'danger'}>{user.status}</StatusPill></td><td className="p-4 text-right">{user.role !== 'admin' && <Button variant={user.status === 'active' ? 'outline' : 'soft'} onClick={() => { if (window.confirm(`${user.status === 'active' ? 'Suspend' : 'Activate'} ${user.name}?`)) setUserStatus(user.id, user.status === 'active' ? 'suspended' : 'active'); }}>{user.status === 'active' ? 'Suspend' : 'Activate'}</Button>}</td></tr>)}</tbody></table></div></AdminLayout>; }
function AdminProducts() { const { products, saveProduct } = useMarket(); const [query, setQuery] = useState(''); const shown = products.filter((p) => `${p.name} ${p.sellerName} ${p.category}`.toLowerCase().includes(query.toLowerCase())); const moderate = (p: Product, status: ProductStatus) => { saveProduct({ ...p, status }); const activeToken = localStorage.getItem('shopsphere_jwt_token'); if (activeToken) { fetch(`/api/products/${p.id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${activeToken}` }, body: JSON.stringify({ status }) }).catch(() => {}); } }; return <AdminLayout title="Listings worth trusting."><div className="mb-5 flex items-center rounded-xl border border-input bg-card px-3 sm:max-w-sm"><Search size={16} className="text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search listings" className="w-full bg-transparent px-2 py-3 text-sm outline-none" /></div><div className="grid gap-3">{shown.map((p) => <div key={p.id} className="surface flex flex-wrap items-center gap-3 rounded-2xl p-3"><img src={p.image} alt="" className="h-14 w-14 rounded-xl object-cover" /><div className="min-w-48 flex-1"><strong>{p.name}</strong><p className="text-xs text-muted-foreground">{p.sellerName} · {p.category} · {money(p.price)}</p></div><StatusPill tone={p.status === 'active' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning'}>{p.status}</StatusPill><div className="flex gap-2">{p.status !== 'active' && <Button className="px-3 py-2 text-xs" onClick={() => moderate(p, 'active')}>Approve</Button>}{p.status !== 'rejected' && <Button variant="outline" className="px-3 py-2 text-xs" onClick={() => moderate(p, 'rejected')}>Reject</Button>}</div></div>)}</div></AdminLayout>; }
function AdminOrders() { const { orders } = useMarket(); const [query, setQuery] = useState(''); const [filter, setFilter] = useState('all'); const shown = orders.filter((o) => `${o.id} ${o.items.map((i) => i.name).join(' ')}`.toLowerCase().includes(query.toLowerCase())).filter((o) => filter === 'all' || o.status === filter); return <AdminLayout title="Every order, accounted for."><div className="mb-5 flex flex-wrap gap-2"><div className="flex items-center rounded-xl border border-input bg-card px-3"><Search size={16} className="text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search orders" className="w-52 bg-transparent px-2 py-3 text-sm outline-none" /></div><select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-input bg-card px-3 py-2 text-sm"><option value="all">All statuses</option>{['placed', 'packed', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s}>{s}</option>)}</select></div><div className="surface overflow-hidden rounded-3xl">{shown.map((o) => <OrderRow key={o.id} order={o} />)}</div></AdminLayout>; }
function AdminCategories() { const { categories, saveCategory, deleteCategory } = useMarket(); const [name, setName] = useState(''); const [editing, setEditing] = useState<string | null>(null); return <AdminLayout title="Shape the shelves."><div className="surface mb-6 rounded-3xl p-5"><div className="flex flex-wrap gap-3"><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="min-w-56 flex-1 rounded-xl border border-input bg-card px-3 py-3 text-sm outline-none" /><Button onClick={() => { if (!name.trim()) return; saveCategory({ id: editing || `cat-${Date.now()}`, name: name.trim(), count: 0 }); setName(''); setEditing(null); }}>{editing ? 'Save category' : 'Add category'} <Plus size={16} /></Button></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{categories.map((category) => <div key={category.id} className="surface flex items-center gap-3 rounded-2xl p-4"><div className="rounded-xl bg-secondary p-2 text-primary"><ListFilter size={16} /></div><div className="flex-1"><strong>{category.name}</strong><p className="text-xs text-muted-foreground">{category.count} products</p></div><button onClick={() => { setEditing(category.id); setName(category.name); }} aria-label="Edit category" className="rounded-full p-2 text-muted-foreground hover:text-primary"><Pencil size={15} /></button><button onClick={() => { if (window.confirm(`Delete ${category.name}?`)) deleteCategory(category.id); }} aria-label="Delete category" className="rounded-full p-2 text-muted-foreground hover:text-destructive"><Trash2 size={15} /></button></div>)}</div></AdminLayout>; }
function AdminAnalytics() { return <AdminLayout title="Read the room."><div className="grid gap-6 lg:grid-cols-[1fr_.8fr]"><section className="surface rounded-3xl p-6 sm:p-8"><div className="flex items-center gap-3"><div className="rounded-xl bg-primary/10 p-3 text-primary"><BarChart3 /></div><div><h2 className="serif text-2xl">Cloud-ready analytics</h2><p className="text-sm text-muted-foreground">A local signal today, Lambda-ready tomorrow.</p></div></div><div className="mt-8 grid gap-4 sm:grid-cols-2"><MiniStat value="1,248" label="product views" /><MiniStat value="312" label="searches this week" /><MiniStat value="18.6%" label="cart conversion" /><MiniStat value="4.8 / 5" label="marketplace trust" /></div></section><section className="surface rounded-3xl p-6"><h2 className="serif text-2xl">Event stream</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">The adapter records key actions to localStorage, keeping the interface ready for Amazon Pinpoint or CloudWatch without coupling components to infrastructure.</p><div className="mt-6 space-y-3 text-sm">{['product_viewed', 'add_to_cart', 'order_created', 'seller_listing_saved'].map((event, i) => <div key={event} className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-accent" /><span className="mono text-xs">{event}</span><span className="ml-auto text-xs text-muted-foreground">{[48, 31, 12, 9][i]} events</span></div>)}</div></section></div></AdminLayout>; }
function AdminSettings() { const [settings, setSettings] = useState({ marketplace: true, moderation: true, analytics: true, emails: false }); const toggle = (key: keyof typeof settings) => setSettings((s) => ({ ...s, [key]: !s[key] })); return <AdminLayout title="Set the house rules."><div className="surface max-w-2xl divide-y divide-border rounded-3xl">{[['marketplace', 'Marketplace is open', 'Let buyers browse and place new orders.'], ['moderation', 'Review new listings', 'Hold seller listings for a quick quality check.'], ['analytics', 'Capture marketplace events', 'Keep the demo event adapter recording useful signals.'], ['emails', 'Order email previews', 'Preview notifications in the local demo only.']].map(([key, label, body]) => <div key={key} className="flex items-center gap-4 p-5 sm:p-6"><div className="flex-1"><strong>{label}</strong><p className="mt-1 text-sm text-muted-foreground">{body}</p></div><button onClick={() => toggle(key as keyof typeof settings)} aria-label={`Toggle ${label}`} className={cn('relative h-7 w-12 rounded-full transition', settings[key as keyof typeof settings] ? 'bg-primary' : 'bg-muted')}><span className={cn('absolute top-1 h-5 w-5 rounded-full bg-card transition-transform', settings[key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1')} /></button></div>)}</div></AdminLayout>; }

function Unauthorized() { return <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center px-5 text-center"><div className="rounded-3xl bg-secondary p-5 text-primary"><CircleAlert size={30} /></div><h1 className="serif mt-6 text-5xl">Not your shelf.</h1><p className="mt-3 text-muted-foreground">This part of ShopSphere is reserved for the people who keep the market running.</p><Link href="/" className="mt-7 inline-flex rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground">Back to the market</Link></div>; }

function Router() {
  return <Switch><Route path="/" component={Home} /><Route path="/shop" component={Shop} /><Route path="/product/:id" component={ProductDetail} /><Route path="/login"><Auth /></Route><Route path="/register"><Auth mode="register" /></Route><Route path="/profile"><Guard><Profile /></Guard></Route><Route path="/wishlist"><Wishlist /></Route><Route path="/cart"><Cart /></Route><Route path="/checkout"><Guard><Checkout /></Guard></Route><Route path="/orders" ><Guard><Orders /></Guard></Route><Route path="/orders/:id"><Guard><OrderDetail /></Guard></Route><Route path="/seller"><Guard><Seller /></Guard></Route><Route path="/seller/add-product"><Guard><ProductForm /></Guard></Route><Route path="/seller/edit/:id"><Guard><ProductForm edit /></Guard></Route><Route path="/admin"><Guard role="admin"><Admin /></Guard></Route><Route path="/admin/users"><Guard role="admin"><AdminUsers /></Guard></Route><Route path="/admin/products"><Guard role="admin"><AdminProducts /></Guard></Route><Route path="/admin/orders"><Guard role="admin"><AdminOrders /></Guard></Route><Route path="/admin/categories"><Guard role="admin"><AdminCategories /></Guard></Route><Route path="/admin/analytics"><Guard role="admin"><AdminAnalytics /></Guard></Route><Route path="/admin/settings"><Guard role="admin"><AdminSettings /></Guard></Route><Route path="/unauthorized" component={Unauthorized} /><Route component={NotFound} /></Switch>;
}
function App() { return <ErrorBoundary><MarketplaceProvider><Shell><Router /></Shell></MarketplaceProvider></ErrorBoundary>; }
export default App;
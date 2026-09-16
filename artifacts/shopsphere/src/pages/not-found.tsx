import { ArrowLeft, Compass, Search } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[68vh] max-w-xl flex-col items-center justify-center px-5 text-center">
      <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] bg-secondary text-primary">
        <Compass size={48} strokeWidth={1.5} />
        <span className="mono absolute -bottom-2 -right-2 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white">404</span>
      </div>
      <span className="mono mt-8 text-xs uppercase tracking-[.16em] text-accent">A wrong turn</span>
      <h1 className="serif mt-3 text-5xl">This shelf is empty.</h1>
      <p className="mt-4 max-w-md leading-7 text-muted-foreground">The page you were looking for may have moved, sold out, or never made it to the market.</p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 font-bold text-primary-foreground"><ArrowLeft size={16} /> Back home</Link>
        <Link href="/shop" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 font-bold"><Search size={16} /> Browse products</Link>
      </div>
    </div>
  );
}
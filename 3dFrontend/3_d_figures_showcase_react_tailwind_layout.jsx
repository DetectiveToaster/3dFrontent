import React, { useMemo, useState, useEffect, useRef } from "react";
import { Instagram, Facebook, Youtube, Mail, Menu, X, ChevronRight, Filter, Search, ShoppingCart, Boxes, Package, Info, Phone, Languages, Palette, Sparkles, Box, ExternalLink, Send } from "lucide-react";

/**
 * Single-file React + Tailwind layout for a cart-less showcase site.
 * - Header with red gradient hero style aligned to your screenshots
 * - No left sidebar; uses top navigation & sticky filter bar
 * - Pages: Home, Products, Card Boxes
 * - Inquiry Modal instead of Cart/Login
 * - Colored highlight tags & social CTAs
 *
 * Tailwind tips:
 * - Ensure your project has Tailwind set up and the container class centered.
 * - You can drop this component into your app and render <ShowcaseApp /> as the root.
 */

// ---- Mock Data ----
const HIGHLIGHT_TAGS = [
  { id: "new", label: "New", color: "bg-emerald-500" },
  { id: "hand", label: "Hand‑Painted", color: "bg-indigo-500" },
  { id: "resin", label: "Resin", color: "bg-rose-500" },
  { id: "stl", label: "STL", color: "bg-amber-500" },
];

const ALL_TAGS = [
  "All",
  "Resin",
  "Painted",
  "STL",
  "Anime",
  "Game",
  "Original",
];

const PRODUCTS = [
  {
    id: 1,
    name: "Ahri",
    price: 10.0,
    tags: ["Resin", "Anime"],
    image: "https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?q=80&w=1200&auto=format&fit=crop",
    badge: "Render",
  },
  {
    id: 2,
    name: "Asasasasas",
    price: 123.123,
    tags: ["STL", "Game"],
    image: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop",
    badge: "Prototype",
  },
  {
    id: 3,
    name: "Tifa",
    price: 35.0,
    tags: ["Painted", "Game"],
    image: "https://images.unsplash.com/photo-1582582621959-48a34f2b2a15?q=80&w=1200&auto=format&fit=crop",
    badge: "Photo",
  },
  {
    id: 4,
    name: "Original Knight",
    price: 49.0,
    tags: ["Original", "Resin"],
    image: "https://images.unsplash.com/photo-1520975922203-b89c56d0e6c1?q=80&w=1200&auto=format&fit=crop",
    badge: "Render",
  },
];

const BOX_FEATURES = [
  {
    icon: <Box className="w-6 h-6" />, title: "Sturdy Board", text: "Premium 1.5mm chipboard with matte lamination for durability."
  },
  {
    icon: <Sparkles className="w-6 h-6" />, title: "Custom Print", text: "Edge‑to‑edge CMYK artwork with spot UV or foil options."
  },
  {
    icon: <Package className="w-6 h-6" />, title: "Magnetic Lid", text: " satisfying snap‑shut closure; foam insert available."
  },
];

// ---- Utility ----
function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

// ---- Components ----
function Header({ onNav, current, onOpenMenu }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/70 border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-bold tracking-[0.2em] text-white">YOURLOGO</div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {[
              { key: "home", label: "Home" },
              { key: "products", label: "Products" },
              { key: "boxes", label: "Card Boxes" },
              { key: "about", label: "About" },
              { key: "contact", label: "Contact" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => onNav(item.key)}
                className={classNames(
                  "text-zinc-300 hover:text-white transition",
                  current === item.key && "text-white"
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <a aria-label="Instagram" href="#" className="text-zinc-300 hover:text-white"><Instagram className="w-5 h-5"/></a>
          <a aria-label="YouTube" href="#" className="text-zinc-300 hover:text-white"><Youtube className="w-5 h-5"/></a>
          <a aria-label="Email" href="#" className="text-zinc-300 hover:text-white"><Mail className="w-5 h-5"/></a>
          <button onClick={onOpenMenu} className="md:hidden text-zinc-300 hover:text-white"><Menu className="w-6 h-6"/></button>
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ open, onClose, onNav }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-80 bg-zinc-950 border-l border-white/10 p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="font-bold tracking-[0.2em]">MENU</div>
          <button onClick={onClose}><X className="w-6 h-6"/></button>
        </div>
        {[
          { key: "home", label: "Home" },
          { key: "products", label: "Products" },
          { key: "boxes", label: "Card Boxes" },
          { key: "about", label: "About" },
          { key: "contact", label: "Contact" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => { onNav(item.key); onClose(); }}
            className="w-full text-left py-3 px-2 rounded-lg hover:bg-white/5"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Hero({ title, subtitle, primary, secondary }) {
  return (
    <section className="bg-gradient-to-r from-[#5b0b0b] via-[#a01616] to-[#b91c1c]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="text-xs uppercase tracking-widest text-zinc-200/80 mb-4">Premium 3D Drops</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white max-w-3xl">{title}</h1>
        <p className="mt-3 text-zinc-100/80 max-w-2xl">{subtitle}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {primary}
          {secondary}
        </div>
      </div>
    </section>
  );
}

function HighlightsStrip({ rightText = "3", onTagClick }) {
  return (
    <div className="bg-[#a11616]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {HIGHLIGHT_TAGS.map((t) => (
            <button
              key={t.id}
              onClick={() => onTagClick?.(t.label || t.id)}
              className={classNames(
                "px-3 py-1 rounded-full text-xs font-medium text-white shadow",
                t.color
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="text-white/90 text-sm">{rightText} highlights</div>
      </div>
    </div>
  );
}

function SectionTitle({ title, subtitle, action }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-end justify-between">
      <div>
        <h2 className="text-white text-xl font-semibold tracking-wide">{title}</h2>
        {subtitle && <p className="text-zinc-400 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function ProductCard({ product, onInquiry }) {
  return (
    <div className="group bg-zinc-900/60 border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition">
      <div className="relative aspect-[4/3] bg-zinc-950">
        <img alt={product.name} src={product.image} className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute left-3 top-3 text-[11px] px-2 py-0.5 rounded-full bg-black/60 text-white border border-white/10">{product.badge}</div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <div>
          <div className="text-white text-sm font-medium">{product.name}</div>
          <div className="text-zinc-400 text-xs mt-0.5">{product.tags.join(" · ")}</div>
        </div>
        <div className="text-white text-sm font-semibold">${product.price.toFixed(2)}</div>
      </div>
      <div className="px-4 pb-4">
        <button onClick={() => onInquiry(product)} className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium bg-white text-black hover:bg-zinc-200 transition">
          Request quote <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ProductsPage({ onInquiry, initialTag }) {
  const [tag, setTag] = useState(initialTag || "All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Featured");

  const filtered = useMemo(() => {
    let items = PRODUCTS.filter((p) =>
      (tag === "All" || p.tags.includes(tag)) &&
      (query.trim() === "" || p.name.toLowerCase().includes(query.toLowerCase()))
    );
    if (sort === "Price: Low to High") items.sort((a, b) => a.price - b.price);
    if (sort === "Price: High to Low") items.sort((a, b) => b.price - a.price);
    if (sort === "Latest") items = items.slice().reverse();
    return items;
  }, [tag, query, sort]);

  // Sticky bar shadow on scroll
  const barRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pb-20">
      <div ref={barRef} className={classNames(
        "sticky top-16 z-30 border-b border-white/5 bg-black/70 backdrop-blur",
        scrolled && "shadow-[0_10px_30px_-15px_rgba(0,0,0,0.6)]"
      )}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              {ALL_TAGS.map((t) => (
                <button key={t} onClick={() => setTag(t)} className={classNames("px-3 py-1.5 rounded-full text-xs border", tag === t ? "bg-white text-black border-white" : "border-white/10 text-zinc-300 hover:text-white hover:border-white/30")}>{t}</button>
              ))}
            </div>
            <div className="flex md:ml-auto items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-[unset]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"/>
                <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search" className="w-full md:w-64 bg-zinc-900/70 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-white/30"/>
              </div>
              <select value={sort} onChange={(e)=>setSort(e.target.value)} className="bg-zinc-900/70 border border-white/10 rounded-xl px-3 py-2 text-sm text-white">
                {"Featured,Latest,Price: Low to High,Price: High to Low".split(",").map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} onInquiry={onInquiry} />
        ))}
      </div>
    </div>
  );
}

function BoxesPage({ onInquiry }) {
  return (
    <div className="pb-20">
      <Hero
        title="Collector Card Boxes"
        subtitle="Premium rigid boxes tailored for trading cards and miniatures. Custom sizes, full-wrap print, and foam inserts on request."
        primary={<a className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-white text-black text-sm font-semibold" href="#quote">Get a quote <ChevronRight className="w-4 h-4"/></a>}
        secondary={<a className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-white/30 text-white/90 text-sm hover:bg-white/10" href="#gallery">View gallery</a>}
      />
      <HighlightsStrip rightText="In stock" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <SectionTitle title="Why our boxes" subtitle="Built to protect and present your collection." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BOX_FEATURES.map((f, i) => (
            <div key={i} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5">
              <div className="text-white/90 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/5 border border-white/10">{f.icon}</div>
                <div className="font-semibold">{f.title}</div>
              </div>
              <p className="text-zinc-400 text-sm mt-3">{f.text}</p>
            </div>
          ))}
        </div>

        <SectionTitle title="Sizes & Pricing" subtitle="Common sizes shown for reference—custom dimensions available." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { size: "S", dim: "90×65×30 mm", from: 5.9 },
            { size: "M", dim: "120×80×40 mm", from: 7.9 },
            { size: "L", dim: "160×100×50 mm", from: 9.9 },
          ].map((b) => (
            <div key={b.size} className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 flex items-center justify-between">
              <div>
                <div className="text-white font-semibold text-lg">{b.size}</div>
                <div className="text-zinc-400 text-sm">{b.dim}</div>
              </div>
              <div className="text-white text-sm"><span className="text-zinc-400">from</span> ${b.from.toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div id="gallery" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-zinc-900">
              <img alt="Card box" src={`https://picsum.photos/seed/box${i}/800/600`} className="w-full h-full object-cover"/>
            </div>
          ))}
        </div>

        <div id="quote" className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-white font-semibold">Ready to design your box?</div>
            <div className="text-zinc-400 text-sm">Send us your idea and we'll reply with a quote.</div>
          </div>
          <button onClick={()=>onInquiry({ name: "Custom Card Box" })} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-white text-black text-sm font-semibold">Request quote <Send className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  );
}

function HomePage({ onExplore, onBoxes, onInquiry, onTagClick }) {
  return (
    <div className="pb-20">
      <Hero
        title="Welcome to our 3D Figures Store"
        subtitle="Discover our collection of premium 3D printed figures and accessories."
        primary={<button onClick={onExplore} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-white text-black text-sm font-semibold">Explore models <ChevronRight className="w-4 h-4"/></button>}
        secondary={<button onClick={onBoxes} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-white/30 text-white/90 text-sm hover:bg-white/10">Card boxes</button>}
      />

      <HighlightsStrip onTagClick={onTagClick} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <SectionTitle title="Featured 3D Models" subtitle="Experience our latest creations from every angle." action={
          <button onClick={onExplore} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-white/20 text-white/90 text-sm hover:bg-white/10">Explore models</button>
        }/>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRODUCTS.slice(0,3).map(p => (
            <ProductCard key={p.id} product={p} onInquiry={onInquiry} />
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-zinc-900/60 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-white font-semibold">How to order</div>
            <p className="text-zinc-400 text-sm">DM us on Instagram or send an email—include the product name and size. We'll confirm price and lead time.</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-white text-black text-sm font-semibold" aria-label="Instagram">Instagram <ExternalLink className="w-4 h-4"/></a>
            <a href="#" className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-white/20 text-white/90 text-sm hover:bg-white/10" aria-label="Email">Email us</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function InquiryModal({ open, onClose, product }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");

  useEffect(()=>{
    if (product) setMessage(`Hi! I'm interested in ${product.name}. Could you send me price and lead time?`);
  }, [product]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-white font-semibold">Request a quote</div>
          <button onClick={onClose}><X className="w-5 h-5"/></button>
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm text-zinc-300">Name</span>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="mt-1 w-full bg-zinc-900/70 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"/>
          </label>
          <label className="block">
            <span className="text-sm text-zinc-300">Contact (email or IG)</span>
            <input value={contact} onChange={(e)=>setContact(e.target.value)} className="mt-1 w-full bg-zinc-900/70 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"/>
          </label>
          <label className="block">
            <span className="text-sm text-zinc-300">Message</span>
            <textarea value={message} onChange={(e)=>setMessage(e.target.value)} rows={4} className="mt-1 w-full bg-zinc-900/70 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-white/30"/>
          </label>
          <button onClick={()=>{ onClose(); alert("Submitted! (Hook up to your endpoint/IG link)"); }} className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 bg-white text-black text-sm font-semibold">Send inquiry <Send className="w-4 h-4"/></button>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-semibold text-white">About</div>
          <p className="text-zinc-400 mt-2">We craft premium 3D figures and custom card boxes. Made with care, shipped worldwide.</p>
        </div>
        <div>
          <div className="font-semibold text-white">Contact</div>
          <ul className="text-zinc-400 mt-2 space-y-1">
            <li><a href="#" className="hover:text-white">Instagram</a></li>
            <li><a href="#" className="hover:text-white">YouTube</a></li>
            <li><a href="#" className="hover:text-white">Email</a></li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-white">Commissions</div>
          <p className="text-zinc-400 mt-2">Custom poses, scales, and paint jobs available on request.</p>
        </div>
        <div>
          <div className="font-semibold text-white">Notes</div>
          <p className="text-zinc-400 mt-2">Prices on request. Production times vary. Render/Prototype badges indicate visualization stages.</p>
        </div>
      </div>
      <div className="py-6 text-center text-xs text-zinc-500">© {new Date().getFullYear()} Your Brand</div>
    </footer>
  );
}

export default function ShowcaseApp() {
  const [page, setPage] = useState("home");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [productsTag, setProductsTag] = useState("All");

  const openInquiry = (product) => {
    setSelected(product);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-200">
      <Header
        current={page}
        onNav={(p)=>setPage(p)}
        onOpenMenu={()=>setMobileOpen(true)}
      />
      <MobileMenu open={mobileOpen} onClose={()=>setMobileOpen(false)} onNav={(p)=>setPage(p)} />

      {page === "home" && (
        <HomePage
          onExplore={() => setPage("products")}
          onBoxes={() => setPage("boxes")}
          onInquiry={openInquiry}
          onTagClick={(t)=>{ setProductsTag(t); setPage("products"); }}
        />
      )}

      {page === "products" && (
        <>
          <Hero
            title="Collector Figures Gallery"
            subtitle="Premium resin statues and collectibles rendered in full 3D detail."
            primary={<button onClick={()=>setPage("boxes")} className="inline-flex items-center gap-2 rounded-xl px-4 py-2 border border-white/30 text-white/90 text-sm hover:bg-white/10">Card boxes</button>}
            secondary={<span />}
          />
          <div className="bg-[#a11616]">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
              <div className="text-white/90 text-sm">All products</div>
              <div className="text-white/90 text-sm">1–{PRODUCTS.length} items</div>
            </div>
          </div>
          <ProductsPage onInquiry={openInquiry} initialTag={productsTag} />
        </>
      )}

      {page === "boxes" && (
        <BoxesPage onInquiry={openInquiry} />
      )}

      <Footer />

      <InquiryModal open={modalOpen} onClose={()=>setModalOpen(false)} product={selected} />
    </div>
  );
}

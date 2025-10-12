import React, { useMemo, useState, useEffect } from 'react';
import {
  Instagram,
  Youtube,
  Mail,
  Menu,
  X,
  ChevronRight,
  Filter,
  Search,
  ShoppingCart,
  Boxes,
  Package,
  Phone,
  Languages,
  Palette,
  Sparkles,
  Box,
  ExternalLink,
  Send,
} from 'lucide-react';
import useProducts from './hooks/useProducts';
import { getMediaBlob } from './Services/mediaCache';
import InquiryModal from './Components/InquiryModal';

// Static sample data used for the showcase layout.
const HIGHLIGHT_TAGS = [
  { id: 'new', label: 'New', color: 'bg-emerald-500' },
  { id: 'hand', label: 'Hand-Painted', color: 'bg-indigo-500' },
  { id: 'resin', label: 'Resin', color: 'bg-rose-500' },
  { id: 'stl', label: 'STL', color: 'bg-amber-500' },
];

const ALL_TAGS = ['All', 'Resin', 'Painted', 'STL', 'Anime', 'Game', 'Original'];

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Ahri',
    price: 10.0,
    tags: ['Resin', 'Anime'],
    image:
      'https://images.unsplash.com/photo-1606112219348-204d7d8b94ee?q=80&w=1200&auto=format&fit=crop',
    badge: 'Render',
  },
  {
    id: 2,
    name: 'Asasasasas',
    price: 123.123,
    tags: ['STL', 'Game'],
    image:
      'https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=1200&auto=format&fit=crop',
    badge: 'Prototype',
  },
  {
    id: 3,
    name: 'Tifa',
    price: 35.0,
    tags: ['Painted', 'Game'],
    image:
      'https://images.unsplash.com/photo-1582582621959-48a34f2b2a15?q=80&w=1200&auto=format&fit=crop',
    badge: 'Photo',
  },
  {
    id: 4,
    name: 'Original Knight',
    price: 49.0,
    tags: ['Original', 'Resin'],
    image:
      'https://images.unsplash.com/photo-1520975922203-b89c56d0e6c1?q=80&w=1200&auto=format&fit=crop',
    badge: 'Render',
  },
];

const BOX_FEATURES = [
  {
    icon: <Box className="w-6 h-6" />,
    title: 'Sturdy Board',
    text: 'Premium 1.5mm chipboard with matte lamination for durability.',
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: 'Custom Print',
    text: 'Edge-to-edge CMYK artwork with spot UV or foil options.',
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: 'Magnetic Lid',
    text: 'Satisfying snap-shut closure; foam insert available.',
  },
];

const FALLBACK_IMAGE = '/placeholder.jpg';

function normalizeProduct(raw) {
  if (!raw) return null;
  const priceValue = Number(raw.discounted_price ?? raw.price ?? 0);
  const productType = raw.product_type || raw.type;
  const mediaList = Array.isArray(raw.media) ? raw.media : [];
  const baseImage =
    raw.image ||
    raw.image_url ||
    raw.cover_image ||
    raw.thumbnail_url ||
    raw.preview_image ||
    null;
  const tags = new Set();
  if (Array.isArray(raw.tags)) {
    raw.tags.forEach((tag) => typeof tag === 'string' && tags.add(tag));
  }
  if (Array.isArray(raw.categories)) {
    raw.categories.forEach((cat) => {
      if (typeof cat === 'string') tags.add(cat);
      if (cat && typeof cat.name === 'string') tags.add(cat.name);
    });
  }
  if (typeof raw.category === 'string') tags.add(raw.category);
  if (raw.category && typeof raw.category.name === 'string') tags.add(raw.category.name);
  if (typeof raw.series === 'string') tags.add(raw.series);
  if (typeof productType === 'string') tags.add(productType.toUpperCase());

  return {
    id: raw.id ?? raw.slug ?? raw.name ?? `product-${Math.random().toString(36).slice(2)}`,
    name: raw.name ?? 'Untitled Product',
    price: Number.isFinite(priceValue) ? priceValue : 0,
    tags: tags.size ? Array.from(tags) : ['All'],
    badge:
      typeof raw.badge === 'string'
        ? raw.badge
        : typeof productType === 'string'
        ? productType === '3d'
          ? 'Render'
          : productType === 'card'
          ? 'Prototype'
          : productType
        : 'Featured',
    media: mediaList,
    image: baseImage,
    currency: raw.currency || 'USD',
    raw,
  };
}

function useProductImage(product) {
  const fallback =
    product?.image ||
    product?.image_url ||
    product?.cover_image ||
    product?.thumbnail_url ||
    FALLBACK_IMAGE;
  const [imageUrl, setImageUrl] = useState(fallback);

  useEffect(() => {
    setImageUrl(fallback || FALLBACK_IMAGE);
  }, [fallback]);

  useEffect(() => {
    const mediaList = Array.isArray(product?.media) ? product.media : [];
    if (!mediaList.length) {
      return () => {};
    }
    const imageMedia = mediaList.find((m) => (m.kind || m.media_type) === 'image');
    if (!imageMedia || !imageMedia.id) {
      return () => {};
    }
    let active = true;
    let objectUrl = null;
    getMediaBlob(imageMedia.id)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setImageUrl((prev) => {
          if (prev && prev !== FALLBACK_IMAGE && prev !== fallback && prev.startsWith('blob:')) {
            URL.revokeObjectURL(prev);
          }
          return objectUrl;
        });
      })
      .catch(() => {
        if (active) {
          setImageUrl((prev) => prev || fallback || FALLBACK_IMAGE);
        }
      });

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [product, fallback]);

  return imageUrl || FALLBACK_IMAGE;
}

function formatCurrency(value, currency = 'USD') {
  const amount = Number(value ?? 0);
  const safeCurrency = typeof currency === 'string' && currency.length === 3 ? currency : 'USD';
  if (!Number.isFinite(amount)) {
    return '$0.00';
  }
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: safeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (err) {
    return `$${amount.toFixed(2)}`;
  }
}

function classNames(...xs) {
  return xs.filter(Boolean).join(' ');
}

function Header({ onNav, current, onOpenMenu }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/70 border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="font-bold tracking-[0.2em] text-white">YOURLOGO</div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {[
              { key: 'home', label: 'Home' },
              { key: 'products', label: 'Products' },
              { key: 'boxes', label: 'Card Boxes' },
              { key: 'about', label: 'About' },
              { key: 'contact', label: 'Contact' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => onNav(item.key)}
                className={classNames(
                  'text-zinc-300 hover:text-white transition',
                  current === item.key && 'text-white'
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <a
            aria-label="Instagram"
            href="https://instagram.com/yourstudio"
            className="text-zinc-300 hover:text-white"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            aria-label="YouTube"
            href="https://youtube.com/@yourstudio"
            className="text-zinc-300 hover:text-white"
          >
            <Youtube className="w-5 h-5" />
          </a>
          <a
            aria-label="Email"
            href="mailto:hello@yourstudio.art"
            className="text-zinc-300 hover:text-white"
          >
            <Mail className="w-5 h-5" />
          </a>
          <button onClick={onOpenMenu} className="md:hidden text-zinc-300 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}

function MobileMenu({ open, onClose, onNav }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70 backdrop-blur" onClick={onClose} />
      <div className="absolute inset-x-0 top-0 bg-zinc-950 border-b border-white/10 p-6 space-y-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="font-semibold tracking-[0.24em] uppercase text-white">YourLogo</div>
          <button
            type="button"
            className="text-zinc-300 hover:text-white"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="space-y-4 text-sm text-white/80">
          {[
            { key: 'home', label: 'Home' },
            { key: 'products', label: 'Products' },
            { key: 'boxes', label: 'Card Boxes' },
            { key: 'about', label: 'About' },
            { key: 'contact', label: 'Contact' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                onNav(item.key);
                onClose();
              }}
              className="flex items-center justify-between w-full py-2"
            >
              <span>{item.label}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

function Hero({ title, subtitle, primary, secondary }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#52141b] to-[#a11f2b] text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-2xl">
          <p className="text-xs tracking-[0.32em] uppercase text-white/70">Collector spotlight</p>
          <h1 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[0.18em] uppercase">
            {title}
          </h1>
          <p className="mt-6 text-base md:text-lg text-white/80 tracking-wide uppercase">
            {subtitle}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-xs tracking-[0.2em] uppercase text-white/90">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-xs tracking-[0.2em] uppercase text-white/90">
              <Search className="w-4 h-4" />
              Search
            </button>
            {primary}
            {secondary}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, onInquiry }) {
  const imageUrl = useProductImage(product);
  const priceLabel = useMemo(
    () => formatCurrency(product?.price, product?.currency),
    [product?.price, product?.currency]
  );
  const productTags = Array.isArray(product?.tags) ? product.tags : [];
  const inquiryPayload = product?.raw || product;

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/10">
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={imageUrl}
          alt={product?.name ?? 'Product preview'}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 inline-flex rounded-full bg-black/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.28em] text-white">
          {product?.badge ?? 'Featured'}
        </span>
      </div>
      <div className="space-y-4 px-5 pb-6 pt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-[0.22em] text-white">
            {product?.name ?? 'Product'}
          </h3>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-white/80">
            {priceLabel}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {productTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.26em] text-white/70"
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onInquiry(inquiryPayload)}
          className="inline-flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[0.65rem] uppercase tracking-[0.28em] text-white transition hover:border-white/40 hover:bg-white/10"
        >
          Request quote
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function HighlightCard({ product, onInquiry }) {
  const imageUrl = useProductImage(product);
  const priceLabel = useMemo(
    () => formatCurrency(product?.price, product?.currency),
    [product?.price, product?.currency]
  );
  const inquiryPayload = product?.raw || product;

  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur transition hover:border-white/30 hover:bg-white/10">
      <img
        src={imageUrl}
        alt={product?.name ?? 'Product highlight'}
        className="h-72 w-full object-cover"
      />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm uppercase tracking-[0.26em] text-white">
            {product?.name ?? 'Product'}
          </h3>
          <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-white/70">
            {priceLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onInquiry(inquiryPayload)}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-[0.65rem] uppercase tracking-[0.26em] text-white/70 hover:border-white/50 hover:text-white"
        >
          Request info <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
}

function ProductsPage({ onInquiry, initialTag, products, loading }) {
  const [tag, setTag] = useState(initialTag || 'All');

  useEffect(() => {
    if (initialTag) {
      setTag(initialTag);
    }
  }, [initialTag]);

  const availableTags = useMemo(() => {
    const registry = new Set(ALL_TAGS);
    (products || []).forEach((product) => {
      const tags = Array.isArray(product?.tags) ? product.tags : [];
      tags.forEach((item) => {
        if (typeof item === 'string' && item.trim()) {
          registry.add(item);
        }
      });
    });
    return Array.from(registry);
  }, [products]);

  useEffect(() => {
    if (!availableTags.includes(tag)) {
      setTag('All');
    }
  }, [availableTags, tag]);

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    if (tag === 'All') return products;
    const needle = tag.toLowerCase();
    return products.filter((product) =>
      (product?.tags || []).some((t) => typeof t === 'string' && t.toLowerCase() === needle)
    );
  }, [products, tag]);

  const isLoading = loading && (!products || !products.length);
  const visibleProducts = filteredProducts.length ? filteredProducts : products || [];
  const showEmptyState = !isLoading && !visibleProducts.length;

  return (
    <section className="bg-[#0a0a0a] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            {availableTags.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTag(item)}
                className={classNames(
                  'inline-flex items-center rounded-full px-4 py-2 text-xs uppercase tracking-[0.28em] transition',
                  tag === item
                    ? 'bg-white text-black'
                    : 'border border-white/20 bg-white/5 text-white/70 hover:border-white/40 hover:bg-white/10 hover:text-white'
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/60">
            <span>Sort</span>
            <ChevronRight className="w-4 h-4" />
            <span>Featured</span>
          </div>
        </div>

        {isLoading && (
          <div className="py-12 text-center text-sm uppercase tracking-[0.28em] text-white/60">
            Loading products…
          </div>
        )}

        {showEmptyState && (
          <div className="py-12 text-center text-sm uppercase tracking-[0.28em] text-white/60">
            No products available yet.
          </div>
        )}

        {!isLoading && visibleProducts.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} onInquiry={onInquiry} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function HomePage({ onExplore, onBoxes, onInquiry, onTagClick, products, loading }) {
  const highlights = useMemo(() => (products || []).slice(0, 3), [products]);
  return (
    <div className="bg-[#0a0a0a] text-zinc-200">
      <Hero
        title="Collector Figures Gallery"
        subtitle="Premium resin statues and collectibles rendered in full 3D detail."
        primary={
          <button
            type="button"
            onClick={onExplore}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs uppercase tracking-[0.28em] text-black"
          >
            Explore figures <ChevronRight className="w-4 h-4" />
          </button>
        }
        secondary={
          <button
            type="button"
            onClick={onBoxes}
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/85"
          >
            Card boxes <Boxes className="w-4 h-4" />
          </button>
        }
      />

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-white/60">Highlight reels</p>
            <h2 className="mt-2 text-2xl font-semibold uppercase tracking-[0.18em] text-white">
              Featured 3D Models
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {HIGHLIGHT_TAGS.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => onTagClick(tag.label)}
                className={classNames(
                  'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[0.65rem] uppercase tracking-[0.28em] text-white shadow-sm transition',
                  tag.color
                )}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {loading && !highlights.length && (
            <div className="col-span-full py-10 text-center text-sm uppercase tracking-[0.28em] text-white/60">
              Loading highlights…
            </div>
          )}
          {!loading &&
            highlights.map((product) => (
              <HighlightCard key={product.id} product={product} onInquiry={onInquiry} />
            ))}
          {!loading && !highlights.length && (
            <div className="col-span-full py-10 text-center text-sm uppercase tracking-[0.28em] text-white/60">
              Highlights coming soon.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function BoxesPage({ onInquiry }) {
  return (
    <section className="bg-[#0a0a0a] py-16 text-zinc-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <header className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-white/60">Packaging studio</p>
            <h2 className="mt-2 text-2xl font-semibold uppercase tracking-[0.2em] text-white">
              Custom Card Boxes
            </h2>
            <p className="mt-3 max-w-2xl text-sm uppercase tracking-[0.18em] text-white/60">
              Magnetic rigid boxes, foil stamping, foam inserts, and presentation-ready unboxing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onInquiry(null)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs uppercase tracking-[0.28em] text-black"
          >
            Request a sample <Send className="w-4 h-4" />
          </button>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1523475472560-d2df97ec485c?q=80&w=1200&auto=format&fit=crop"
              alt="Custom card box"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-8">
            {BOX_FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4 rounded-2xl bg-white/5 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-[0.26em] text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/70">{feature.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-8 lg:grid-cols-3">
          {[
            { icon: <Phone className="w-5 h-5" />, text: 'WhatsApp/Telegram for quickest replies.' },
            { icon: <Languages className="w-5 h-5" />, text: 'English, Spanish, Japanese friendly.' },
            { icon: <Palette className="w-5 h-5" />, text: 'Batch painting available upon request.' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 text-sm text-white/70">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                {item.icon}
              </div>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutPage() {
  return (
    <section className="bg-[#0a0a0a] py-16 text-zinc-200">
      <div className="mx-auto max-w-5xl px-4 space-y-8">
        <h2 className="text-2xl uppercase tracking-[0.2em] text-white">About the Studio</h2>
        <p className="text-sm uppercase tracking-[0.18em] text-white/70">
          We produce limited runs of resin figures, hand-painted statues, and bespoke packaging for
          collectors worldwide. Every piece is handled from sculpt to paint to shipping with craft
          precision.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              title: '3D Sculpting',
              text: 'Original sculpts or fan-resin conversions prepared in ZBrush and Blender.',
            },
            {
              title: 'Casting & Painting',
              text: 'Silicone molds, pressure cast resin, primed, and painted with archival pigments.',
            },
            {
              title: 'Engineering',
              text: 'Multiple pose options, magnetized swappable parts, and flight-stand solutions.',
            },
            {
              title: 'Packaging',
              text: 'Full presentation including cards, COA, and magnetic rigid boxes.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-sm uppercase tracking-[0.24em] text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-white/70">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactPage({ onInquiry }) {
  return (
    <section className="bg-[#0a0a0a] py-16 text-zinc-200">
      <div className="mx-auto max-w-4xl px-4 space-y-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-white/60">Contact</p>
            <h2 className="mt-2 text-2xl uppercase tracking-[0.2em] text-white">Request a Quote</h2>
          </div>
          <button
            type="button"
            onClick={() => onInquiry(null)}
            className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs uppercase tracking-[0.3em] text-black"
          >
            Message studio <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {[
            { icon: <Mail className="w-5 h-5" />, label: 'Email', value: 'hello@yourstudio.art' },
            { icon: <Instagram className="w-5 h-5" />, label: 'Instagram', value: '@yourstudio' },
            { icon: <Phone className="w-5 h-5" />, label: 'WhatsApp', value: '+00 123 456 789' },
            { icon: <Youtube className="w-5 h-5" />, label: 'YouTube', value: 'Studio reveals weekly' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 rounded-2xl bg-white/5 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                {item.icon}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">{item.label}</p>
                <p className="text-sm uppercase tracking-[0.2em] text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h3 className="text-sm uppercase tracking-[0.26em] text-white">Frequently Asked</h3>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            <li>Average production time: 6-8 weeks.</li>
            <li>Paint commissions limited to 2 slots per month.</li>
            <li>Worldwide shipping with insured courier.</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#050505] text-sm text-zinc-400">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 sm:px-6 lg:px-8">
        <div>
          <div className="font-semibold text-white">About</div>
          <p className="mt-2 text-zinc-400">
            We craft premium 3D figures and custom card boxes. Made with care, shipped worldwide.
          </p>
        </div>
        <div>
          <div className="font-semibold text-white">Contact</div>
          <ul className="mt-2 space-y-1 text-zinc-400">
            <li>
              <a href="https://instagram.com/yourstudio" className="hover:text-white">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://youtube.com/@yourstudio" className="hover:text-white">
                YouTube
              </a>
            </li>
            <li>
              <a href="mailto:hello@yourstudio.art" className="hover:text-white">
                Email
              </a>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold text-white">Commissions</div>
          <p className="mt-2 text-zinc-400">
            Custom poses, scales, and paint jobs available on request.
          </p>
        </div>
        <div>
          <div className="font-semibold text-white">Notes</div>
          <p className="mt-2 text-zinc-400">
            Prices on request. Production times vary. Render/Prototype badges indicate visualization
            stages.
          </p>
        </div>
      </div>
      <div className="py-6 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} Your Brand
      </div>
    </footer>
  );
}

export default function ShowcaseApp() {
  const [page, setPage] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productsTag, setProductsTag] = useState('All');
  const {
    data: fetchedProducts,
    loading: loadingProducts,
    error: productsError,
  } = useProducts({ limit: 48 });

  const fallbackProducts = useMemo(
    () => MOCK_PRODUCTS.map((item) => normalizeProduct(item)).filter(Boolean),
    []
  );

  const liveProducts = useMemo(() => {
    if (!Array.isArray(fetchedProducts)) return [];
    return fetchedProducts.map((item) => normalizeProduct(item)).filter(Boolean);
  }, [fetchedProducts]);

  const products = liveProducts.length > 0 ? liveProducts : fallbackProducts;
  const showcaseLoading = loadingProducts && liveProducts.length === 0;
  const showcaseError = productsError && liveProducts.length === 0;

  const openInquiry = (product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => document.documentElement.classList.remove('dark');
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-200">
      <Header current={page} onNav={setPage} onOpenMenu={() => setMobileOpen(true)} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} onNav={setPage} />

      {page === 'home' && (
        <HomePage
          onExplore={() => setPage('products')}
          onBoxes={() => setPage('boxes')}
          onInquiry={openInquiry}
          onTagClick={(tag) => {
            setProductsTag(tag);
            setPage('products');
          }}
          products={products}
          loading={showcaseLoading}
        />
      )}

      {page === 'products' && (
        <div className="bg-[#050505]">
          <Hero
            title="Collector Figures Gallery"
            subtitle="Premium resin statues and collectibles rendered in full 3D detail."
            primary={
              <button
                type="button"
                onClick={() => setPage('boxes')}
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/85"
              >
                Card boxes
                <Boxes className="w-4 h-4" />
              </button>
            }
            secondary={<span />}
          />
          <ProductsPage
            onInquiry={openInquiry}
            initialTag={productsTag}
            products={products}
            loading={showcaseLoading}
          />
          {showcaseError && (
            <p className="px-4 pb-8 text-center text-xs uppercase tracking-[0.3em] text-red-300">
              Unable to load live products. Showing demo data.
            </p>
          )}
        </div>
      )}

      {page === 'boxes' && <BoxesPage onInquiry={openInquiry} />}
      {page === 'about' && <AboutPage />}
      {page === 'contact' && <ContactPage onInquiry={openInquiry} />}

      <Footer />
      <InquiryModal open={modalOpen} onClose={() => setModalOpen(false)} product={selectedProduct} />
    </div>
  );
}









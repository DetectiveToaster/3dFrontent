// src/pages/ProductDetailPage.js

import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import api from '../Services/api';
import { getMediaBlob } from '../Services/mediaCache';
import ThreeDViewer from '../Components/ThreeDViewer';
import ImageCarousel from '../Components/ImageCarousel';
import InquiryModal from '../Components/InquiryModal';
import '../styles/ProductDetailPage.css';
import ClipLoader from 'react-spinners/ClipLoader';
import { useLanguage } from '../context/LanguageContext';
import { sortMediaList } from '../utils/media';

const DEFAULT_DESCRIPTION = 'Message us to customise paint finishes, scale, and presentation packaging.';
const INFO_TILES = [
  {
    title: 'Hand finished',
    body: 'Layered shading, gloss accents, and sealed protection on every piece.',
  },
  {
    title: 'Secure shipping',
    body: 'Foam-packed, tracked, and insured delivery to collectors worldwide.',
  },
  {
    title: 'Limited runs',
    body: 'Numbered releases supplied with certificates of authenticity.',
  },
];

function formatCurrencyValue(product) {
  if (!product) return '$0.00';
  const value = Number(product.discounted_price ?? product.price ?? 0);
  const currency = typeof product.currency === 'string' ? product.currency : 'USD';
  if (!Number.isFinite(value)) return '$0.00';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch (err) {
    return `$${value.toFixed(2)}`;
  }
}

function buildSpecs(product, t) {
  if (!product) return [];
  const specs = [];
  if (product.height != null) specs.push({ label: t('height'), value: `${product.height} cm` });
  if (product.length != null) specs.push({ label: t('length'), value: `${product.length} cm` });
  if (product.width != null) specs.push({ label: t('width'), value: `${product.width} cm` });
  if (product.series) specs.push({ label: 'Series', value: product.series });
  if (product.rarity) specs.push({ label: 'Rarity', value: product.rarity });
  if (product.condition) specs.push({ label: 'Condition', value: product.condition });
  if (product.page_count != null) specs.push({ label: 'Pages', value: product.page_count });
  if (product.language) specs.push({ label: 'Language', value: product.language });
  if (product.format) specs.push({ label: 'Format', value: product.format });
  return specs;
}

const HERO_FALLBACK_BADGES = ['Collector Series', 'Limited Run', 'Premium Resin'];

function ProductDetailPage() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [modelUrl, setModelUrl] = useState(null);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  useEffect(() => {
    return () => {
      images.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  useEffect(() => {
    if (!modelUrl) return undefined;
    return () => {
      URL.revokeObjectURL(modelUrl);
    };
  }, [modelUrl]);

  useEffect(() => {
    let mounted = true;
    let createdImages = [];
    let createdModelUrl = null;

    async function loadProduct() {
      setLoading(true);
      try {
        const response = await api.get(`/products/${id}`);
        if (!mounted) return;
        const data = response.data;
        const mediaList = sortMediaList(Array.isArray(data.media) ? data.media : []);

        for (const media of mediaList) {
          const kind = media.kind || media.media_type;
          if (kind === 'image') {
            try {
              const blob = await getMediaBlob(media.id);
              const objectUrl = URL.createObjectURL(blob);
              if (!mounted) {
                URL.revokeObjectURL(objectUrl);
                continue;
              }
              createdImages.push(objectUrl);
            } catch (err) {
              console.warn('ProductDetailPage: failed to load image', media?.id, err);
            }
          }
          if (kind === 'model' && !createdModelUrl) {
            try {
              const blob = await getMediaBlob(media.id);
              const objectUrl = URL.createObjectURL(blob);
              if (!mounted) {
                URL.revokeObjectURL(objectUrl);
              } else {
                createdModelUrl = objectUrl;
              }
            } catch (err) {
              console.warn('ProductDetailPage: failed to load model', media?.id, err);
            }
          }
        }

        if (!mounted) {
          createdImages.forEach((url) => URL.revokeObjectURL(url));
          if (createdModelUrl) URL.revokeObjectURL(createdModelUrl);
          return;
        }

        setProduct(data);
        setImages(createdImages);
        setModelUrl(createdModelUrl);
      } catch (error) {
        if (mounted) console.error('Error fetching product:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      mounted = false;
      createdImages.forEach((url) => URL.revokeObjectURL(url));
      if (createdModelUrl) URL.revokeObjectURL(createdModelUrl);
    };
  }, [id]);

  // Register a product view once per session/id with a small debounce
  useEffect(() => {
    if (!id) return;
    const key = `viewed_product_${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch (_) {
      // sessionStorage may be unavailable; best-effort only
    }
    const timer = setTimeout(() => {
      api.post(`/products/${id}/view`).catch(() => {});
      try {
        sessionStorage.setItem(key, '1');
      } catch (_) {
        /* ignore */
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [id]);

  const specs = useMemo(() => buildSpecs(product, t), [product, t]);
  const heroBadges = useMemo(() => {
    const badges = new Set();
    const typeLabel = product?.product_type || product?.type;
    if (typeLabel) badges.add(String(typeLabel).toUpperCase());
    if (product?.series) badges.add(product.series);
    if (product?.category?.name) badges.add(product.category.name);
    if (product?.rarity) badges.add(product.rarity);
    (Array.isArray(product?.tags) ? product.tags : []).forEach((tag) => {
      if (typeof tag === 'string' && tag.trim()) badges.add(tag.trim());
    });
    const list = Array.from(badges);
    return list.length ? list.slice(0, 4) : HERO_FALLBACK_BADGES;
  }, [product]);
  const priceLabel = formatCurrencyValue(product);
  const description = product?.description || DEFAULT_DESCRIPTION;

  if (loading) {
    return (
      <div className="product-detail-page detail-loading">
        <ClipLoader size={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page detail-loading">
        <p className="detail-empty">Product unavailable.</p>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <Helmet>
        <title>{`${product.name} - 3D Figures Store`}</title>
        <meta
          name="description"
          content={`Explore ${product.name} in full detail and request a personalised quote.`}
        />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <section className="detail-hero">
        <div className="detail-hero__badges" aria-hidden={!heroBadges.length}>
          {heroBadges.map((badge) => (
            <span key={badge}>{badge}</span>
          ))}
        </div>
        <div className="detail-grid">
          <div className="detail-gallery">
            {images.length > 0 && (
              <div className="detail-card detail-card--carousel">
                <ImageCarousel images={images} altPrefix={product.name} />
              </div>
            )}
            {modelUrl && (
              <div className="detail-card detail-card--viewer">
                <ThreeDViewer
                  modelUrl={modelUrl}
                  height="min(55vh, 520px)"
                  style={{ width: '100%' }}
                  alt={`3D model of ${product.name}`}
                />
              </div>
            )}
            {!images.length && !modelUrl && (
              <div className="detail-card detail-card--empty">
                <p>No media available yet. Reach out for renders and preview shots.</p>
              </div>
            )}
          </div>
          <aside className="detail-panel">
            <span className="detail-panel__eyebrow">Collector spotlight</span>
            <h1>{product.name}</h1>
            <p className="detail-panel__price">{priceLabel}</p>
            <p className="detail-panel__description">{description}</p>
            {specs.length > 0 && (
              <ul className="detail-specs">
                {specs.map(({ label, value }) => (
                  <li key={label}>
                    <span>{label}</span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="detail-actions">
              <button
                type="button"
                className="detail-cta detail-cta--primary"
                onClick={() => setInquiryOpen(true)}
              >
                Request a quote
              </button>
              <a
                className="detail-cta detail-cta--ghost"
                href="https://instagram.com/yourstudio"
                target="_blank"
                rel="noopener noreferrer"
              >
                Message on Instagram
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section className="detail-info">
        <div className="detail-info__grid">
          {INFO_TILES.map((tile) => (
            <article key={tile.title} className="detail-info__card">
              <h3>{tile.title}</h3>
              <p>{tile.body}</p>
            </article>
          ))}
        </div>
      </section>

      <InquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} product={product} />
    </div>
  );
}

export default ProductDetailPage;

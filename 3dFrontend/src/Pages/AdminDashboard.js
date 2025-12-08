import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  create3DProduct,
  createCardProduct,
  createManualProduct,
  listProductMedia,
  deleteProductMedia,
  getAllProducts,
  setProductVisibility,
  updateProductPrice,
  applyProductDiscount,
  createUploadSession,
  uploadFileToSession,
  listUploadSessionFiles,
  attachUploadToProduct,
} from '../Services/products';
import '../styles/Admin.css';

function AdminDashboard() {
  const [type, setType] = useState('3d');
  const [productForm, setProductForm] = useState({
    name: '', quantity: 1, price: 0,
    discount: '', discounted_price: '',
    is_visible: true,
    status: 'published',
    height: '', length: '', width: '', // 3d
    series: '', rarity: '', condition: '', // card
    page_count: '', language: '', format: '', // manual
  });
  const [createdProduct, setCreatedProduct] = useState(null);

  const [mediaProductId, setMediaProductId] = useState('');
  const [mediaList, setMediaList] = useState([]);
  const [uploadSession, setUploadSession] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [sessionFiles, setSessionFiles] = useState([]);
  const [fileMappings, setFileMappings] = useState({});

  const [adminProducts, setAdminProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [filterVisibility, setFilterVisibility] = useState('all'); // all|visible|hidden
  const [search, setSearch] = useState('');

  useEffect(() => {
    refreshProducts();
    // eslint-disable-next-line
  }, []);

  const refreshProducts = async () => {
    try {
      setLoadingProducts(true);
      const data = await getAllProducts({ limit: 50 });
      setAdminProducts(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };

  const submitProduct = async (e) => {
    e.preventDefault();
    try {
      let data;
      const common = {
        name: productForm.name,
        quantity: Number(productForm.quantity || 0),
        price: Number(productForm.price || 0),
        discount: productForm.discount === '' ? undefined : Number(productForm.discount),
        discounted_price: productForm.discounted_price === '' ? undefined : Number(productForm.discounted_price),
        is_visible: !!productForm.is_visible,
        status: productForm.status || 'published',
      };
      if (type === '3d') {
        data = await create3DProduct({
          ...common,
          height: productForm.height === '' ? undefined : Number(productForm.height),
          length: productForm.length === '' ? undefined : Number(productForm.length),
          width: productForm.width === '' ? undefined : Number(productForm.width),
        });
      } else if (type === 'card') {
        data = await createCardProduct({
          ...common,
          series: productForm.series || undefined,
          rarity: productForm.rarity || undefined,
          condition: productForm.condition || undefined,
        });
      } else {
        data = await createManualProduct({
          ...common,
          page_count: productForm.page_count === '' ? undefined : Number(productForm.page_count),
          language: productForm.language || undefined,
          format: productForm.format || undefined,
        });
      }
      setCreatedProduct(data);
      toast.success(`Created product #${data.id}`);
      await refreshProducts();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create product');
    }
  };

  const fetchMedia = async () => {
    try {
      const pid = Number(mediaProductId || (createdProduct && createdProduct.id));
      if (!pid) { toast.warn('Provide product ID'); return; }
      const list = await listProductMedia(pid);
      setMediaList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch media');
    }
  };

  const removeMedia = async (mediaId) => {
    const id = Number(mediaId);
    if (!id) { toast.warn('Missing media id'); return; }
    try {
      await deleteProductMedia(id);
      setMediaList(prev => prev.filter(item => item.id !== id));
      toast.success(`Removed media #${id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove media');
    }
  };


  const toggleVisibility = async (p) => {
    try {
      const next = !p.is_visible;
      await setProductVisibility(p.id, next);
      toast.success(`${next ? 'Shown' : 'Hidden'} product #${p.id}`);
      await refreshProducts();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update visibility');
    }
  };

  const savePrice = async (p, price) => {
    try {
      await updateProductPrice(p.id, price);
      toast.success(`Updated price for #${p.id}`);
      await refreshProducts();
    } catch (e) {
      console.error(e);
      toast.error('Failed to update price');
    }
  };

  const applyDiscountTo = async (p, mode, value) => {
    try {
      await applyProductDiscount(p.id, mode, value);
      toast.success(`Applied discount to #${p.id}`);
      await refreshProducts();
    } catch (e) {
      console.error(e);
      toast.error('Failed to apply discount');
    }
  };

  const ensureUploadSession = async () => {
    if (uploadSession?.id || uploadSession?.session_id) return uploadSession;
    const session = await createUploadSession();
    setUploadSession(session);
    toast.success(`Upload session created (${session?.id || session?.session_id})`);
    return session;
  };

  const detectKind = (file) => {
    const name = typeof file === 'string' ? file : file?.name || '';
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'glb' || ext === 'gltf') return 'model';
    if (ext === 'pdf') return 'pdf';
    return 'image';
  };

  const normalizeUpload = (res, file) => {
    const upload_id = res?.upload_id || res?.id || res?.file_id;
    return {
      upload_id,
      id: upload_id,
      filename: res?.filename || file?.name || `upload-${upload_id}`,
      kind: res?.kind || res?.media_type || detectKind(file),
      content_type: res?.content_type || file?.type,
      size: res?.size || file?.size,
      role: res?.role,
      sort_order: res?.sort_order,
      product_id: res?.product_id,
    };
  };

  const handleFilesUpload = async (incomingFiles) => {
    const files = Array.from(incomingFiles || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const session = await ensureUploadSession();
      const sessionId = session?.id || session?.session_id;
      const uploads = [];
      for (const f of files) {
        try {
          const res = await uploadFileToSession({ sessionId, file: f, kind: detectKind(f) });
          uploads.push(normalizeUpload(res, f));
        } catch (err) {
          console.error('Upload failed', err);
          toast.error(`Failed to upload ${f?.name || 'file'}`);
        }
      }
      if (uploads.length) {
        setSessionFiles((prev) => {
          const merged = [...prev];
          uploads.forEach((u) => {
            const idx = merged.findIndex((m) => m.upload_id === u.upload_id);
            if (idx >= 0) merged[idx] = { ...merged[idx], ...u };
            else merged.push(u);
          });
          return merged;
        });
        const defaultProductId = Number(mediaProductId || createdProduct?.id || '') || '';
        const mappingUpdates = {};
        uploads.forEach((u) => {
          mappingUpdates[u.upload_id] = {
            product_id: defaultProductId,
            role: u.role || (u.kind === 'image' ? 'gallery' : u.kind === 'model' ? 'model' : 'document'),
            kind: u.kind,
            sort_order: u.sort_order ?? 0,
          };
        });
        setFileMappings((prev) => ({ ...mappingUpdates, ...prev }));
      }
    } finally {
      setUploading(false);
    }
  };

  const refreshSessionFiles = async () => {
    if (!uploadSession) {
      toast.warn('Create an upload session first');
      return;
    }
    try {
      const sessionId = uploadSession?.id || uploadSession?.session_id;
      const res = await listUploadSessionFiles(sessionId);
      const files = Array.isArray(res?.files) ? res.files : Array.isArray(res) ? res : [];
      const normalized = files.map((f) => normalizeUpload(f));
      setSessionFiles(normalized);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load session files');
    }
  };

  const updateMapping = (uploadId, partial) => {
    setFileMappings((prev) => ({
      ...prev,
      [uploadId]: { ...(prev[uploadId] || {}), ...partial },
    }));
  };

  const attachUpload = async (upload) => {
    const mapping = fileMappings[upload.upload_id] || {};
    const pid = Number(mapping.product_id || mediaProductId || createdProduct?.id || '');
    if (!pid) {
      toast.warn('Provide product ID before attaching');
      return;
    }
    try {
      const payload = {
        upload_id: upload.upload_id,
        product_id: pid,
        kind: mapping.kind || upload.kind,
        role: mapping.role,
        sort_order: mapping.sort_order === '' ? null : Number(mapping.sort_order ?? 0),
      };
      const res = await attachUploadToProduct(payload);
      toast.success(`Attached upload #${upload.upload_id} to product #${pid}`);
      if (res?.id) {
        setSessionFiles((prev) => prev.map((f) => (f.upload_id === upload.upload_id ? { ...f, product_id: pid, sort_order: payload.sort_order, role: payload.role } : f)));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to attach upload');
    }
  };

  const TypeFields = useMemo(() => {
    if (type === '3d') {
      return (
        <div className="field-grid">
          <label>Height (cm)
            <input name="height" type="number" step="0.01" value={productForm.height} onChange={onChange} />
          </label>
          <label>Length (cm)
            <input name="length" type="number" step="0.01" value={productForm.length} onChange={onChange} />
          </label>
          <label>Width (cm)
            <input name="width" type="number" step="0.01" value={productForm.width} onChange={onChange} />
          </label>
        </div>
      );
    }
    if (type === 'card') {
      return (
        <div className="field-grid">
          <label>Series
            <input name="series" value={productForm.series} onChange={onChange} />
          </label>
          <label>Rarity
            <input name="rarity" value={productForm.rarity} onChange={onChange} />
          </label>
          <label>Condition
            <input name="condition" value={productForm.condition} onChange={onChange} />
          </label>
        </div>
      );
    }
    return (
      <div className="field-grid">
        <label>Page Count
          <input name="page_count" type="number" value={productForm.page_count} onChange={onChange} />
        </label>
        <label>Language
          <input name="language" value={productForm.language} onChange={onChange} />
        </label>
        <label>Format
          <input name="format" value={productForm.format} onChange={onChange} />
        </label>
      </div>
    );
  }, [type, productForm, onChange]);

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>

      <section className="card">
        <h2>Create Product</h2>
        <form onSubmit={submitProduct} className="form">
          <div className="row">
            <label>Type
              <select value={type} onChange={e => setType(e.target.value)}>
                <option value="3d">3D</option>
                <option value="card">Card</option>
                <option value="manual">Manual</option>
              </select>
            </label>
            <label>Name
              <input name="name" value={productForm.name} onChange={onChange} required />
            </label>
          </div>
          <div className="row">
            <label>Quantity
              <input name="quantity" type="number" value={productForm.quantity} onChange={onChange} required />
            </label>
            <label>Price
              <input name="price" type="number" step="0.01" value={productForm.price} onChange={onChange} required />
            </label>
          </div>
          <div className="row">
            <label>Discount (amount)
              <input name="discount" type="number" step="0.01" value={productForm.discount} onChange={onChange} />
            </label>
            <label>Discounted Price
              <input name="discounted_price" type="number" step="0.01" value={productForm.discounted_price} onChange={onChange} />
            </label>
            <label style={{ alignItems: 'center', display: 'flex', gap: '0.5rem' }}>
              <input type="checkbox" checked={!!productForm.is_visible} onChange={e => setProductForm(prev => ({ ...prev, is_visible: e.target.checked }))} /> Visible
            </label>
            <label>Status
              <select name="status" value={productForm.status} onChange={onChange}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </label>
          </div>

          {TypeFields}

          <div className="actions">
            <button type="submit" className="primary">Create Product</button>
          </div>
          {createdProduct && (
            <p className="hint">Created product id: {createdProduct.id}</p>
          )}
        </form>
      </section>

      <section className="card">
        <h2>Upload Media</h2>
        <p className="muted">Create a session, drop multiple files, then attach each upload to a product with role and sort order.</p>
        <div className="row">
          <button type="button" onClick={ensureUploadSession} className="primary">Create session</button>
          {uploadSession && (
            <span className="muted">Session: {uploadSession.id || uploadSession.session_id}</span>
          )}
          <button type="button" onClick={refreshSessionFiles}>Refresh session</button>
          <label>Default Product ID
            <input value={mediaProductId} onChange={e => setMediaProductId(e.target.value)} placeholder={createdProduct ? String(createdProduct.id) : ''} />
          </label>
        </div>
        <div
          className="upload-dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFilesUpload(e.dataTransfer.files); }}
        >
          <input
            type="file"
            multiple
            onChange={(e) => handleFilesUpload(e.target.files)}
            aria-label="Upload files"
          />
          <p>{uploading ? 'Uploading…' : 'Drag & drop files here or click to browse'}</p>
        </div>

        {sessionFiles.length > 0 ? (
          <div className="upload-table">
            <div className="upload-header">
              <span>File</span>
              <span>Kind</span>
              <span>Role</span>
              <span>Sort</span>
              <span>Product</span>
              <span>Action</span>
            </div>
            {sessionFiles.map((f) => {
              const mapping = fileMappings[f.upload_id] || {};
              return (
                <div className="upload-row" key={f.upload_id}>
                  <span>
                    <code>#{f.upload_id}</code> {f.filename}
                    <br />
                    <span className="muted">{f.content_type || 'unknown'}</span>
                  </span>
                  <select
                    value={mapping.kind || f.kind || 'image'}
                    onChange={(e) => updateMapping(f.upload_id, { kind: e.target.value })}
                  >
                    <option value="image">Image</option>
                    <option value="model">Model</option>
                    <option value="pdf">PDF</option>
                  </select>
                  <select
                    value={mapping.role || f.role || ''}
                    onChange={(e) => updateMapping(f.upload_id, { role: e.target.value })}
                  >
                    <option value="">(none)</option>
                    <option value="thumbnail">Thumbnail</option>
                    <option value="gallery">Gallery</option>
                    <option value="model">Model</option>
                    <option value="document">Document</option>
                  </select>
                  <input
                    type="number"
                    value={mapping.sort_order ?? f.sort_order ?? 0}
                    onChange={(e) => updateMapping(f.upload_id, { sort_order: e.target.value })}
                    style={{ width: 70 }}
                  />
                  <input
                    type="number"
                    value={mapping.product_id ?? mediaProductId ?? createdProduct?.id ?? ''}
                    onChange={(e) => updateMapping(f.upload_id, { product_id: e.target.value })}
                    style={{ width: 110 }}
                  />
                  <button type="button" onClick={() => attachUpload(f)}>Attach</button>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="muted">No uploads yet. Create a session and drop files to begin.</p>
        )}
      </section>

      <section className="card">
        <h2>Product Media</h2>
        <div className="row">
          <label>Product ID
            <input value={mediaProductId} onChange={e => setMediaProductId(e.target.value)} placeholder={createdProduct ? String(createdProduct.id) : ''} />
          </label>
          <div className="actions">
            <button onClick={fetchMedia}>Fetch Media</button>
          </div>
        </div>
        {mediaList && mediaList.length > 0 ? (
          <ul className="media-list">
            {mediaList.map(m => (
              <li key={m.id}>
                <code>#{m.id}</code> {m.kind || m.media_type} - {m.filename} <span className="muted">({m.content_type || 'unknown'})</span>
                {m.role && <span className="badge" style={{ marginLeft: 6 }}>{m.role}</span>}
                {m.sort_order != null && <span className="muted" style={{ marginLeft: 6 }}>sort: {m.sort_order}</span>}
                <button type="button" onClick={() => removeMedia(m.id)} style={{ marginLeft: 8 }}>Remove</button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">No media loaded.</p>
        )}
      </section>

      <section className="card">
        <h2>Manage Products</h2>
        {loadingProducts ? (
          <p className="muted">Loading</p>
        ) : adminProducts && adminProducts.length > 0 ? (
          <>
          <div className="row" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <label>Filter
              <select value={filterVisibility} onChange={(e) => setFilterVisibility(e.target.value)}>
                <option value="all">All</option>
                <option value="visible">Visible</option>
                <option value="hidden">Hidden</option>
              </select>
            </label>
            <label>Search
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name" />
            </label>
            <button type="button" onClick={refreshProducts}>Reload</button>
          </div>
          <div className="table like-grid" role="table" aria-label="All products">
            <div className="row header" role="row">
              <div role="columnheader">ID</div>
              <div role="columnheader">Name</div>
              <div role="columnheader">Status</div>
              <div role="columnheader">Visible</div>
              <div role="columnheader">Price</div>
              <div role="columnheader">Discounted</div>
              <div role="columnheader">Discount</div>
              <div role="columnheader">Actions</div>
            </div>
            {adminProducts
              .filter(p => filterVisibility === 'all' ? true : filterVisibility === 'visible' ? p.is_visible : !p.is_visible)
              .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))
              .map((p) => (
              <div className={`row ${p.is_visible ? '' : 'hidden'}`} role="row" key={p.id}>
                <div role="cell">{p.id}</div>
                <div role="cell">{p.name} {p.is_visible ? <span className="badge visible">Visible</span> : <span className="badge hidden">Hidden</span>}</div>
                <div role="cell">
                  <span className="badge">{p.status || 'published'}</span>
                </div>
                <div role="cell">
                  <button type="button" onClick={() => toggleVisibility(p)}>
                    {p.is_visible ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div role="cell">
                  <PriceEditor product={p} onSave={savePrice} />
                </div>
                <div role="cell">{p.discounted_price != null ? `$${Number(p.discounted_price).toFixed(2)}` : '-'}</div>
                <div role="cell">
                  <DiscountEditor product={p} onApply={applyDiscountTo} />
                </div>
                <div role="cell">
                  <button type="button" onClick={refreshProducts}>Refresh</button>
                </div>
              </div>
            ))}
          </div>
          </>
        ) : (
          <p className="muted">No products found.</p>
        )}
      </section>
    </div>
  );
}

function PriceEditor({ product, onSave }) {
  const [val, setVal] = useState(product.price ?? 0);
  const num = Number(val);
  const valid = !Number.isNaN(num) && num >= 0;
  return (
    <div className="inline-editor">
      <input
        type="number"
        step="0.01"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        style={{ width: 100 }}
        aria-label={`Price for ${product.name}`}
      />
      <button type="button" onClick={() => onSave(product, num)} disabled={!valid} aria-disabled={!valid}>Save</button>
    </div>
  );
}

function DiscountEditor({ product, onApply }) {
  const [mode, setMode] = useState('percent');
  const [value, setValue] = useState('0');
  const num = Number(value);
  const valid = !Number.isNaN(num) && (mode === 'percent' ? num >= 0 && num <= 100 : num >= 0);
  return (
    <div className="inline-editor">
      <select value={mode} onChange={(e) => setMode(e.target.value)} aria-label={`Discount mode for ${product.name}`}>
        <option value="percent">Percent</option>
        <option value="amount">Amount</option>
      </select>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{ width: 90 }}
        aria-label={`Discount value for ${product.name}`}
      />
      <button type="button" onClick={() => onApply(product, mode, num)} disabled={!valid} aria-disabled={!valid}>Apply</button>
      {!valid && <span className="muted" aria-live="polite" style={{ marginLeft: 6 }}>Enter {mode === 'percent' ? '100%' : '0'}</span>}
    </div>
  );
}

export default AdminDashboard;

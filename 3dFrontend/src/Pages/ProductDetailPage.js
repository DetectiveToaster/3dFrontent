// src/pages/ProductDetailPage.js

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../Services/api';
import ThreeDViewer from '../Components/ThreeDViewer';
import '../styles/ProductDetailPage.css';

function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [modelUrl, setModelUrl] = useState(null);

  useEffect(() => {
    api
      .get(`/products/${id}`)
      .then(async (response) => {
        setProduct(response.data);
        // Fetch all image blobs
        const imgs = [];
        let modelBlobUrl = null;
        if (response.data.media && response.data.media.length > 0) {
          for (const media of response.data.media) {
            if (media.media_type === "image") {
              const imgRes = await api.get(`/media/${media.id}`, { responseType: 'blob' });
              imgs.push(URL.createObjectURL(imgRes.data));
            }
            if (media.media_type === "model" && !modelBlobUrl) {
              const modelRes = await api.get(`/media/${media.id}`, { responseType: 'blob' });
              modelBlobUrl = URL.createObjectURL(modelRes.data);
            }
          }
        }
        setImages(imgs);
        setModelUrl(modelBlobUrl);
      })
      .catch((error) => console.error('Error fetching product:', error));

    // Clean up blob URLs on unmount
    return () => {
      images.forEach(url => URL.revokeObjectURL(url));
      if (modelUrl) URL.revokeObjectURL(modelUrl);
    };
    // eslint-disable-next-line
  }, [id]);

  if (!product) return <div>Loading...</div>;

  return (
    <div className="product-detail-page">
      <div className="product-visual">
        {/* Image gallery (show all) */}
        {images.length > 0 && (
          <div className="product-images">
            {images.map((img, idx) => (
              <img key={idx} src={img} alt={product.name + ' img' + idx} />
            ))}
          </div>
        )}
        {/* 3D Viewer */}
        {modelUrl && (
          <div className="product-3dviewer">
            <ThreeDViewer modelUrl={modelUrl} />
          </div>
        )}
      </div>
      <div className="product-details">
        <h2>{product.name}</h2>
        <p className="price">${parseFloat(product.selling_cost).toFixed(2)}</p>
        <ul className="specs">
          <li>Height: {product.height} cm</li>
          <li>Length: {product.length} cm</li>
          <li>Depth: {product.depth} cm</li>
        </ul>
        {/* Add to cart button (future) */}
      </div>
    </div>
  );
}

export default ProductDetailPage;

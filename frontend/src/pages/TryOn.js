import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ARViewer from '../components/ARViewer';
import { getProduct } from '../utils/api';

const TryOn = () => {
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [showAR, setShowAR] = useState(false);
  const [loading, setLoading] = useState(true);
  const productId = searchParams.get('product');
  const productType = searchParams.get('type');
  useEffect(() => { if (productId) loadProduct(); else setLoading(false); }, [productId]);
  const loadProduct = async () => {
    try { const response = await getProduct(productId); if (response.success) setProduct(response.data.product); } catch (error) { console.error('Error loading product:', error); } finally { setLoading(false); }
  };
  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}>Loading...</div>;
  if (showAR) return <ARViewer productType={productType || product?.category} onClose={() => setShowAR(false)} />;
  return (
    <div style={{padding:'2rem',maxWidth:'1200px',margin:'0 auto'}}>
      <h1>Virtual Try On</h1>
      {product ? (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2rem',marginTop:'2rem'}}>
          <div><div style={{background:'#f8f9fa',padding:'2rem',borderRadius:'10px',textAlign:'center',fontSize:'4rem'}}>{product.category === 'glasses' && '👓'}{product.category === 'hat' && '🧢'}{product.category === 'earring' && '💎'}{product.category === 'makeup' && '💄'}</div></div>
          <div><h2>{product.name}</h2><p style={{color:'#666',margin:'1rem 0'}}>{product.description}</p><p style={{fontSize:'1.5rem',fontWeight:'bold',color:'#007bff'}}>${product.price}</p>
            <div style={{marginTop:'2rem'}}><button className="btn btn-primary" onClick={() => setShowAR(true)} style={{marginRight:'1rem'}}>Start AR Try On</button><button className="btn btn-outline">Add to Cart</button></div>
          </div>
        </div>
      ) : (
        <div style={{textAlign:'center',marginTop:'2rem'}}><p>Select a product to try on from the products page.</p><a href="/products" className="btn btn-primary" style={{marginTop:'1rem'}}>Browse Products</a></div>
      )}
      <div style={{marginTop:'3rem',background:'#f8f9fa',padding:'2rem',borderRadius:'10px'}}><h3>How to use AR Try On:</h3><ol style={{marginTop:'1rem',lineHeight:'2'}}><li>Allow camera access when prompted</li><li>Position your face in the center of the frame</li><li>Make sure you have good lighting</li><li>Move your head slowly to see different angles</li></ol></div>
    </div>
  );
};

export default TryOn;

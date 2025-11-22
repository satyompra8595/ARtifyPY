import React from 'react';

const ProductCard = ({ product, onTryOn, onAddToCart }) => {
  const getProductIcon = (category) => {
    switch (category) {
      case 'glasses': return '👓';
      case 'hat': return '🧢';
      case 'earring': return '💎';
      case 'makeup': return '💄';
      default: return '🛍️';
    }
  };
  return (
    <div className="product-card">
      <div className="product-image">{getProductIcon(product.category)}</div>
      <div className="product-info">
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <p className="product-price">${product.price}</p>
        <div style={{display:'flex',gap:'0.5rem',marginTop:'1rem'}}>
          <button className="btn btn-primary" onClick={() => onTryOn(product)} style={{flex:1}}>Try On</button>
          <button className="btn btn-outline" onClick={() => onAddToCart(product)} style={{flex:1}}>Add to Cart</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

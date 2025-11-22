import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { searchProducts, addToCart } from '../utils/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { filterProducts(); }, [products, searchQuery, category, brand]);

  const loadProducts = async () => {
    try {
      const response = await searchProducts('');
      if (response.success) setProducts(response.data.products);
    } catch (error) { console.error('Error loading products:', error); } finally { setLoading(false); }
  };

  const filterProducts = () => {
    let filtered = products;
    if (searchQuery) filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    if (category) filtered = filtered.filter(p => p.category === category);
    if (brand) filtered = filtered.filter(p => p.brand === brand);
    setFilteredProducts(filtered);
  };

  const handleTryOn = (product) => { window.location.href = `/try-on?product=${product._id}&type=${product.category}`; };
  const handleAddToCart = async (product) => {
    try {
      const response = await addToCart(product._id, 1);
      if (response.success) alert('Product added to cart!');
      else alert('Please login to add items to cart');
    } catch (error) { alert('Error adding to cart'); }
  };

  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}>Loading products...</div>;

  return (
    <div>
      <div className="products-header">
        <h1>Our Products</h1>
        <div className="search-filters">
          <input type="text" placeholder="Search products..." className="search-input" value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} />
          <select className="filter-select" value={category} onChange={(e)=>setCategory(e.target.value)}><option value="">All Categories</option><option value="glasses">Glasses</option><option value="hat">Hats</option><option value="earring">Earrings</option><option value="makeup">Makeup</option></select>
          <select className="filter-select" value={brand} onChange={(e)=>setBrand(e.target.value)}><option value="">All Brands</option><option value="artify">ARtify</option><option value="premium">Premium</option><option value="basic">Basic</option></select>
        </div>
      </div>
      <div className="products-grid">{filteredProducts.map(product => <ProductCard key={product._id} product={product} onTryOn={handleTryOn} onAddToCart={handleAddToCart} />)}</div>
      {filteredProducts.length === 0 && <div style={{textAlign:'center',padding:'2rem',color:'#666'}}>No products found matching your criteria.</div>}
    </div>
  );
};

export default Products;

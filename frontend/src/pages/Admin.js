import React, { useState, useEffect } from 'react';
import { searchProducts } from '../utils/api';

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const resp = await searchProducts('');
      if (resp.success) setProducts(resp.data.products || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div style={{padding:'2rem',maxWidth:1100,margin:'0 auto'}}>
      <h1>Admin Dashboard</h1>
      <p style={{color:'#666'}}>Manage products, orders and users (prototype).</p>
      <div style={{marginTop:16}}>
        <button className="btn btn-primary" style={{marginBottom:12}}>Add New Product</button>
        {loading ? <div>Loading...</div> : (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
            {products.map(p => (
              <div key={p._id} style={{background:'#fff',padding:12,borderRadius:8,boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
                <div style={{fontWeight:600}}>{p.name}</div>
                <div style={{color:'#666',fontSize:13}}>{p.category} • ${p.price}</div>
                <div style={{marginTop:8,display:'flex',gap:8}}>
                  <button className="btn btn-outline">Edit</button>
                  <button className="btn btn-danger">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

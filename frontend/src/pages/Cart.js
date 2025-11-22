import React, { useEffect, useState } from 'react';
import { getCart, updateCartItem, removeFromCart } from '../utils/api';

const Cart = () => {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await getCart();
      if (response.success) setCart(response.data.cart || { items: [] });
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, qty) => {
    if (qty < 1) return handleRemove(productId);
    try {
      const resp = await updateCartItem(productId, qty);
      if (resp.success) loadCart();
    } catch (err) { console.error(err); }
  };

  const handleRemove = async (productId) => {
    try {
      const resp = await removeFromCart(productId);
      if (resp.success) loadCart();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}>Loading cart...</div>;
  if (!cart.items || cart.items.length === 0) return <div style={{padding:'2rem',textAlign:'center'}}>Your cart is empty.</div>;

  return (
    <div style={{padding:'2rem',maxWidth:1000, margin:'0 auto'}}>
      <h1>Your Cart</h1>
      <div style={{marginTop:20}}>
        {cart.items.map(item => (
          <div key={item.product_id} style={{display:'flex',alignItems:'center',gap:16,background:'#fff',padding:16,borderRadius:8,marginBottom:12,boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
            <div style={{width:72,height:72,background:'#f1f3f5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,borderRadius:8}}>
              🛍️
            </div>
            <div style={{flex:1}}>
              <div style={{fontWeight:600}}>{item.product_name || item.product_id}</div>
              <div style={{color:'#666',marginTop:6}}>${item.price?.toFixed?.(2) ?? '0.00'}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <input type="number" min="1" value={item.quantity} onChange={(e)=>handleQuantityChange(item.product_id, Number(e.target.value))} style={{width:72,padding:8}} />
              <button className="btn btn-outline" onClick={()=>handleRemove(item.product_id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div style={{textAlign:'right',marginTop:20}}>
        <button className="btn btn-primary">Proceed to Checkout</button>
      </div>
    </div>
  );
};

export default Cart;

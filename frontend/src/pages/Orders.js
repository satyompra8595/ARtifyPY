import React, { useEffect, useState } from 'react';
import { getMyOrders } from '../utils/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadOrders(); }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const resp = await getMyOrders();
      if (resp.success) setOrders(resp.data.orders || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}>Loading orders...</div>;
  if (orders.length === 0) return <div style={{padding:'2rem',textAlign:'center'}}>You have no orders yet.</div>;

  return (
    <div style={{padding:'2rem',maxWidth:1000,margin:'0 auto'}}>
      <h1>Your Orders</h1>
      <div style={{marginTop:20}}>
        {orders.map(order => (
          <div key={order._id} style={{background:'#fff',padding:16,borderRadius:8,marginBottom:12,boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div><strong>Order #{order._id}</strong><div style={{color:'#666',fontSize:13}}>Placed: {new Date(order.created_at).toLocaleString()}</div></div>
              <div style={{fontWeight:600}}>{order.status}</div>
            </div>
            <div style={{marginTop:12}}>
              {order.items && order.items.map((it, idx) => (
                <div key={idx} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderTop:'1px solid #f1f3f5'}}>
                  <div>{it.product_name || it.product_id}</div>
                  <div>x{it.quantity}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

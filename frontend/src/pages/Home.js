import React from 'react';
import { Link } from 'react-router-dom';
const Home = () => (
  <div>
    <section className="hero">
      <div className="hero-content">
        <h1>Welcome to ARtify</h1>
        <p>Try before you buy with our augmented reality virtual try-on platform</p>
        <div style={{display:'flex',gap:'1rem',justifyContent:'center'}}>
          <Link to="/products" className="btn btn-primary">Shop Now</Link>
          <Link to="/try-on" className="btn btn-outline">Virtual Try On</Link>
        </div>
      </div>
    </section>
    <section className="features">
      <h2 style={{textAlign:'center',marginBottom:'1rem'}}>Why Choose ARtify?</h2>
      <p style={{textAlign:'center',color:'#666',maxWidth:'600px',margin:'0 auto 3rem'}}>Experience the future of online shopping with our advanced AR technology</p>
      <div className="features-grid">
        <div className="feature-card"><h3>👓 Virtual Try On</h3><p>See how glasses, hats, and accessories look on you in real-time using your camera</p></div>
        <div className="feature-card"><h3>🎯 Accurate Fit</h3><p>Advanced face tracking ensures perfect placement and realistic preview</p></div>
        <div className="feature-card"><h3>🛍️ Easy Shopping</h3><p>Seamlessly browse, try on, and purchase your favorite accessories</p></div>
      </div>
    </section>
  </div>
);
export default Home;

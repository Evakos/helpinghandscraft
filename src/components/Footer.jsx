import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>Helping Hands Craft</h3>
          <p>Handcrafted with love, delivered with care. Curated supplies and unique creations for every maker and occasion.</p>
        </div>
        <div className="footer-section">
          <h4>Navigate</h4>
          <a href="/">Home</a>
          <a href="/shop">Shop</a>
          <a href="/cart">Cart</a>
        </div>
        <div className="footer-section">
          <h4>Connect</h4>
          <a href="https://helpinghandscraft.co.uk" target="_blank" rel="noopener noreferrer">WordPress Store</a>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>helpinghandscraft.co.uk</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Helping Hands Craft. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

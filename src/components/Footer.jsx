import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Helping Hands Craft</h3>
          <p>Handcrafted with love, delivered with care.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <a href="/shop">Shop</a>
          <a href="/cart">Cart</a>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>helpinghandscraft.co.uk</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Helping Hands Craft. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

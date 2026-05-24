import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { cartCount } = useCart();

  return (
    <nav className="navbar">
      <div className="navbar-top">
        Handcrafted with love — Free UK delivery on orders over £30
      </div>
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">✦</span>
          <span className="brand-text">Helping Hands Craft</span>
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/shop" className="nav-link">Shop</Link>
          <Link to="/cart" className="nav-link cart-link">
            <span className="cart-link-icon">🛒</span>
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

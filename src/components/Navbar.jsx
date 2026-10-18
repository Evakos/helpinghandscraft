import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { WC_DOMAIN } from '../api/woocommerce';
import logo from '../assets/logo.svg';
import './Navbar.css';

const Navbar = () => {
  const { count } = useCart();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await fetch(`${WC_DOMAIN}/wp-json/hhc/v1/menus`);
        const menus = await res.json();
        
        // Find the primary menu
        const primaryMenu = menus.find(m => m.locations.includes('primary'));
        if (!primaryMenu) return;

        const menuRes = await fetch(`${WC_DOMAIN}/wp-json/hhc/v1/menu/primary`);
        const items = await menuRes.json();
        
        if (Array.isArray(items)) {
          setMenuItems(items);
        }
      } catch (err) {
        console.warn('Could not fetch menu, using defaults:', err);
      }
    };
    fetchMenu();
  }, []);

  // Default menu items if API fails
  const defaultItems = [
    { title: 'Home', slug: '', url: `${window.location.origin}/` },
    { title: 'Shop', slug: 'shop', url: `${window.location.origin}/shop` },
  ];

  const items = menuItems.length > 0 ? menuItems : defaultItems;

  // Split menu items: left side and right side
  const midPoint = Math.ceil(items.length / 2);
  const leftItems = items.slice(0, midPoint);
  const rightItems = items.slice(midPoint);

  const getPath = (item) => {
    try {
      const url = new URL(item.url);
      return url.pathname || '/';
    } catch {
      return `/${item.slug || ''}`;
    }
  };

  const isActive = (item) => {
    const path = getPath(item);
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="navbar">
      <div className="navbar-top">
        Handcrafted with love — Free UK delivery on orders over £30
      </div>
      <div className="navbar-container">
        <div className="navbar-links navbar-links--left">
          {leftItems.map((item, i) => (
            <Link
              key={i}
              to={getPath(item)}
              className={`nav-link ${isActive(item) ? 'nav-link--active' : ''}`}
            >
              {item.title}
            </Link>
          ))}
        </div>

        <Link to="/" className="navbar-brand">
          <img src={logo} alt="Helping Hands Craft" className="navbar-logo" />
        </Link>

        <div className="navbar-links navbar-links--right">
          {rightItems.map((item, i) => (
            <Link
              key={i}
              to={getPath(item)}
              className={`nav-link ${isActive(item) ? 'nav-link--active' : ''}`}
            >
              {item.title}
            </Link>
          ))}
          <Link to="/cart" className="nav-link cart-link">
            <span className="cart-link-icon">🛒</span>
            Cart
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

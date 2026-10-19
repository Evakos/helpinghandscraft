import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { WC_DOMAIN } from '../api/woocommerce';
import logo from '../assets/logo.svg';
import './Navbar.css';

const Navbar = () => {
  const { count } = useCart();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

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

  const renderLink = (item, i) => (
    <Link key={i} to={getPath(item)} className={`nav-link ${isActive(item) ? 'nav-link--active' : ''}`}>
      {item.title}
    </Link>
  );

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar-top">
        Handcrafted with love — Free UK delivery on orders over £30
      </div>
      <div className="navbar-container">
        <button
          type="button"
          className="navbar-toggle"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>

        <div className="navbar-links navbar-links--left">{items.map(renderLink)}</div>

        <Link to="/" className="navbar-brand">
          <img src={logo} alt="Helping Hands Craft" className="navbar-logo" />
        </Link>

        <div className="navbar-links navbar-links--right">
          <Link to="/cart" className="cart-link" aria-label={`Bag${count > 0 ? `, ${count} items` : ''}`}>
            <ShoppingBag size={21} strokeWidth={1.5} />
            <span className="cart-link-label">Bag</span>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>
        </div>
      </div>

      <div className={`navbar-drawer ${open ? 'navbar-drawer--open' : ''}`} aria-hidden={!open} onClick={() => setOpen(false)}>
        {items.map(renderLink)}
        <Link to="/cart" className="nav-link">Bag{count > 0 ? ` (${count})` : ''}</Link>
      </div>
    </nav>
  );
};

export default Navbar;

import { Link } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, ArrowRight, ArrowLeft, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../api/woocommerce';
import './Cart.css';

// Cart items carry the backend permalink; keep shoppers on this site by using its slug.
const productPath = (item) => {
  const slug = item.permalink?.split('/').filter(Boolean).pop();
  return slug ? `/product/${slug}` : '/shop';
};

const Cart = () => {
  const { items, total, currency, loading, removeFromCart, updateQuantity, checkoutUrl } = useCart();

  const itemPrice = (item) =>
    formatPrice(item.prices?.price, currency.minorUnit, currency.symbol);

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <span className="cart-empty-icon"><ShoppingBag size={34} /></span>
          <h1>{loading ? 'Loading your cart' : 'Your cart is empty'}</h1>
          {!loading && (
            <>
              <p>Nothing here yet. Have a look around the shop.</p>
              <Link to="/shop" className="cart-btn">Browse products <ArrowRight size={16} /></Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <header className="cart-hero">
        <p className="cart-hero-label">Your basket</p>
        <h1>Shopping cart</h1>
      </header>

      <div className="cart-container">
        <div className="cart-items">
          {items.map(item => (
            <div key={item.key} className="cart-item">
              <Link to={productPath(item)} className="cart-item-image">
                <img src={item.images?.[0]?.src || 'https://via.placeholder.com/100'} alt={item.name} />
              </Link>
              <div className="cart-item-info">
                <Link to={productPath(item)} className="cart-item-name">
                  {item.name}
                </Link>
                <p className="cart-item-price">{itemPrice(item)}</p>
              </div>
              <div className="cart-item-quantity">
                <button
                  onClick={() =>
                    item.quantity <= 1
                      ? removeFromCart(item.key)
                      : updateQuantity(item.key, item.quantity - 1)
                  }
                  className="cart-qty-btn"
                  aria-label="Decrease quantity"
                >
                  <Minus size={15} />
                </button>
                <span className="cart-qty-value">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.key, item.quantity + 1)}
                  className="cart-qty-btn"
                  aria-label="Increase quantity"
                >
                  <Plus size={15} />
                </button>
              </div>
              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.key)}
                aria-label={`Remove ${item.name}`}
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h2>Order summary</h2>
          <div className="cart-total">
            <span>Total</span>
            <span className="total-amount">{total}</span>
          </div>
          <p className="cart-delivery"><Truck size={17} /> Free UK delivery on orders over £30</p>
          <a href={checkoutUrl} className="cart-btn cart-btn--wide">Checkout <ArrowRight size={16} /></a>
          <Link to="/shop" className="continue-shopping"><ArrowLeft size={15} /> Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
};

export default Cart;

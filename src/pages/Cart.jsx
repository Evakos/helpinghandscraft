import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../api/woocommerce';
import './Cart.css';

const Cart = () => {
  const { items, total, currency, loading, removeFromCart, updateQuantity, checkoutUrl } = useCart();

  const itemPrice = (item) =>
    formatPrice(item.prices?.price, currency.minorUnit, currency.symbol);

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h1>{loading ? 'Loading cart...' : 'Your Cart is Empty'}</h1>
          {!loading && (
            <>
              <p>Looks like you haven't added anything yet.</p>
              <Link to="/shop" className="view-all-btn">Browse Products</Link>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
        </div>

        <div className="cart-items">
          {items.map(item => (
            <div key={item.key} className="cart-item">
              <div className="cart-item-image">
                <img src={item.images?.[0]?.src || 'https://via.placeholder.com/100'} alt={item.name} />
              </div>
              <div className="cart-item-info">
                <a href={item.permalink} className="cart-item-name">
                  {item.name}
                </a>
                <p className="cart-item-price">{itemPrice(item)}</p>
              </div>
              <div className="cart-item-quantity">
                <button
                  onClick={() =>
                    item.quantity <= 1
                      ? removeFromCart(item.key)
                      : updateQuantity(item.key, item.quantity - 1)
                  }
                  className="qty-btn"
                >
                  −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.key, item.quantity + 1)}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.key)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="cart-total">
            Total: <span className="total-amount">{total}</span>
          </div>
          <a href={checkoutUrl} className="view-all-btn checkout-btn">Checkout</a>
          <Link to="/shop" className="continue-shopping">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;

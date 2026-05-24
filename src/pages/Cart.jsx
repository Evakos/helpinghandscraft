import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <h1>Your Cart is Empty</h1>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/shop" className="view-all-btn">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <button className="clear-cart-btn" onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        <div className="cart-items">
          {cart.items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} />
              </div>
              <div className="cart-item-info">
                <Link to={`/product/${item.id}`} className="cart-item-name">
                  {item.name}
                </Link>
                <p className="cart-item-price">£{parseFloat(item.price).toFixed(2)}</p>
              </div>
              <div className="cart-item-quantity">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="qty-btn"
                >
                  −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="qty-btn"
                >
                  +
                </button>
              </div>
              <div className="cart-item-total">
                £{(parseFloat(item.price) * item.quantity).toFixed(2)}
              </div>
              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <div className="cart-total">
            Total: <span className="total-amount">£{cart.total.toFixed(2)}</span>
          </div>
          <Link to="/shop" className="continue-shopping">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;

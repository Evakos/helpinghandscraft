import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { WC_DOMAIN, WC_STORE, formatPrice } from '../api/woocommerce';

const CartContext = createContext();

// The cart lives in WooCommerce, not in localStorage. Add to cart loads a
// hidden iframe on WC_DOMAIN to set the WooCommerce session cookies, then the
// Store API (/wp-json/wc/store/v1/cart) is read with credentials so the cart
// stays in sync. Checkout is the WooCommerce checkout page. This mirrors the
// Orlik and Alor headless setup.
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState('£0.00');
  const [currency, setCurrency] = useState({ symbol: '£', minorUnit: 2 });
  const [loading, setLoading] = useState(false);
  const addIframe = useRef(null);
  const [addUrl, setAddUrl] = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch(`${WC_STORE}/cart`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      const totals = data.totals || {};
      const symbol = totals.currency_symbol || '£';
      const minorUnit = totals.currency_minor_unit ?? 2;
      setCurrency({ symbol, minorUnit });
      setItems(data.items || []);
      setCount(data.items_count || 0);
      setTotal(formatPrice(totals.total_price, minorUnit, symbol));
    } catch {
      // The cart fetch can fail silently; items may still have been added.
    }
  }, []);

  useEffect(() => {
    // fetchCart is async: its setState calls happen after `await`, so this is
    // not a synchronous setState in the effect (the rule flags a false positive).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
  }, [fetchCart]);

  // When an add-to-cart iframe URL is set, load it, then refresh the cart.
  useEffect(() => {
    if (!addUrl) return;
    const iframe = addIframe.current;
    if (!iframe) return;
    const onLoad = () => {
      fetchCart();
      setAddUrl(null);
    };
    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, [addUrl, fetchCart]);

  const addToCart = useCallback((productId, quantity = 1) => {
    setLoading(true);
    const qty = Math.max(1, Math.min(quantity, 9999));
    // The add-to-cart URL sets the WooCommerce session cookies on WC_DOMAIN.
    setAddUrl(`${WC_DOMAIN}/?add-to-cart=${productId}&quantity=${qty}`);
    setLoading(false);
  }, []);

  const removeFromCart = useCallback(async (itemKey) => {
    try {
      await fetch(`${WC_STORE}/cart/remove-item`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: itemKey }),
      });
      await fetchCart();
    } catch {
      // Silently fail; the live cart stays authoritative.
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (itemKey, quantity) => {
    const qty = Math.max(1, quantity);
    try {
      await fetch(`${WC_STORE}/cart/update-item`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: itemKey, quantity: qty }),
      });
      await fetchCart();
    } catch {
      // Silently fail.
    }
  }, [fetchCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    setCount(0);
    setTotal('£0.00');
  }, []);

  const value = {
    items,
    count,
    total,
    currency,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    refreshCart: fetchCart,
    checkoutUrl: `${WC_DOMAIN}/checkout/`,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <iframe
        ref={addIframe}
        src={addUrl || 'about:blank'}
        style={{ display: 'none' }}
        title="Cart"
      />
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;

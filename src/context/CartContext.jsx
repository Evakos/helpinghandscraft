import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const CART_STORAGE_KEY = 'hhc_cart';

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : { items: [], total: 0 };
  } catch {
    return { items: [], total: 0 };
  }
};

const cartReducer = (state, action) => {
  let newState;
  
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        item => item.id === action.payload.id
      );
      
      if (existingIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + (action.payload.quantity || 1),
        };
        newState = { ...state, items: updatedItems };
      } else {
        newState = {
          ...state,
          items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }],
        };
      }
      break;
    }
    
    case 'REMOVE_ITEM': {
      newState = {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
      };
      break;
    }
    
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );
      newState = { ...state, items: updatedItems };
      break;
    }
    
    case 'CLEAR_CART': {
      newState = { items: [], total: 0 };
      break;
    }
    
    default:
      return state;
  }
  
  // Calculate total
  newState.total = newState.items.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0
  );
  
  return newState;
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, null, loadCartFromStorage);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.src || '',
        slug: product.slug,
        quantity,
      },
    });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const cartCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;

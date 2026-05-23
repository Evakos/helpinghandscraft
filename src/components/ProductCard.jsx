import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  
  const image = product.images?.[0]?.src || 'https://via.placeholder.com/300';
  const price = parseFloat(product.price).toFixed(2);

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-image">
        <img src={image} alt={product.name} loading="lazy" />
      </Link>
      <div className="product-card-body">
        <Link to={`/product/${product.id}`} className="product-card-title">
          {product.name}
        </Link>
        <p className="product-card-price">£{price}</p>
        <button
          className="add-to-cart-btn"
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

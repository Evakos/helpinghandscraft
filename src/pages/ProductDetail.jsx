import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../api/woocommerce';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProduct(id);
        setProduct(data);
      } catch (err) {
        setError('Failed to load product.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (loading) {
    return <div className="product-detail-loading">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="product-detail-error">
        <p>{error || 'Product not found.'}</p>
        <Link to="/shop" className="back-link">← Back to Shop</Link>
      </div>
    );
  }

  const image = product.images?.[0]?.src || 'https://via.placeholder.com/600';
  const galleryImages = product.images?.slice(1) || [];
  const price = parseFloat(product.price).toFixed(2);
  const regularPrice = product.regular_price ? parseFloat(product.regular_price).toFixed(2) : null;
  const onSale = product.on_sale;

  return (
    <div className="product-detail">
      <div className="product-detail-container">
        <Link to="/shop" className="back-link">← Back to Shop</Link>
        
        <div className="product-detail-content">
          <div className="product-gallery">
            <div className="main-image">
              <img src={image} alt={product.name} />
            </div>
            {galleryImages.length > 0 && (
              <div className="gallery-thumbnails">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img.src}
                    alt={`${product.name} ${index + 1}`}
                    className="thumbnail"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <h1 className="product-name">{product.name}</h1>
            
            <div className="product-pricing">
              {onSale && regularPrice ? (
                <>
                  <span className="sale-price">£{price}</span>
                  <span className="regular-price">£{regularPrice}</span>
                </>
              ) : (
                <span className="price">£{price}</span>
              )}
            </div>

            {product.short_description && (
              <div
                className="product-short-desc"
                dangerouslySetInnerHTML={{ __html: product.short_description }}
              />
            )}

            {product.description && (
              <div className="product-description">
                <h3>Description</h3>
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}

            {product.stock_status && (
              <p className={`stock-status ${product.stock_status}`}>
                {product.stock_status === 'instock' ? '✅ In Stock' : '❌ Out of Stock'}
              </p>
            )}

            {product.stock_status === 'instock' && (
              <div className="add-to-cart-section">
                <div className="quantity-control">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>
                <button
                  className={`add-to-cart-btn ${addedToCart ? 'added' : ''}`}
                  onClick={handleAddToCart}
                >
                  {addedToCart ? '✓ Added!' : 'Add to Cart'}
                </button>
              </div>
            )}

            {product.categories && (
              <div className="product-categories">
                <strong>Categories:</strong>
                {product.categories.map((cat, index) => (
                  <span key={cat.id}>
                    {index > 0 && ', '}
                    <Link to={`/shop?category=${cat.id}`}>{cat.name}</Link>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

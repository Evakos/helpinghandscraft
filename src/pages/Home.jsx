import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts, getCategories } from '../api/woocommerce';
import ProductCard from '../components/ProductCard';
import './Home.css';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts({ per_page: 8, featured: true }),
          getCategories({ per_page: 10 }),
        ]);
        setFeaturedProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError('Could not load products. Please check your WooCommerce API connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="home">
        <section className="hero">
          <div className="hero-content">
            <h1>Helping Hands Craft</h1>
            <p>Handcrafted with love, unique creations for every occasion</p>
            <Link to="/shop" className="hero-cta">Browse Our Shop</Link>
          </div>
        </section>
        <div className="api-notice">
          <p>⚠️ {error}</p>
          <p>Make sure you've added your WooCommerce API keys to the <code>.env</code> file.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Helping Hands Craft</h1>
          <p>Handcrafted with love, unique creations for every occasion</p>
          <Link to="/shop" className="hero-cta">Browse Our Shop</Link>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="categories-section">
          <h2>Shop by Category</h2>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="category-card"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="featured-section">
        <h2>Featured Products</h2>
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : (
          <div className="products-grid">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
        <div className="view-all">
          <Link to="/shop" className="view-all-btn">View All Products →</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

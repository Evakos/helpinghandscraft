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
            <p className="hero-subtitle">Curated Craft Supplies</p>
            <h1>Helping Hands Craft</h1>
            <p>Handcrafted with love — unique creations and quality supplies for every maker.</p>
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
      {/* ─── Hero ─── */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-subtitle">Curated Craft Supplies</p>
          <h1>Helping Hands Craft</h1>
          <p>Handcrafted with love — unique creations and quality supplies for every maker, every project, every occasion.</p>
          <Link to="/shop" className="hero-cta">Browse Our Shop</Link>
        </div>
      </section>

      {/* ─── Categories ─── */}
      {categories.length > 0 && (
        <section className="section">
          <div className="section-header">
            <p className="section-label">Categories</p>
            <div className="section-divider" />
            <h2>Shop by Category</h2>
            <p>Find exactly what you need from our curated collections</p>
          </div>
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

      {/* ─── Featured Products ─── */}
      <section className="section">
        <div className="section-header">
          <p className="section-label">Featured</p>
          <div className="section-divider" />
          <h2>Featured Products</h2>
          <p>Our handpicked selection of the finest craft supplies</p>
        </div>
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
          <Link to="/shop" className="view-all-btn">View All Products</Link>
        </div>
      </section>

      {/* ─── Studio Section ─── */}
      <section className="studio-section">
        <div className="studio-content">
          <div className="studio-text">
            <p className="section-label">Our Studio</p>
            <div className="section-divider" style={{ margin: '0 0 1rem' }} />
            <h2>Made with Care</h2>
            <p>
              Every product in our collection is thoughtfully curated to inspire your next creation. 
              From essential tools to unique embellishments, we believe in the beauty of handmade.
            </p>
            <p>
              Whether you're a seasoned maker or just beginning your creative journey, 
              Helping Hands Craft is here to support you with quality supplies and a 
              community that celebrates the art of making.
            </p>
          </div>
          <div className="studio-image">
            <span>✦ Crafting since 2018 ✦</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

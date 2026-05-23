import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../api/woocommerce';
import ProductCard from '../components/ProductCard';
import './Shop.css';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          per_page: 12,
          page: currentPage,
        };
        if (currentCategory) params.category = currentCategory;
        if (searchQuery) params.search = searchQuery;

        const data = await getProducts(params);
        setProducts(data);
        
        // Try to get total pages from headers (the library may not expose this)
        // Fallback: assume more products exist
        setTotalPages(data.length < 12 ? currentPage : currentPage + 1);
      } catch (err) {
        setError('Failed to load products. Check your API connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [currentPage, currentCategory, searchQuery]);

  const handleCategoryChange = (catId) => {
    const params = new URLSearchParams();
    if (catId) params.set('category', catId);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get('search');
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1>Our Shop</h1>
        <p>Handcrafted items made with care</p>
      </div>

      <div className="shop-controls">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            name="search"
            placeholder="Search products..."
            defaultValue={searchQuery}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        <div className="category-filters">
          <button
            className={`cat-filter ${!currentCategory ? 'active' : ''}`}
            onClick={() => handleCategoryChange('')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`cat-filter ${currentCategory === cat.id.toString() ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="shop-content">
        {error && <div className="error-message">{error}</div>}
        
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <p>No products found.</p>
            {!error && <p>Add products to your WooCommerce store to see them here.</p>}
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-btn ${page === currentPage ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;

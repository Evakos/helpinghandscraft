import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import ComingSoon from './pages/ComingSoon';
import './App.css';

function SiteLayout() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

// The public site stays on the Coming Soon page. Visiting any page with ?preview=hhc once switches the full shop on for this browser
// (and ?preview=off switches it off again). This hides the shop, it is not a security measure.
const PREVIEW_KEY = 'hhc-preview';
function previewEnabled() {
  try {
    const q = new URLSearchParams(window.location.search).get('preview');
    if (q === 'hhc') localStorage.setItem(PREVIEW_KEY, '1');
    if (q === 'off') localStorage.removeItem(PREVIEW_KEY);
    return localStorage.getItem(PREVIEW_KEY) === '1';
  } catch {
    return false;
  }
}

function App() {
  const preview = previewEnabled();
  if (!preview) return <ComingSoon />;
  return (
    <Router>
      <CartProvider>
        <Routes>
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="*" element={<SiteLayout />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;

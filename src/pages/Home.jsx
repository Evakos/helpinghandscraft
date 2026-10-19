import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import heartHands from '../assets/heart-hands.png';
import { Scissors, Paintbrush, Ruler, Pencil, Palette, Flower2, Heart, Sparkles, Truck, Gem, ArrowRight } from 'lucide-react';
import { getProducts, getCategories } from '../api/woocommerce';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import './Home.css';

// Floating craft ideas, spaced round the ring of the sunburst. Angle is in degrees from 12 o'clock; see .float-tile in Home.css.
const FLOATERS = [
  { Icon: Scissors, tint: 'blush', angle: 0, size: 58, rot: -8, dur: 6.5, delay: 0 },
  { Icon: Paintbrush, tint: 'sky', angle: 52, size: 62, rot: 7, dur: 7.5, delay: 0.8 },
  { Icon: Ruler, tint: 'butter', angle: 103, size: 54, rot: 6, dur: 8, delay: 1.4 },
  { Icon: Palette, tint: 'sage', angle: 155, size: 60, rot: -6, dur: 6.8, delay: 0.4 },
  { Icon: Pencil, tint: 'lilac', angle: 206, size: 52, rot: -10, dur: 7.2, delay: 1.1 },
  { Icon: Flower2, tint: 'blush', angle: 258, size: 56, rot: 9, dur: 8.4, delay: 0.2 },
  { Icon: Gem, tint: 'sky', angle: 309, size: 48, rot: 5, dur: 6.2, delay: 1.7 },
].map((f) => {
  const rad = (f.angle * Math.PI) / 180;
  return { ...f, x: 50 + 43 * Math.sin(rad), y: 50 - 43 * Math.cos(rad) };
});

// The sunburst from the logo: long rays, shorter rays between them, and a ring of small dashes. Lengths vary in a fixed pattern.
// One full turn of the sunburst takes this long (seconds). The rotation is driven from code, not CSS, so the tiles can tell where each ray is.
const SUN_TURN_SECONDS = 140;
const polar = (deg, r) => {
  const rad = (deg * Math.PI) / 180;
  return [Math.sin(rad) * r, -Math.cos(rad) * r];
};
const SUN_RAYS = (() => {
  const rays = [];
  const longPattern = [30, 22, 34, 26, 20, 32];
  const shortPattern = [12, 18, 10, 15];
  for (let i = 0; i < 36; i += 1) {
    const a = i * 10;
    rays.push({ a, r1: 60, r2: 60 + longPattern[i % longPattern.length], w: 2.4 });
    rays.push({ a: a + 5, r1: 66, r2: 66 + shortPattern[i % shortPattern.length], w: 2 });
    if (i % 2 === 0) rays.push({ a: a + 2.5, r1: 94, r2: 98, w: 1.6 });
  }
  return rays.map((r) => {
    const [x1, y1] = polar(r.a, r.r1);
    const [x2, y2] = polar(r.a, r.r2);
    return { ...r, x1, y1, x2, y2 };
  });
})();

// Torn paper edge under the hero: two paper layers, each roughened by noise. A low frequency pass makes the edge wander, a high frequency
// pass frays it into fibres. See .hero::before and .hero::after in Home.css.
// Angles of the longest rays, the ones that reach right through the tiles. When one passes a tile, the tile's colour warms up (see .float-tile in Home.css).
const LONG_RAYS = SUN_RAYS.filter((r) => r.r1 === 60 && r.r2 >= 92).map((r) => r.a);
const GLOW_SPREAD_DEGREES = 3.5;

const TearFilters = () => (
  <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
    <defs>
      {[['hhc-tear-a', 3], ['hhc-tear-b', 11]].map(([id, seed]) => (
        <filter key={id} id={id} x="-2%" y="-80%" width="104%" height="260%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.09" numOctaves="2" seed={seed} result="wander" />
          <feDisplacementMap in="SourceGraphic" in2="wander" scale="14" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed + 5} result="fibre" />
          <feDisplacementMap in="rough" in2="fibre" scale="5" xChannelSelector="R" yChannelSelector="B" />
        </filter>
      ))}
    </defs>
  </svg>
);

const Hero = ({ children }) => {
  const sunRef = useRef(null);
  const tileRefs = useRef([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t0 = performance.now();
    let frame;
    const tick = (now) => {
      const turn = ((now - t0) / 1000) * (360 / SUN_TURN_SECONDS);
      sunRef.current?.setAttribute('transform', `rotate(${turn % 360})`);
      tileRefs.current.forEach((el, i) => {
        if (!el) return;
        let glow = 0;
        for (const a of LONG_RAYS) {
          const d = ((((a + turn - FLOATERS[i].angle) % 360) + 540) % 360) - 180;
          glow = Math.max(glow, Math.exp(-(d * d) / (2 * GLOW_SPREAD_DEGREES ** 2)));
        }
        el.style.setProperty('--glow', glow.toFixed(3));
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
  <section className="hero">
    <TearFilters />
    <div className="hero-inner">
      <div className="hero-copy">
        <span className="hero-pill"><Sparkles size={14} strokeWidth={2} /> Curated craft supplies</span>
        <h1>Craft supplies for every maker.</h1>
        <p className="hero-lede">Handcrafted with love — unique creations and quality supplies for every maker, every project, every occasion.</p>
        <div className="hero-actions">
          <Link to="/shop" className="btn btn--solid">Browse the shop <ArrowRight size={16} strokeWidth={2} /></Link>
          <a href="#categories" className="btn btn--outline">Shop by category</a>
        </div>
        <ul className="hero-points">
          <li><Truck size={16} strokeWidth={1.75} /> Free UK delivery over £30</li>
          <li><Heart size={16} strokeWidth={1.75} /> Handpicked with care</li>
        </ul>
        {children}
      </div>

      <div className="hero-visual" aria-hidden="true">
        <svg viewBox="-100 -100 200 200" className="sun">
          <g ref={sunRef} className="sun-spin">
            {SUN_RAYS.map((r, i) => (
              <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} strokeWidth={r.w} />
            ))}
          </g>
          <circle r="52" className="sun-disc" />
        </svg>
        <span className="hero-sun-mark"><img src={heartHands} alt="" /></span>
        {FLOATERS.map(({ Icon, tint, x, y, size, rot, dur, delay }, i) => (
          <span
            key={i}
            ref={(el) => { tileRefs.current[i] = el; }}
            className={`float-tile float-tile--${tint}`}
            style={{ left: `${x}%`, top: `${y}%`, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, '--rot': `${rot}deg`, '--dur': `${dur}s`, '--delay': `${delay}s` }}
          >
            <Icon size={size * 0.46} strokeWidth={1.6} />
          </span>
        ))}
        <div className="hero-tag">
          <strong>Handmade with love</strong>
          <span>curated craft supplies</span>
        </div>
      </div>
    </div>
  </section>
  );
};

const CATEGORY_ICONS = [Scissors, Paintbrush, Palette, Ruler, Flower2, Pencil, Gem, Heart];
const CATEGORY_TINTS = ['blush', 'sky', 'sage', 'butter', 'lilac', 'blush', 'sky', 'sage'];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, categoriesData] = await Promise.all([
          getProducts({ per_page: 8 }),
          getCategories({ per_page: 100 }),
        ]);
        setFeaturedProducts(productsData);
        // Sort categories by product count (most popular first) and take top 8
        const sorted = [...categoriesData]
          .filter(cat => cat.count > 0)
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);
        setCategories(sorted);
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
        <Hero />
        <div className="api-notice">
          <p>We couldn't load the shop just now. Please refresh the page, or try again in a few minutes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <Hero />

      <div className="section-wrapper">
        {/* ─── Categories ─── */}
        {categories.length > 0 && (
          <section className="section" id="categories">
            <div className="section-head">
              <div>
                <h2>Shop by category</h2>
                <p>Find exactly what you need from our curated collections.</p>
              </div>
              <Link to="/shop" className="section-link">View all <ArrowRight size={15} strokeWidth={2} /></Link>
            </div>
            <div className="categories-grid">
              {categories.map((cat, i) => {
                const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length];
                return (
                  <Link key={cat.id} to={`/shop?category=${cat.id}`} className={`category-card category-card--${CATEGORY_TINTS[i % CATEGORY_TINTS.length]}`}>
                    <span className="category-card-icon"><Icon size={22} strokeWidth={1.6} /></span>
                    <span className="category-name">{cat.name}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ─── Featured Products ─── */}
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Featured products</h2>
              <p>Our handpicked selection of the finest craft supplies.</p>
            </div>
            <Link to="/shop" className="section-link">View all <ArrowRight size={15} strokeWidth={2} /></Link>
          </div>
          {!loading && featuredProducts.length === 0 && (
            <div className="empty-shop">
              <span className="why-icon why-icon--butter"><Sparkles size={22} strokeWidth={1.75} /></span>
              <div>
                <h3>New arrivals are on their way</h3>
                <p>We're restocking the shelves. Leave your email below and we'll let you know the moment we're back.</p>
              </div>
            </div>
          )}
          <div className="products-grid">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} type="product" />
                ))
              : featuredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))
            }
          </div>
        </section>
      </div>

      {/* ─── Why shop here ─── */}
      <section className="why">
        <div className="why-grid">
          <div className="why-card">
            <span className="why-icon why-icon--blush"><Heart size={20} strokeWidth={1.75} /></span>
            <h3>Handcrafted with love</h3>
            <p>Unique creations and quality supplies for every maker, every project, every occasion.</p>
          </div>
          <div className="why-card">
            <span className="why-icon why-icon--butter"><Sparkles size={20} strokeWidth={1.75} /></span>
            <h3>Handpicked selection</h3>
            <p>Every product is thoughtfully curated to inspire your next creation.</p>
          </div>
          <div className="why-card">
            <span className="why-icon why-icon--sky"><Truck size={20} strokeWidth={1.75} /></span>
            <h3>Free UK delivery</h3>
            <p>Free delivery to the UK on orders over £30.</p>
          </div>
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
          <div className="studio-mosaic" aria-hidden="true">
            {FLOATERS.slice(0, 6).map(({ Icon, tint }, i) => (
              <span key={i} className={`mosaic-tile float-tile--${tint}`}>
                <Icon size={34} strokeWidth={1.5} />
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;

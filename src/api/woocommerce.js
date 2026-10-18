import axios from 'axios';

// Public WooCommerce Store API (wc/store/v1). No consumer key or secret is
// required, and none ships to the browser — the same headless pattern as the
// Orlik (orlik-api.apps.evakos.io) and Alor (api.alortanapi.com) sites.
export const WC_DOMAIN =
  import.meta.env.VITE_WC_DOMAIN || 'https://api.helpinghandscraft.co.uk';
export const WC_STORE = `${WC_DOMAIN}/wp-json/wc/store/v1`;

const storeApi = axios.create({
  baseURL: WC_STORE,
  headers: { 'Cache-Control': 'no-cache' },
});

// The Store API returns prices as strings in minor units (e.g. "1200" is
// £12.00 when currency_minor_unit is 2). Format a minor unit value as money.
export const formatPrice = (minor, minorUnit = 2, symbol = '£') => {
  const n = parseFloat(minor);
  if (Number.isNaN(n)) return `${symbol}0.00`;
  return `${symbol}${(n / 10 ** minorUnit).toFixed(2)}`;
};

// Convert a minor unit price string to a major unit string ("1200" -> "12").
function minorToMajor(value, minorUnit) {
  if (value === null || value === undefined || value === '') return null;
  const num = parseFloat(value);
  if (Number.isNaN(num)) return null;
  return (num / 10 ** minorUnit).toString();
}

// Normalise a Store API product into the shape the app already renders, so the
// rest of the components keep working unchanged.
function mapProduct(p) {
  const minorUnit = p.prices?.currency_minor_unit ?? 2;
  const price = minorToMajor(p.prices?.price, minorUnit);
  const regularPrice = minorToMajor(p.prices?.regular_price, minorUnit);
  const salePrice = minorToMajor(p.prices?.sale_price, minorUnit);

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    type: p.type,
    permalink: p.permalink,
    price: price ?? '0',
    regular_price: regularPrice,
    sale_price: salePrice,
    on_sale:
      Boolean(p.on_sale) ||
      Boolean(salePrice && regularPrice && parseFloat(salePrice) < parseFloat(regularPrice)),
    currency_symbol: p.prices?.currency_symbol ?? '£',
    images: p.images || [],
    short_description: p.short_description || '',
    description: p.description || '',
    stock_status: p.is_in_stock ? 'instock' : 'outofstock',
    in_stock: Boolean(p.is_in_stock),
    categories: (p.categories || []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
    })),
  };
}

export const getProducts = async (params = {}) => {
  try {
    const { data } = await storeApi.get('/products', { params });
    return data.map(mapProduct);
  } catch (error) {
    console.error('Error fetching products:', error.response?.data || error.message);
    throw error;
  }
};

// Same as getProducts but also returns the WooCommerce pagination headers.
export const getProductsPage = async (params = {}) => {
  const { data, headers } = await storeApi.get('/products', { params });
  return {
    products: data.map(mapProduct),
    totalPages: parseInt(headers['x-wp-totalpages'] || '1', 10),
    total: parseInt(headers['x-wp-total'] || '0', 10),
  };
};

export const getProduct = async (id) => {
  try {
    const { data } = await storeApi.get(`/products/${id}`);
    return mapProduct(data);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const getCategories = async (params = {}) => {
  try {
    const { data } = await storeApi.get('/products/categories', { params });
    return data.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      count: c.count,
      parent: c.parent,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error.response?.data || error.message);
    throw error;
  }
};

export default storeApi;

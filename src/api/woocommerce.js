import axios from 'axios';

const wpUrl = import.meta.env.VITE_WP_URL || 'https://helpinghandscraft.co.uk';
const consumerKey = import.meta.env.VITE_WC_CONSUMER_KEY;
const consumerSecret = import.meta.env.VITE_WC_CONSUMER_SECRET;

// Axios instance for WooCommerce REST API
// Using HTTP/1.1 to avoid HTTP/2 protocol issues with some servers
const wcApi = axios.create({
  baseURL: `${wpUrl}/wp-json/wc/v3`,
  params: {
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
  },
  headers: {
    'Cache-Control': 'no-cache',
  },
});

// Axios instance for WordPress REST API (with Basic Auth for protected sites)
const wpApi = axios.create({
  baseURL: `${wpUrl}/wp-json`,
  auth: {
    username: import.meta.env.VITE_WP_BASIC_AUTH_USER || '',
    password: import.meta.env.VITE_WP_BASIC_AUTH_PASS || '',
  },
});

// Products
export const getProducts = async (params = {}) => {
  try {
    const { data } = await wcApi.get('products', { params });
    return data;
  } catch (error) {
    console.error('Error fetching products:', error.response?.data || error.message);
    throw error;
  }
};

export const getProduct = async (id) => {
  try {
    const { data } = await wcApi.get(`products/${id}`);
    return data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const getCategories = async (params = {}) => {
  try {
    const { data } = await wcApi.get('products/categories', { params });
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error.response?.data || error.message);
    throw error;
  }
};

// Orders
export const createOrder = async (orderData) => {
  try {
    const { data } = await wcApi.post('orders', orderData);
    return data;
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    throw error;
  }
};

// WordPress Pages via WP REST API
export const getWpPages = async () => {
  try {
    const { data } = await wpApi.get('/wp/v2/pages');
    return data;
  } catch (error) {
    console.error('Error fetching WP pages:', error.response?.data || error.message);
    throw error;
  }
};

export default wcApi;

import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

const wpUrl = import.meta.env.VITE_WP_URL || 'https://helpinghandscraft.co.uk';
const consumerKey = import.meta.env.VITE_WC_CONSUMER_KEY;
const consumerSecret = import.meta.env.VITE_WC_CONSUMER_SECRET;

// Create WooCommerce API instance
const api = new WooCommerceRestApi({
  url: wpUrl,
  consumerKey,
  consumerSecret,
  version: 'wc/v3',
  queryStringAuth: true, // Force Basic Auth as query string
});

// Axios instance with Basic Auth for WP endpoints
import axios from 'axios';

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
    const { data } = await api.get('products', params);
    return data;
  } catch (error) {
    console.error('Error fetching products:', error.response?.data || error.message);
    throw error;
  }
};

export const getProduct = async (id) => {
  try {
    const { data } = await api.get(`products/${id}`);
    return data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const getCategories = async (params = {}) => {
  try {
    const { data } = await api.get('products/categories', params);
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error.response?.data || error.message);
    throw error;
  }
};

// Cart (using WooCommerce API - for guest carts we use the API)
export const createCart = async (cartData) => {
  try {
    const { data } = await api.post('cart', cartData);
    return data;
  } catch (error) {
    console.error('Error creating cart:', error.response?.data || error.message);
    throw error;
  }
};

// Orders
export const createOrder = async (orderData) => {
  try {
    const { data } = await api.post('orders', orderData);
    return data;
  } catch (error) {
    console.error('Error creating order:', error.response?.data || error.message);
    throw error;
  }
};

// WordPress Pages/Menus via WP REST API
export const getWpPages = async () => {
  try {
    const { data } = await wpApi.get('/wp/v2/pages');
    return data;
  } catch (error) {
    console.error('Error fetching WP pages:', error.response?.data || error.message);
    throw error;
  }
};

export const getWpMenu = async (menuId = 'primary') => {
  try {
    const { data } = await wpApi.get(`/wp/v2/menus/${menuId}`);
    return data;
  } catch (error) {
    console.error('Error fetching menu:', error.response?.data || error.message);
    // Fallback - menus might need a plugin
    return null;
  }
};

export default api;

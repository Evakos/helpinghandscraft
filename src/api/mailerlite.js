import axios from 'axios';

const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api';

const mailerliteApi = axios.create({
  baseURL: MAILERLITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_MAILERLITE_API_KEY}`,
  },
});

/**
 * Subscribe a user to the newsletter
 * @param {string} email - The subscriber's email address
 * @param {string} [name] - Optional subscriber name
 * @returns {Promise<object>} The subscriber data
 */
export const subscribeToNewsletter = async (email, name = '') => {
  try {
    const groupId = import.meta.env.VITE_MAILERLITE_GROUP_ID;
    
    const payload = {
      email,
      groups: groupId ? [groupId] : [],
    };

    if (name) {
      payload.fields = { name };
    }

    const { data } = await mailerliteApi.post('/subscribers', payload);
    return data;
  } catch (error) {
    console.error('Error subscribing to newsletter:', error.response?.data || error.message);
    throw error;
  }
};

export default mailerliteApi;

import axios from 'axios';
const API_BASE_URL = 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_BASE_URL });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) { config.headers.Authorization = `Bearer ${token}`; }
  return config;
});
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    window.location.reload();
  }
  return Promise.reject(error);
});
export const registerUser = async (name, email, password) => {
  try { const response = await api.post('/auth/register', { name, email, password }); return { success: true, data: response.data }; }
  catch (error) { return { success: false, error: error.response?.data?.error || 'Registration failed' }; }
};
export const loginUser = async (email, password) => {
  try { const response = await api.post('/auth/login', { email, password }); return { success: true, data: response.data }; }
  catch (error) { return { success: false, error: error.response?.data?.error || 'Login failed' }; }
};
export const searchProducts = async (query, category, brand, color, style) => {
  try { const params = { q: query }; if (category) params.category = category; if (brand) params.brand = brand; if (color) params.color = color; if (style) params.style = style; const response = await api.get('/products/search', { params }); return { success: true, data: response.data }; }
  catch (error) { return { success: false, error: error.response?.data?.error || 'Search failed' }; }
};
export const getProduct = async (productId) => {
  try { const response = await api.get(`/products/${productId}`); return { success: true, data: response.data }; }
  catch (error) { return { success: false, error: error.response?.data?.error || 'Failed to get product' }; }
};
export const getCart = async () => { try { const response = await api.get('/cart'); return { success: true, data: response.data }; } catch (error) { return { success: false, error: error.response?.data?.error || 'Failed to get cart' }; } };
export const addToCart = async (productId, quantity = 1) => { try { const response = await api.post('/cart/add', { product_id: productId, quantity }); return { success: true, data: response.data }; } catch (error) { return { success: false, error: error.response?.data?.error || 'Failed to add to cart' }; } };
export const updateCartItem = async (productId, quantity) => { try { const response = await api.put('/cart/update', { product_id: productId, quantity }); return { success: true, data: response.data }; } catch (error) { return { success: false, error: error.response?.data?.error || 'Failed to update cart' }; } };
export const removeFromCart = async (productId) => { try { const response = await api.delete(`/cart/remove/${productId}`); return { success: true, data: response.data }; } catch (error) { return { success: false, error: error.response?.data?.error || 'Failed to remove from cart' }; } };
export const createOrder = async (orderData) => { try { const response = await api.post('/orders', orderData); return { success: true, data: response.data }; } catch (error) { return { success: false, error: error.response?.data?.error || 'Failed to create order' }; } };
export const getMyOrders = async () => { try { const response = await api.get('/orders/my-orders'); return { success: true, data: response.data }; } catch (error) { return { success: false, error: error.response?.data?.error || 'Failed to get orders' }; } };
export const getToken = () => localStorage.getItem('token');
export const decodeToken = (token) => { try { const payload = token.split('.')[1]; return JSON.parse(atob(payload)); } catch (error) { return null; } };
export default api;

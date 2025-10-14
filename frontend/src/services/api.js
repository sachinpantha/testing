import axios from 'axios';

const API_BASE_URL = 'https://hotel-backend-kjd8.onrender.com';

// Set up axios interceptor to include token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (credentials) => axios.post(`${API_BASE_URL}/auth/login`, credentials);

// Users
export const getUsers = () => axios.get(`${API_BASE_URL}/users`);
export const createUser = (userData) => axios.post(`${API_BASE_URL}/users`, userData);
export const deleteUser = (id) => axios.delete(`${API_BASE_URL}/users/${id}`);

// Menu
export const getMenuItems = () => axios.get(`${API_BASE_URL}/menu`);
export const createMenuItem = (itemData) => axios.post(`${API_BASE_URL}/menu`, itemData);
export const updateMenuItem = (id, itemData) => axios.put(`${API_BASE_URL}/menu/${id}`, itemData);
export const deleteMenuItem = (id) => axios.delete(`${API_BASE_URL}/menu/${id}`);

// Tables
export const getTables = () => axios.get(`${API_BASE_URL}/tables`);
export const getTable = (tableNumber) => axios.get(`${API_BASE_URL}/tables/${tableNumber}`);
export const initializeTables = () => axios.post(`${API_BASE_URL}/tables/initialize`);

// Orders
export const createOrder = (orderData) => axios.post(`${API_BASE_URL}/orders`, orderData);
export const getKitchenOrders = () => axios.get(`${API_BASE_URL}/orders/kitchen`);
export const updateOrderStatus = (id, status) => axios.put(`${API_BASE_URL}/orders/${id}/status`, { status });
export const getOrdersByTable = (tableNumber) => axios.get(`${API_BASE_URL}/orders/table/${tableNumber}`);
export const getAllOrders = () => axios.get(`${API_BASE_URL}/orders`);

// Bills
export const createBill = (billData) => axios.post(`${API_BASE_URL}/bills`, billData);
export const getBill = (id) => axios.get(`${API_BASE_URL}/bills/${id}`);
export const getAllBills = () => axios.get(`${API_BASE_URL}/bills`);

// Transactions
export const getAllTransactions = () => axios.get(`${API_BASE_URL}/transactions`);
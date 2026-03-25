import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// CRITICAL: Replace '192.168.1.XX' with your machine's LOCAL IP ADDRESS
// On Windows, run 'ipconfig' and look for IPv4 Address.
// The mobile app CANNOT use 'localhost' as it's a separate device/emulator.
const BASE_URL = 'http://10.24.235.165:3000/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically attach 'token' to every request if it exists in storage
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const login = async (username, password) => {
  const res = await api.post('/auth/admin/login', { username, password });
  if (res.data.success) {
    await AsyncStorage.setItem('token', res.data.token);
    await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const getStats = async () => {
  const res = await api.get('/admin/stats');
  return res.data;
};

export const getPatients = async () => {
  const res = await api.get('/patients');
  return res.data;
};

export const registerPatient = async (patientData) => {
  const res = await api.post('/patients', patientData);
  return res.data;
};

export const submitQuestionnaire = async (answers) => {
  const res = await api.post('/questionnaires', answers);
  return res.data;
};

export default api;

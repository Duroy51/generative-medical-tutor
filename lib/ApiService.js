import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 25000,
});

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
); 

// Intercepteur réponse
apiClient.interceptors.response.use(
  (response) => {
    console.log("RÉPONSE RECUE ←", response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Gestion des tokens
const TOKEN_KEY = 'auth-token';

export const storeToken = (token) => {
  try {
    if (token) {
      Cookies.set(TOKEN_KEY, token, { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'  // Changé à 'lax' pour mieux fonctionner avec CORS
      });
    }
  } catch (e) {
    console.error("Erreur stockage token", e);
  }
};

export const getToken = () => {
  return Cookies.get(TOKEN_KEY) || null;
};

export const clearToken = () => {
  Cookies.remove(TOKEN_KEY);
};

// ==============================================
// Endpoints API
// ==============================================

/**
 * Login utilisateur
 */
export const login = (username, password) => {
  console.log('🔐 Données envoyées au login:', { username, password }); // AJOUTEZ CETTE LIGNE
  return apiClient.post('/users/token/', { 
    username, 
    password 
  });
};

/**
 * Register utilisateur - CORRIGÉ
 */
export const register = (userData) => {
  // Envoie directement l'objet userData, pas encapsulé dans {Data}
  return apiClient.post('/users/register/', userData);
};

/**
 * Logout
 */
export const logout = () => {
  return apiClient.post('/auth/logout');
};

export default apiClient;
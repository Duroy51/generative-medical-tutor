// lib/ApiService.js

import axios from 'axios';
import Cookies from 'js-cookie';  // Pour la gestion des cookies (stockage du token)

// URL de base de l'API - Change en local pour dev (décommente l'IP locale si besoin)
// const API_BASE_URL = 'http://192.168.43.8:4000/api';  // IP locale pour dev


// Instance axios avec config de base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,  // Timeout 10s pour éviter les hangs
});

// Intercepteur pour ajouter le token Bearer à chaque requête (récupéré du cookie)
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

// Intercepteur pour gérer les erreurs globales (e.g., 401 → logout auto)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      // Optionnel: redirect to login via window.location si dans browser
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==============================================
// Utilitaires de Gestion du Token (avec Cookies)
// ==============================================
const TOKEN_KEY = 'auth-token';  // Clé du cookie pour le token

/**
 * Stocke le token dans un cookie sécurisé (expires en 7 jours).
 * @param {string} token - Le token JWT à stocker.
 */
export const storeToken = (token) => {
  try {
    if (token) {
      Cookies.set(TOKEN_KEY, token, { 
        expires: 7, 
        secure: process.env.NODE_ENV === 'production',  // Secure en prod (HTTPS)
        sameSite: 'strict' 
      });
      console.log('Token stocké en cookie:', token.substring(0, 20) + '...');
    } else {
      console.warn("Tentative de stocker un token null ou undefined.");
    }
  } catch (e) {
    console.error("Erreur lors du stockage du token", e);
  }
};

/**
 * Récupère le token depuis le cookie.
 * @returns {string|null} Le token ou null si absent.
 */
export const getToken = () => {
  try {
    const token = Cookies.get(TOKEN_KEY);
    return token || null;
  } catch (e) {
    console.error("Erreur lors de la lecture du token", e);
    return null;
  }
};

/**
 * Supprime le token du cookie (logout).
 */
export const clearToken = () => {
  try {
    Cookies.remove(TOKEN_KEY);
    console.log('Token supprimé du cookie.');
  } catch (e) {
    console.error("Erreur lors de la suppression du token", e);
  }
};

// ==============================================
// Authentification (Endpoints: /api/auth)
// ==============================================



/**
 * Login standard utilisateur.
 * @param {string} email - Email de l'utilisateur.
 * @param {string} password - Mot de passe.
 * @returns {Promise} Réponse avec session et user.
 */
export const login = (email, password) => {
  return apiClient.post('/auth/login', { email, password });
};

/**
 * Login admin (vérifie rôle ADMIN).
 * @param {string} email - Email admin.
 * @param {string} password - Mot de passe.
 * @returns {Promise} Réponse avec session, user (isAdmin: true).
 */
export const adminLogin = (email, password) => {
  return apiClient.post('/auth/admin-login', { email, password });
};

/**
 * Logout (clear session et cookie).
 * @returns {Promise} Réponse succès.
 */
export const logout = () => {
  return apiClient.post('/auth/logout');
};

/**
 * Demande de reset mot de passe (envoi email).
 * @param {string} email - Email pour reset.
 * @param {string} [redirectTo] - URL de redirect après reset (optionnel).
 * @returns {Promise} Réponse succès.
 */
export const forgotPassword = (email, redirectTo) => {
  return apiClient.post('/auth/forgot-password', { email, redirectTo });
};

/**
 * Reset mot de passe avec token du email.
 * @param {string} token - Token de recovery.
 * @param {string} newPassword - Nouveau mot de passe.
 * @returns {Promise} Réponse succès.
 */
export const resetPassword = (token, newPassword) => {
  return apiClient.post('/auth/reset-password', { token, newPassword });
};

// ==============================================
// 
// ==============================================


// ==============================================
// Export par défaut (instance axios)
export default apiClient;
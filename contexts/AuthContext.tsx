'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as ApiService from '@/lib/ApiService';
import { toast } from 'sonner';

interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  first_name: string;
  last_name: string;
}

type LoginResult = { success: boolean; user?: User; error?: string; message?: string };
type GenericResult = { success: boolean; error?: any };

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  register: (userData: {
    username: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
  }) => Promise<LoginResult>;
  logout: () => Promise<GenericResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ==========
  // RESTORE SESSION ON MOUNT
  // ==========
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // ==========
  // LOGIN - CORRIGÉ (seulement username et password)
  // ==========
  /**
  const login = async (username: string, password: string): Promise<LoginResult> => {
    console.log('[Auth] login...');
    setIsLoading(true);

    try {
      // 1. Login pour obtenir le token
      const loginRes = await ApiService.login(username, password);
      const { access } = loginRes.data;

      if (!access) {
        throw new Error('Token non reçu');
      }

      // Stocker le token
      ApiService.storeToken(access);
      
      // 2. Récupérer les infos utilisateur
      const userRes = await ApiService.getCurrentUser();
      const userData = userRes.data;

      const user: User = {
        id: userData.id,
        username: userData.username,
        password: '',
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Connexion réussie');
      return { success: true, user };

    } catch (error: any) {
      console.error('[Auth] login error:', error);
      const msg = error.response?.data?.detail || 'Nom d\'utilisateur ou mot de passe incorrect';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };
 */

  // ==========
  // LOGIN - Adapté pour la réponse JWT standard
  // ==========
  const login = async (username: string, password: string): Promise<LoginResult> => {
    console.log('[Auth] login...', { username, password });
    setIsLoading(true);

    try {
      // AJOUT: Log des données envoyées
      console.log('📤 Données envoyées:', { username, password });
      
      const res = await ApiService.login(username, password);

      console.log('📥 Réponse reçue:', res.data);
      const { access, refresh } = res.data;

      if (!access) {
        throw new Error('Token non reçu');
      }

      // Stocker le token
      ApiService.storeToken(access);
      
      // Récupérer les infos utilisateur via une autre endpoint ou les stocker dans le token
      // Pour l'instant, créons un objet user basique
      const user: User = {
        id: '4', // Vous devrez récupérer l'ID depuis le token ou une autre endpoint
        username: username,
        password: '', // Ne pas stocker le mot de passe
        email: '', // À récupérer via une autre endpoint
        first_name: '',
        last_name: ''
      };

      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success('Connexion réussie');
      return { success: true, user };

    } catch (error: any) {
      console.error('[Auth] login error:', error);
      const msg = error.response?.data?.detail || 'Nom d\'utilisateur ou mot de passe incorrect';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };
  // ==========
  // REGISTER - CORRIGÉ
  // ==========
  const register = async (userData: {
    username: string;
    password: string;
    email: string;
    first_name: string;
    last_name: string;
  }): Promise<LoginResult> => {

    console.log('[Auth] register...');
    setIsLoading(true);

    try {
      // Inscription seulement
      const registerRes = await ApiService.register(userData);
      console.log('✅ Inscription réussie:', registerRes.data);

      const { username, email, first_name, last_name } = registerRes.data;

      // Créer un objet user basique (sans connexion automatique)
      const user: User = {
        id: 'pending', // ID temporaire
        username: username,
        email: email,
        first_name: first_name,
        last_name: last_name,
        password: ''
      };

      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      
      // Retourner success mais sans connecter l'utilisateur
      return { 
        success: true, 
        user,
        message: 'redirect_to_login' // Flag pour rediriger
      };

    } catch (error: any) {
      console.error('[Auth] register error:', error);
      
      let msg = "Erreur lors de l'inscription";
      
      if (error.response?.data) {
        console.log('📋 Données erreur:', error.response.data);
        
        // Gestion des erreurs de validation Django
        if (error.response.data.username) {
          msg = `Nom d'utilisateur: ${error.response.data.username}`;
        } else if (error.response.data.email) {
          msg = `Email: ${error.response.data.email}`;
        } else if (error.response.data.password) {
          msg = `Mot de passe: ${error.response.data.password}`;
        } else if (error.response.data.non_field_errors) {
          msg = error.response.data.non_field_errors;
        }
      }
      
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };
  // ==========
  // LOGOUT
  // ==========
  const logout = async (): Promise<GenericResult> => {
    console.log('[Auth] logout...');
    setIsLoading(true);

    try {
      await ApiService.logout();
      ApiService.clearToken();

      setUser(null);
      localStorage.removeItem('user');

      toast.success('Déconnexion réussie');
      return { success: true };

    } catch (error: any) {
      const msg = error.response?.data?.error || 'Erreur lors de la déconnexion';
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
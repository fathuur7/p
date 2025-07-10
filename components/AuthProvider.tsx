import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useContext, useEffect, useState } from 'react';

const CLIENT_ID = '1390146554366529648'; 

interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isAuthenticated = !!user;

  // Check for stored authentication on app start
  useEffect(() => {
    checkStoredAuth();
  }, []);

  const checkStoredAuth = async () => {
    try {
      setIsLoading(true);
      const storedUser = await SecureStore.getItemAsync('discord_user');
      const storedToken = await SecureStore.getItemAsync('discord_access_token');
      
      if (storedUser && storedToken) {
        // Verify token is still valid
        const isValid = await verifyToken(storedToken);
        if (isValid) {
          setUser(JSON.parse(storedUser));
        } else {
          // Token expired, clear stored data
          await clearStoredAuth();
        }
      }
    } catch (error) {
      console.error('Error checking stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Create redirect URI
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'akademi-crypto'
      });

      console.log('Redirect URI:', redirectUri);

      // Build authorization URL
      const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20email`;

      console.log('Auth URL:', authUrl);

      // Open OAuth browser
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      console.log('WebBrowser result:', result);

      if (result.type === 'success') {
        const { url } = result;
        const urlParams = new URL(url).searchParams;
        const code = urlParams.get('code');
        const errorParam = urlParams.get('error');

        if (errorParam) {
          const errorDescription = urlParams.get('error_description');
          console.error('Discord OAuth error:', errorParam, errorDescription);
          throw new Error(`Discord OAuth error: ${errorParam}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        console.log('Authorization code received');

        // Exchange code for token
        const tokenData = await exchangeCodeForToken(code, redirectUri);

        if (tokenData) {
          // Get user info
          const userInfo = await getUserInfo(tokenData.access_token);
          
          // Store user and tokens
          await SecureStore.setItemAsync('discord_user', JSON.stringify(userInfo));
          await SecureStore.setItemAsync('discord_access_token', tokenData.access_token);
          
          if (tokenData.refresh_token) {
            await SecureStore.setItemAsync('discord_refresh_token', tokenData.refresh_token);
          }

          setUser(userInfo);
          console.log('Login successful:', userInfo);
        }
      } else if (result.type === 'dismiss') {
        console.log('User cancelled authentication');
        // Don't throw an error for user cancellation
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error : new Error('Login failed'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const exchangeCodeForToken = async (code: string, redirectUri: string) => {
    try {
      console.log('Exchanging code for token...');

      const response = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
          // No client_secret for mobile apps
        }),
      });

      const data = await response.json();

      console.log('Token exchange response:', response.status, data);

      if (response.ok) {
        return data;
      } else {
        console.error('Token exchange failed:', data);
        throw new Error(data.error_description || 'Token exchange failed');
      }
    } catch (error) {
      console.error('Token exchange error:', error);
      throw error;
    }
  };

  const getUserInfo = async (accessToken: string): Promise<User> => {
    try {
      const response = await fetch('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const userInfo = await response.json();
        return userInfo;
      } else {
        const errorData = await response.json();
        console.error('Get user info failed:', errorData);
        throw new Error('Failed to get user info');
      }
    } catch (error) {
      console.error('Get user info error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await clearStoredAuth();
      setUser(null);
      setError(null);
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearStoredAuth = async () => {
    try {
      await SecureStore.deleteItemAsync('discord_access_token');
      await SecureStore.deleteItemAsync('discord_refresh_token');
      await SecureStore.deleteItemAsync('discord_user');
    } catch (error) {
      console.error('Clear stored auth error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
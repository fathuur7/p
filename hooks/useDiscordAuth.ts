
import { makeRedirectUri } from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const baseUrl = 'http://192.168.1.52:3000';

interface User {
  id: string;
  discordId: string;
  username: string;
  email?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
}

interface AuthError {
  message: string;
  code?: string;
}

export const useDiscordAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    token: null,
  });

  const [error, setError] = useState<AuthError | null>(null);

  // Initialize auth state from secure storage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const token = await SecureStore.getItemAsync('discord_token');
      
      if (token) {
        // Verify token and get user info
        const userProfile = await fetchUserProfile(token);
        if (userProfile) {
          setAuthState({
            user: userProfile,
            isLoading: false,
            isAuthenticated: true,
            token,
          });
        } else {
          // Token might be expired, clear it
          await SecureStore.deleteItemAsync('discord_token');
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
            token: null,
          });
        }
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          token: null,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        token: null,
      });
    }
  };

  const fetchUserProfile = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch(`${baseUrl}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data.user;
      }
      
      return null;
    } catch (error) {
      console.error('Fetch user profile error:', error);
      return null;
    }
  };

  const login = useCallback(async () => {
    try {
      setError(null);
      setAuthState(prev => ({ ...prev, isLoading: true }));

      // Determine redirect URI based on platform
      let redirectUri: string;
      
      if (Platform.OS === 'web') {
        // For web, use the current origin
        redirectUri = `${window.location.origin}/auth/callback`;
      } else {
        // For mobile, use the app scheme
        redirectUri = makeRedirectUri({ scheme: 'akademi-crypto' });
      }

      console.log('Platform:', Platform.OS);
      console.log('Redirect URI:', redirectUri);

      // Get Discord OAuth URL with custom redirect URI
      const authUrlResponse = await fetch(`${baseUrl}/api/auth/discord/url?redirect_uri=${encodeURIComponent(redirectUri)}`);
      
      if (!authUrlResponse.ok) {
        const errorText = await authUrlResponse.text();
        throw new Error(`Failed to get auth URL: ${authUrlResponse.status} - ${errorText}`);
      }
      
      const { authUrl } = await authUrlResponse.json();
      console.log('Auth URL received:', authUrl);

      // Open Discord OAuth in browser
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );
      
      console.log('WebBrowser result:', result);
      
      if (result.type === 'success') {
        // Extract code from URL
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        
        if (error) {
          throw new Error(`Discord OAuth error: ${error}`);
        }

        if (code) {
          console.log('Authorization code received:', code.substring(0, 10) + '...');
          
          // Exchange code for token
          const tokenResponse = await fetch(`${baseUrl}/api/auth/discord/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          console.log('Token response status:', tokenResponse.status);
          
          if (tokenResponse.ok) {
            const tokenData = await tokenResponse.json();
            console.log('Token exchange successful');
            
            // Store token securely
            await SecureStore.setItemAsync('discord_token', tokenData.token);
            
            setAuthState({
              user: tokenData.user,
              isLoading: false,
              isAuthenticated: true,
              token: tokenData.token,
            });
          } else {
            const errorData = await tokenResponse.json().catch(() => ({}));
            console.error('Token exchange failed:', errorData);
            throw new Error(`Failed to exchange code for token: ${JSON.stringify(errorData)}`);
          }
        } else {
          throw new Error('No authorization code received from Discord');
        }
      } else if (result.type === 'cancel') {
        console.log('User cancelled authentication');
        setError({ message: 'Authentication cancelled' });
        setAuthState(prev => ({ ...prev, isLoading: false }));
      } else {
        console.error('Authentication failed with result:', result);
        throw new Error(`Authentication failed: ${result.type}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError({ 
        message: error instanceof Error ? error.message : 'Login failed' 
      });
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync('discord_token');
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        token: null,
      });
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const currentToken = await SecureStore.getItemAsync('discord_token');
      if (!currentToken) return false;

      const userProfile = await fetchUserProfile(currentToken);
      
      if (userProfile) {
        setAuthState(prev => ({
          ...prev,
          user: userProfile,
          isAuthenticated: true,
          token: currentToken,
        }));
        return true;
      } else {
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      await logout();
      return false;
    }
  }, [logout]);

  return {
    ...authState,
    login,
    logout,
    refreshToken,
    error,
    clearError: () => setError(null),
  };
};
// hooks/useUserProfile.ts
import { useCallback, useEffect, useState } from 'react';
import { useApi } from './useApi';
import { useDiscordAuth } from './useDiscordAuth';

interface UserProfile {
  id: string;
  discordId: string;
  username: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export const useUserProfile = () => {
  const { apiCall } = useApi();
  const { isAuthenticated } = useDiscordAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiCall('/api/user/profile');
      setProfile(data.user);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, apiCall]);

  const updateProfile = useCallback(async (updates: { username?: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await apiCall('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      
      setProfile(data.user);
      return data.user;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update profile');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    clearError: () => setError(null),
  };
};

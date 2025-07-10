
import React from 'react';
import { Text } from 'react-native';
import { useAuth } from '../components/AuthProvider';
import { LoginScreen } from '../components/LoginScreen';
import { ProfileScreen } from '../components/ProfileScreen';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  console.log('isAuthenticated:', isAuthenticated);
  console.log('isLoading:', isLoading);

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return isAuthenticated ? <ProfileScreen /> : <LoginScreen />;
};

export default function App() {
  return (
    // <AuthProvider>
      <AppContent />
    // </AuthProvider>
  );
}
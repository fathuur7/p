import { ClerkProvider } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!
if (!publishableKey) {
  throw new Error('EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is not defined in .env');
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Home' }} />
        <Stack.Screen name="profile" options={{ title: 'Profile' }} />
      </Stack>
    </ClerkProvider>
  )
}
import { useAuth, useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const router = useRouter();


export default function Home() {
  const { isSignedIn } = useAuth()
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_discord' })

  const handleDiscordAuth = async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow()
      
      if (createdSessionId) {
        if (setActive) {
          setActive({ session: createdSessionId })
        }
      } else {
        // Gunakan signIn atau signUp untuk proses lebih lanjut
        console.log('Auth flow completed')
      }
    } catch (err) {
      console.error('OAuth error:', err)
    }
  }

  if (isSignedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome! You're signed in</Text>
        <Pressable 
          style={styles.button}
          onPress={() => {
            router.push('/profile')
          }}
        >
          <Text style={styles.buttonText}>Go to Profile</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Discord Auth</Text>
      <Pressable 
        style={styles.discordButton}
        onPress={handleDiscordAuth}
      >
        <Text style={styles.buttonText}>Sign in with Discord</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  discordButton: {
    backgroundColor: '#5865F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
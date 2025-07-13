import { useAuth, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';


export default function Profile() {
  const { user, isLoaded } = useUser()
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/')
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out')
      console.error('Sign out error:', error)
    }
  }

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    )
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No User Data</Text>
        <Pressable 
          style={styles.button}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </Pressable>
      </View>
    )
  }

  // Ambil data Discord dari external accounts
  const discordAccount = user.externalAccounts?.find(account => account.provider === 'discord')

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Discord Profile</Text>
        
        {/* Discord Profile Image */}
        {(discordAccount?.imageUrl || user.imageUrl) && (
          <Image 
            source={{ uri: discordAccount?.imageUrl || user.imageUrl }} 
            style={styles.profileImage}
            onError={() => console.log('Failed to load profile image')}
          />
        )}

        {/* Discord Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎮 Discord Information</Text>
          
          {/* Discord Username */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.value}>
              {discordAccount?.username || user.username || 'N/A'}
            </Text>
          </View>

          {/* Discord Display Name */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Display Name:</Text>
            <Text style={styles.value}>
              {discordAccount?.firstName || user.firstName || 'N/A'}
            </Text>
          </View>

          {/* Discord ID */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Discord ID:</Text>
            <Text style={styles.value}>
              {discordAccount?.providerUserId || 'N/A'}
            </Text>
          </View>

          {/* Discord Email */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>
              {discordAccount?.emailAddress || user.primaryEmailAddress?.emailAddress || 'N/A'}
            </Text>
          </View>

          {/* Discord Avatar URL */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Avatar URL:</Text>
            <Text style={styles.value} numberOfLines={1}>
              {discordAccount?.imageUrl || 'N/A'}
            </Text>
          </View>

          {/* Account Created */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Account Created:</Text>
            <Text style={styles.value}>
              {discordAccount?.createdAt?.toLocaleDateString() || user.createdAt?.toLocaleDateString() || 'N/A'}
            </Text>
          </View>

          {/* Verification Status */}
          <View style={styles.infoRow}>
            <Text style={styles.label}>Verified:</Text>
            <Text style={[styles.value, styles.verifiedText]}>
              {discordAccount?.verification?.status === 'verified' ? '✅ Verified' : '❌ Not Verified'}
            </Text>
          </View>
        </View>

        {/* Discord Metadata (jika ada) */}
        {discordAccount?.publicMetadata && Object.keys(discordAccount.publicMetadata).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Discord Metadata</Text>
            
            {/* Discriminator (untuk Discord lama) */}
            {discordAccount.publicMetadata.discriminator && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Discriminator:</Text>
                <Text style={styles.value}>
                  #{discordAccount.publicMetadata.discriminator}
                </Text>
              </View>
            )}

            {/* MFA Enabled */}
            {discordAccount.publicMetadata.mfa_enabled !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>MFA Enabled:</Text>
                <Text style={styles.value}>
                  {discordAccount.publicMetadata.mfa_enabled ? '✅ Yes' : '❌ No'}
                </Text>
              </View>
            )}

            {/* Locale */}
            {discordAccount.publicMetadata.locale && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Locale:</Text>
                <Text style={styles.value}>
                  {discordAccount.publicMetadata.locale}
                </Text>
              </View>
            )}

            {/* Premium Type */}
            {discordAccount.publicMetadata.premium_type !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Premium Type:</Text>
                <Text style={styles.value}>
                  {discordAccount.publicMetadata.premium_type === 0 ? 'None' : 
                   discordAccount.publicMetadata.premium_type === 1 ? 'Nitro Classic' :
                   discordAccount.publicMetadata.premium_type === 2 ? 'Nitro' :
                   discordAccount.publicMetadata.premium_type === 3 ? 'Nitro Basic' : 'Unknown'}
                </Text>
              </View>
            )}

            {/* Flags */}
            {discordAccount.publicMetadata.flags !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Flags:</Text>
                <Text style={styles.value}>
                  {discordAccount.publicMetadata.flags}
                </Text>
              </View>
            )}

            {/* Public Flags */}
            {discordAccount.publicMetadata.public_flags !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Public Flags:</Text>
                <Text style={styles.value}>
                  {discordAccount.publicMetadata.public_flags}
                </Text>
              </View>
            )}

            {/* Bot Status */}
            {discordAccount.publicMetadata.bot !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Bot Account:</Text>
                <Text style={styles.value}>
                  {discordAccount.publicMetadata.bot ? '🤖 Yes' : '👤 No'}
                </Text>
              </View>
            )}

            {/* System Status */}
            {discordAccount.publicMetadata.system !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>System Account:</Text>
                <Text style={styles.value}>
                  {discordAccount.publicMetadata.system ? '⚙️ Yes' : '👤 No'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Session Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔐 Session Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>User ID:</Text>
            <Text style={styles.value}>{user.id}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Last Sign In:</Text>
            <Text style={styles.value}>
              {user.lastSignInAt?.toLocaleString() || 'N/A'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Profile Updated:</Text>
            <Text style={styles.value}>
              {user.updatedAt?.toLocaleString() || 'N/A'}
            </Text>
          </View>
        </View>

        {/* Debug Info (hanya jika tidak ada Discord account) */}
        {!discordAccount && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Debug Info</Text>
            <Text style={styles.debugText}>
              No Discord account found. Available external accounts:
            </Text>
            {user.externalAccounts?.map((account, index) => (
              <Text key={index} style={styles.debugText}>
                • {account.provider}
              </Text>
            )) || <Text style={styles.debugText}>No external accounts</Text>}
          </View>
        )}

        {/* Sign Out Button */}
        <Pressable 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.buttonText}>Sign Out</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#5865F2',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#5865F2',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
    borderBottomWidth: 2,
    borderBottomColor: '#5865F2',
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 120,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  verifiedText: {
    fontWeight: '600',
  },
  debugText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
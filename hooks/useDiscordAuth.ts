import { useOAuth } from '@clerk/clerk-expo'
import { useCallback } from 'react'

export const useDiscordAuth = () => {
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_discord' })

  const signInWithDiscord = useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow()
      
      if (createdSessionId) {
        if (setActive) {
          setActive({ session: createdSessionId })
        }
        return { success: true }
      } else {
        // Handle sign-in or sign-up
        return { success: false, signIn, signUp }
      }
    } catch (error) {
      console.error('Discord OAuth error:', error)
      return { success: false, error }
    }
  }, [startOAuthFlow])

  return { signInWithDiscord }
}
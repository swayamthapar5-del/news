import React, { useState } from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { useSocialLogin } from '../hooks/useSocialMedia'

interface SocialLoginProps {
  onSuccess?: (user: any) => void
  onError?: (error: string) => void
}

const SocialLogin: React.FC<SocialLoginProps> = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { getProviders } = useSocialLogin()

  const providers = getProviders()

  const handleSocialLogin = async (provider: any) => {
    setLoading(provider.id)
    setError(null)
    
    try {
      // In a real implementation, this would redirect to the OAuth provider
      // For demo purposes, we'll simulate the OAuth flow
      const authUrl = `${provider.authUrl}?client_id=demo_client_id&redirect_uri=${encodeURIComponent(window.location.origin)}&response_type=code&scope=${provider.scopes.join(' ')}`
      
      // Open OAuth popup
      const popup = window.open(authUrl, 'social-login', 'width=500,height=600,scrollbars=yes,resizable=yes')
      
      // Listen for popup close
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          setLoading(null)
          setError('Login was cancelled')
        }
      }, 1000)
      
      // Simulate successful OAuth callback
      setTimeout(() => {
        clearInterval(checkClosed)
        popup?.close()
        
        // Mock authentication result
        const mockUser = {
          id: `user_${provider.id}_${Date.now()}`,
          name: `Demo User (${provider.displayName})`,
          email: `demo@${provider.id}.com`,
          avatar: `https://picsum.photos/seed/${provider.id}/100/100.jpg`,
          provider: provider.id,
          verified: true
        }
        
        setLoading(null)
        onSuccess?.(mockUser)
      }, 3000)
      
    } catch (err) {
      setLoading(null)
      const errorMessage = `Failed to authenticate with ${provider.displayName}`
      setError(errorMessage)
      onError?.(errorMessage)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In with Social Media</h3>
          <p className="text-sm text-gray-600">
            Connect your social accounts to personalize your news experience
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-600" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}

        <div className="space-y-3">
          {providers.map(provider => (
            <button
              key={provider.id}
              onClick={() => handleSocialLogin(provider)}
              disabled={loading === provider.id}
              className={`w-full flex items-center justify-center space-x-3 px-4 py-3 border rounded-lg transition-all duration-200 ${
                loading === provider.id
                  ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                  : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
              style={{ borderColor: loading === provider.id ? undefined : provider.color }}
            >
              {loading === provider.id ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className="w-5 h-5 flex items-center justify-center">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: provider.color }}
                  ></div>
                </div>
              )}
              <span className={`font-medium ${
                loading === provider.id ? 'text-gray-400' : 'text-gray-700'
              }`}>
                Continue with {provider.displayName}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Benefits of Social Login</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle size={16} className="text-green-600" />
                <span>Personalized news recommendations</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle size={16} className="text-green-600" />
                <span>Share articles across platforms</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle size={16} className="text-green-600" />
                <span>Join community discussions</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle size={16} className="text-green-600" />
                <span>Save and bookmark articles</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default SocialLogin

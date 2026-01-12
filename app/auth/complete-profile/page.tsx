'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, Languages, AlertCircle, User, Users } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { getRedirectUrl } from '@/lib/auth-utils'
import { getApiUrl } from '@/lib/api-config'

const COUNTRIES = [
  'Iceland',
]

const LANGUAGE_OPTIONS = [
  'English',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Dutch',
  'Chinese',
  'Japanese',
  'Korean',
  'Arabic',
  'Hindi',
  'Russian',
  'Turkish',
  'Polish',
  'Swedish',
  'Norwegian',
  'Danish',
  'Finnish',
  'Greek',
  'Czech',
  'Hungarian',
  'Romanian',
  'Other',
]

export default function CompleteProfilePage() {
  const router = useRouter()
  const { user, loading, refreshUser } = useAuth()
  const [formData, setFormData] = useState({
    role: 'guest' as 'guest' | 'host',
    gender: '',
    country: '',
    language: 'English',
  })
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if not authenticated or profile already complete
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/signin')
        return
      }
      if (!user.needsProfileCompletion) {
        const redirectUrl = getRedirectUrl(user)
        router.push(redirectUrl)
      } else {
        // Pre-fill form with existing data if available
        setFormData({
          role: (user.role as 'guest' | 'host') || 'guest',
          gender: user.gender || '',
          country: user.country || '',
          language: user.languages && user.languages.length > 0 ? user.languages[0] : 'English',
        })
      }
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')

    // Validation
    if (!formData.role || !formData.gender || !formData.country || !formData.language) {
      setError('Please fill in all required fields')
      setFormLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      if (!token || !user) {
        setError('Authentication required. Please sign in again.')
        router.push('/auth/signin')
        return
      }

      // First update role
      const roleResponse = await fetch(getApiUrl('/auth/update-role'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: formData.role,
        }),
      })

      if (!roleResponse.ok) {
        const roleResult = await roleResponse.json()
        setError(roleResult.error || 'Failed to update role. Please try again.')
        setFormLoading(false)
        return
      }

      // Then update profile details
      const response = await fetch(getApiUrl(`/users/${user.id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gender: formData.gender,
          country: formData.country,
          languages: [formData.language],
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Failed to update profile. Please try again.')
        setFormLoading(false)
        return
      }

      // Refresh user data
      await refreshUser()

      // Get updated user and redirect
      const updatedUser = await fetch(getApiUrl('/auth/current-user'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json())

      if (updatedUser.success && updatedUser.data) {
        const redirectUrl = getRedirectUrl(updatedUser.data)
        router.push(redirectUrl)
        router.refresh()
      } else {
        // Fallback redirect
        router.push('/')
      }
    } catch (error: any) {
      console.error('Profile update error:', error)
      setError('An unexpected error occurred. Please try again.')
      setFormLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <div className="w-full max-w-2xl bg-card rounded-2xl shadow-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold leading-tight text-foreground mb-2 text-center">
          Complete Your Profile
        </h2>
        <p className="text-muted-foreground text-center mb-6">
          Please provide some additional information to continue
        </p>

        {error && (
          <div className="mb-4 bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-destructive text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              I am registering as *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center p-4 bg-muted rounded-xl cursor-pointer hover:bg-muted/80 transition">
                <input
                  type="radio"
                  name="role"
                  value="guest"
                  checked={formData.role === 'guest'}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value as 'guest' | 'host' }))
                  }
                  className="mr-3 text-primary-600"
                  required
                />
                <Users className="w-5 h-5 mr-2 text-primary-600" />
                <span className="font-medium">Guest (Diner)</span>
              </label>
              <label className="flex items-center p-4 bg-muted rounded-xl cursor-pointer hover:bg-muted/80 transition">
                <input
                  type="radio"
                  name="role"
                  value="host"
                  checked={formData.role === 'host'}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value as 'guest' | 'host' }))
                  }
                  className="mr-3 text-primary-600"
                  required
                />
                <User className="w-5 h-5 mr-2 text-primary-600" />
                <span className="font-medium">Host (Owner)</span>
              </label>
            </div>
          </div>

          {/* Gender Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Gender *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData((prev) => ({ ...prev, gender: e.target.value }))}
              className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              required
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          {/* Country Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Globe className="inline w-4 h-4 mr-2" />
              Country *
            </label>
            <select
              value={formData.country}
              onChange={(e) => setFormData((prev) => ({ ...prev, country: e.target.value }))}
              className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              required
            >
              <option value="">Select country</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* Language Field */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              <Languages className="inline w-4 h-4 mr-2" />
              Language *
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData((prev) => ({ ...prev, language: e.target.value }))}
              className="w-full px-4 py-3 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              required
            >
              <option value="">Select language</option>
              {LANGUAGE_OPTIONS.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={formLoading}
            className="w-full bg-primary-600 text-white py-2.5 rounded-xl text-base font-semibold leading-normal hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
          >
            {formLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating profile...
              </div>
            ) : (
              'Continue'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

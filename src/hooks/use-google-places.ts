import { useState, useEffect, useRef } from 'react'

declare global {
  interface Window {
    google?: any
  }
}

// Singleton promise to track loading state across component mounts
// Typescript doesn't garbage collect this module variable so it persists during client navigation
let googlePlacesScriptPromise: Promise<void> | null = null

export function useGooglePlaces() {
  const [googlePlacesLoaded, setGooglePlacesLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Refs to hold services so they persist across re-renders
  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)

  useEffect(() => {
    let isMounted = true

    const initializeServices = () => {
      if (!isMounted) return

      try {
        if (!window.google?.maps?.places) {
          // Should not happen if promise resolved correctly
          console.warn('Google Places script loaded but window.google.maps.places is missing')
          setError('Google Places API loaded but library is missing')
          return
        }

        if (!autocompleteServiceRef.current) {
          autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService()
        }

        if (!placesServiceRef.current) {
          // PlacesService requires a container (map or div)
          const dummyDiv = document.createElement('div')
          placesServiceRef.current = new window.google.maps.places.PlacesService(dummyDiv)
        }

        setGooglePlacesLoaded(true)
      } catch (err: any) {
        console.error('Error initializing Google Places services:', err)
        setError(err.message || 'Failed to initialize Google Places')
      }
    }

    const loadGooglePlaces = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY

      if (!apiKey) {
        console.warn('Google Places API key is not set.')
        if (isMounted) setError('API Key missing')
        return
      }

      // 1. If global object exists, we are done
      if (typeof window !== 'undefined' && window.google?.maps?.places) {
        initializeServices()
        return
      }

      // 2. If a loading promise exists (started by another component instance), wait for it
      if (googlePlacesScriptPromise) {
        try {
          await googlePlacesScriptPromise
          initializeServices()
        } catch (err) {
          console.error('Error waiting for existing Google Places script promise:', err)
        }
        return
      }

      // 3. Start loading
      googlePlacesScriptPromise = new Promise((resolve, reject) => {
        // Double check inside promise
        if (window.google?.maps?.places) {
          resolve()
          return
        }

        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
        if (existingScript) {
          // If script is in DOM but object not ready, poll for it
          const checkInterval = setInterval(() => {
            if (window.google?.maps?.places) {
              clearInterval(checkInterval)
              resolve()
            }
          }, 100)

          // Timeout after 10s
          setTimeout(() => {
            clearInterval(checkInterval)
            // Don't reject, just let it be - maybe it loads later
            if (!window.google?.maps?.places) console.warn('Timeout waiting for existing script')
          }, 10000)
          return
        }

        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=en&loading=async`
        script.async = true
        script.defer = true

        script.onload = () => {
          // Even after onload, sometimes it takes a tick
          const checkInterval = setInterval(() => {
            if (window.google?.maps?.places) {
              clearInterval(checkInterval)
              resolve()
            }
          }, 50)

          setTimeout(() => clearInterval(checkInterval), 5000)
        }

        script.onerror = (err) => {
          googlePlacesScriptPromise = null // Reset so we can retry later
          reject(err)
        }

        document.head.appendChild(script)
      })

      // Wait for the promise we just started
      try {
        await googlePlacesScriptPromise
        initializeServices()
      } catch (err: any) {
        console.error('Failed to load Google Places script:', err)
        if (isMounted) setError(err.message || 'Failed to load script')
      }
    }

    loadGooglePlaces()

    return () => {
      isMounted = false
    }
  }, [])

  return { googlePlacesLoaded, error, autocompleteServiceRef, placesServiceRef }
}

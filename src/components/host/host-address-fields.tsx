'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useGooglePlaces } from '@/hooks/use-google-places'
import { cn } from '@/components/ui/utils'

// Iceland-only marketplace: only Icelandic residents can host, and only inside
// Iceland — so the country is fixed and Google Places is always restricted to IS.
const COUNTRY_LABEL = 'Iceland'
const COUNTRY_CODE = 'IS'

type Field = 'city' | 'region' | 'address'

export interface HostAddressValue {
  city: string
  region: string // stored as `hostState`
  address: string
  zipCode: string
}

interface HostAddressFieldsProps {
  value: HostAddressValue
  onChange: (next: HostAddressValue) => void
  /** When false, renders a read-only summary instead of editable inputs. */
  editing?: boolean
}

interface SuggestionListProps {
  suggestions: google.maps.places.AutocompletePrediction[]
  onSelect: (placeId: string, description: string) => void
  listRef: React.RefObject<HTMLDivElement | null>
}

function SuggestionList({ suggestions, onSelect, listRef }: SuggestionListProps) {
  return (
    <div
      ref={listRef}
      className="absolute z-[100] mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
    >
      {suggestions.map((suggestion, index) => (
        <button
          key={suggestion.place_id}
          type="button"
          onClick={() => onSelect(suggestion.place_id, suggestion.description)}
          className={cn(
            'w-full px-4 py-3 text-left transition-colors hover:bg-gray-50',
            index === 0 && 'rounded-t-xl',
            index === suggestions.length - 1 && 'rounded-b-xl'
          )}
        >
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-gray-900">
                {suggestion.structured_formatting.main_text}
              </div>
              <div className="truncate text-xs text-gray-500">
                {suggestion.structured_formatting.secondary_text}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

export function HostAddressFields({ value, onChange, editing = true }: HostAddressFieldsProps) {
  const { googlePlacesLoaded, autocompleteServiceRef, placesServiceRef } = useGooglePlaces()

  const [citySuggestions, setCitySuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([])
  const [regionSuggestions, setRegionSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([])
  const [addressSuggestions, setAddressSuggestions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([])
  // Only the focused field shows its dropdown, so a list never lingers after a
  // pick and pre-filled fields don't all pop open at once when revisiting the step.
  const [activeField, setActiveField] = useState<Field | null>(null)
  // Address suggestions are biased to the chosen city so hosts get their own street.
  const [cityBounds, setCityBounds] = useState<google.maps.LatLngBounds | null>(null)

  const cityInputRef = useRef<HTMLInputElement>(null)
  const cityListRef = useRef<HTMLDivElement>(null)
  const regionInputRef = useRef<HTMLInputElement>(null)
  const regionListRef = useRef<HTMLDivElement>(null)
  const addressInputRef = useRef<HTMLInputElement>(null)
  const addressListRef = useRef<HTMLDivElement>(null)

  const update = (patch: Partial<HostAddressValue>) => onChange({ ...value, ...patch })

  // Close the open suggestion list when clicking outside every field.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const within = (
        list: React.RefObject<HTMLDivElement | null>,
        input: React.RefObject<HTMLInputElement | null>
      ) =>
        (list.current?.contains(event.target as Node) ?? false) ||
        (input.current?.contains(event.target as Node) ?? false)

      if (
        !within(cityListRef, cityInputRef) &&
        !within(regionListRef, regionInputRef) &&
        !within(addressListRef, addressInputRef)
      ) {
        setActiveField(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // City autocomplete (cities within Iceland).
  useEffect(() => {
    if (!googlePlacesLoaded || !autocompleteServiceRef.current || !value.city.trim()) {
      setCitySuggestions([])
      return
    }
    const timeoutId = setTimeout(() => {
      autocompleteServiceRef.current?.getPlacePredictions(
        {
          input: value.city,
          componentRestrictions: { country: COUNTRY_CODE },
          types: ['(cities)'],
        },
        (predictions, status) => {
          const ok = status === google.maps.places.PlacesServiceStatus.OK && predictions
          setCitySuggestions(ok ? predictions : [])
        }
      )
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [value.city, googlePlacesLoaded])

  // Region autocomplete (administrative regions within Iceland). Optional field.
  useEffect(() => {
    if (!googlePlacesLoaded || !autocompleteServiceRef.current || !value.region.trim()) {
      setRegionSuggestions([])
      return
    }
    const timeoutId = setTimeout(() => {
      autocompleteServiceRef.current?.getPlacePredictions(
        {
          input: value.region,
          componentRestrictions: { country: COUNTRY_CODE },
          types: ['(regions)'],
        },
        (predictions, status) => {
          const ok = status === google.maps.places.PlacesServiceStatus.OK && predictions
          setRegionSuggestions(ok ? predictions : [])
        }
      )
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [value.region, googlePlacesLoaded])

  // Street address autocomplete, biased to the selected city when available.
  useEffect(() => {
    if (!googlePlacesLoaded || !autocompleteServiceRef.current || !value.address.trim()) {
      setAddressSuggestions([])
      return
    }
    const timeoutId = setTimeout(() => {
      const request: google.maps.places.AutocompletionRequest = {
        input: value.address,
        types: ['address'],
        componentRestrictions: { country: COUNTRY_CODE },
      }
      if (cityBounds) {
        request.bounds = cityBounds
      }
      autocompleteServiceRef.current?.getPlacePredictions(request, (predictions, status) => {
        const ok = status === google.maps.places.PlacesServiceStatus.OK && predictions
        setAddressSuggestions(ok ? predictions : [])
      })
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [value.address, cityBounds, googlePlacesLoaded])

  const handleSelectCity = (placeId: string, description: string) => {
    setActiveField(null)
    setCitySuggestions([])
    if (!placesServiceRef.current) {
      update({ city: description })
      return
    }
    placesServiceRef.current.getDetails(
      { placeId, fields: ['address_components', 'name', 'geometry'] },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) return
        if (place.geometry?.viewport) setCityBounds(place.geometry.viewport)
        const cityComponent = place.address_components?.find(
          (c) =>
            c.types.includes('locality') || c.types.includes('administrative_area_level_1')
        )
        update({ city: cityComponent?.long_name || place.name || description })
      }
    )
  }

  const handleSelectRegion = (placeId: string, description: string) => {
    setActiveField(null)
    setRegionSuggestions([])
    if (!placesServiceRef.current) {
      update({ region: description })
      return
    }
    placesServiceRef.current.getDetails(
      { placeId, fields: ['address_components', 'name'] },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) return
        const regionComponent = place.address_components?.find(
          (c) =>
            c.types.includes('administrative_area_level_1') ||
            c.types.includes('administrative_area_level_2')
        )
        update({ region: regionComponent?.long_name || place.name || description })
      }
    )
  }

  const handleSelectAddress = (placeId: string, description: string) => {
    setActiveField(null)
    setAddressSuggestions([])
    if (!placesServiceRef.current) {
      update({ address: description })
      return
    }
    placesServiceRef.current.getDetails(
      { placeId, fields: ['address_components', 'name', 'formatted_address'] },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) return
        const route =
          place.address_components?.find((c) => c.types.includes('route'))?.long_name || ''
        const streetNum =
          place.address_components?.find((c) => c.types.includes('street_number'))?.long_name ||
          ''
        const zip =
          place.address_components?.find((c) => c.types.includes('postal_code'))?.long_name || ''
        const streetAddr = streetNum && route ? `${streetNum} ${route}` : place.name || description
        update({ address: streetAddr, zipCode: zip || value.zipCode })
      }
    )
  }

  if (!editing) {
    const Display = ({ label, text }: { label: string; text: string }) => (
      <div>
        <p className="mb-1 text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">
          {text || <span className="italic text-muted-foreground/70">Not added</span>}
        </p>
      </div>
    )
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Display label="Country" text={COUNTRY_LABEL} />
        <Display label="City" text={value.city} />
        <Display label="Region" text={value.region} />
        <Display label="Street Address" text={value.address} />
        <Display label="ZIP Code" text={value.zipCode} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Country — fixed, Iceland only */}
      <div className="space-y-1.5">
        <Label>Country</Label>
        <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground">
          {COUNTRY_LABEL}
        </div>
      </div>

      {/* City */}
      <div className="space-y-1.5">
        <Label htmlFor="host-city">City *</Label>
        <div className="relative">
          <Input
            id="host-city"
            ref={cityInputRef}
            value={value.city}
            onChange={(e) => update({ city: e.target.value })}
            onFocus={() => setActiveField('city')}
            placeholder="Reykjavík"
            autoComplete="off"
          />
          {activeField === 'city' && citySuggestions.length > 0 && (
            <SuggestionList
              suggestions={citySuggestions}
              onSelect={handleSelectCity}
              listRef={cityListRef}
            />
          )}
        </div>
      </div>

      {/* Region — optional */}
      <div className="space-y-1.5">
        <Label htmlFor="host-region">Region (optional)</Label>
        <div className="relative">
          <Input
            id="host-region"
            ref={regionInputRef}
            value={value.region}
            onChange={(e) => update({ region: e.target.value })}
            onFocus={() => setActiveField('region')}
            placeholder="Capital Region"
            autoComplete="off"
          />
          {activeField === 'region' && regionSuggestions.length > 0 && (
            <SuggestionList
              suggestions={regionSuggestions}
              onSelect={handleSelectRegion}
              listRef={regionListRef}
            />
          )}
        </div>
      </div>

      {/* Street Address */}
      <div className="space-y-1.5">
        <Label htmlFor="host-address">Street Address *</Label>
        <div className="relative">
          <Input
            id="host-address"
            ref={addressInputRef}
            value={value.address}
            onChange={(e) => update({ address: e.target.value })}
            onFocus={() => setActiveField('address')}
            placeholder="Laugavegur 1"
            autoComplete="off"
          />
          {activeField === 'address' && addressSuggestions.length > 0 && (
            <SuggestionList
              suggestions={addressSuggestions}
              onSelect={handleSelectAddress}
              listRef={addressListRef}
            />
          )}
        </div>
      </div>

      {/* ZIP */}
      <div className="space-y-1.5">
        <Label htmlFor="host-zip">ZIP Code</Label>
        <Input
          id="host-zip"
          value={value.zipCode}
          onChange={(e) => update({ zipCode: e.target.value })}
          placeholder="101"
          autoComplete="off"
        />
      </div>

      {!googlePlacesLoaded && (
        <p className="text-xs text-muted-foreground md:col-span-2">Google Places loading…</p>
      )}
    </div>
  )
}

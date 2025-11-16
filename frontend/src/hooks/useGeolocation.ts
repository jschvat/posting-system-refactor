/**
 * useGeolocation Hook
 * 
 * Handles browser geolocation API and reverse geocoding using OpenStreetMap Nominatim.
 * Provides auto-detection, loading/error states, and location data (coords + address).
 * 
 * @example
 * // Auto-detect on mount with reverse geocoding
 * const { location, loading, error, detectLocation } = useGeolocation({
 *   autoDetect: true,
 *   enableReverseGeocoding: true,
 *   onSuccess: (loc) => console.log('Detected:', loc)
 * });
 */

import { useState, useEffect, useCallback } from 'react';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

export interface UseGeolocationOptions {
  autoDetect?: boolean;
  enableReverseGeocoding?: boolean;
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  onSuccess?: (location: GeolocationData) => void;
  onError?: (error: string) => void;
}

export interface UseGeolocationReturn {
  location: GeolocationData | null;
  loading: boolean;
  error: string | null;
  isDetected: boolean;
  detectLocation: () => Promise<void>;
  clearLocation: () => void;
}

export const useGeolocation = (options: UseGeolocationOptions = {}): UseGeolocationReturn => {
  const {
    autoDetect = false,
    enableReverseGeocoding = true,
    enableHighAccuracy = true,
    maximumAge = 0,
    timeout = 10000,
    onSuccess,
    onError
  } = options;

  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDetected, setIsDetected] = useState(false);

  const reverseGeocode = async (
    latitude: number,
    longitude: number
  ): Promise<Partial<GeolocationData>> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
        {
          headers: {
            'User-Agent': 'MarketplaceApp/1.0'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        city: data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.county ||
              '',
        state: data.address.state || '',
        zip: data.address.postcode || '',
        country: data.address.country || ''
      };
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      return {
        city: '',
        state: '',
        zip: '',
        country: ''
      };
    }
  };

  const detectLocation = useCallback(async (): Promise<void> => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by this browser';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        try {
          let locationData: GeolocationData = {
            latitude,
            longitude,
            accuracy: Math.round(accuracy)
          };

          if (enableReverseGeocoding) {
            const geocodedData = await reverseGeocode(latitude, longitude);
            locationData = { ...locationData, ...geocodedData };
          }

          setLocation(locationData);
          setIsDetected(true);
          setLoading(false);
          onSuccess?.(locationData);
        } catch (err) {
          console.error('Error processing location:', err);
          const locationData: GeolocationData = {
            latitude,
            longitude,
            accuracy: Math.round(accuracy)
          };
          setLocation(locationData);
          setIsDetected(true);
          setLoading(false);
          onSuccess?.(locationData);
        }
      },
      (err) => {
        let errorMessage = 'Failed to get location';

        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access in your browser settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.';
            break;
          default:
            errorMessage = 'An unknown error occurred while getting location.';
        }

        setError(errorMessage);
        setLoading(false);
        onError?.(errorMessage);
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge
      }
    );
  }, [enableReverseGeocoding, enableHighAccuracy, timeout, maximumAge, onSuccess, onError]);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    setIsDetected(false);
  }, []);

  useEffect(() => {
    if (autoDetect) {
      detectLocation();
    }
  }, [autoDetect, detectLocation]);

  return {
    location,
    loading,
    error,
    isDetected,
    detectLocation,
    clearLocation
  };
};

export default useGeolocation;

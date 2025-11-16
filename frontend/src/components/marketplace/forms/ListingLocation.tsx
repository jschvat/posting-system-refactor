import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Section = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${props.theme.colors.text.primary};
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid ${props.theme.colors.border};
`;

const LocationStatus = styled.div`
  background: ${props.theme.colors.successLight};
  border: 1px solid ${props.theme.colors.success};
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LocationStatusIcon = styled.span`
  font-size: 20px;
`;

const LocationStatusText = styled.div`
  flex: 1;
`;

const LocationStatusTitle = styled.div`
  font-weight: 600;
  color: ${props => props.theme.colors.successDark};
  margin-bottom: 4px;
`;

const LocationStatusSubtitle = styled.div`
  font-size: 13px;
  color: ${props.theme.colors.successDark};
`;

const LocationDetecting = styled.div`
  background: ${props.theme.colors.warningLight};
  border: 1px solid ${props.theme.colors.warning};
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DetectingText = styled.div`
  color: ${props => props.theme.colors.warning};
  font-weight: 500;
`;

const ChangeLocationButton = styled.button`
  background: transparent;
  color: ${props.theme.colors.info};
  border: 1px solid ${props.theme.colors.info};
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${props.theme.colors.info};
    color: ${props.theme.colors.white};
  }
`;

const DetectLocationButton = styled.button`
  background: ${props.theme.colors.info};
  color: ${props.theme.colors.white};
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props.theme.colors.infoDark};
  }

  &:disabled {
    background: ${props.theme.colors.backgroundDisabled};
    cursor: not-allowed;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${props.theme.colors.border};
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props.theme.colors.info};
  }

  &:disabled {
    background: ${props.theme.colors.hover};
    cursor: not-allowed;
  }
`;

const HelpText = styled.p`
  font-size: 13px;
  color: ${props.theme.colors.text.secondary};
  margin: 6px 0 0 0;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

interface ListingLocationProps {
  location: {
    latitude: number | null;
    longitude: number | null;
    city: string;
    state: string;
    country: string;
  };
  onLocationDetected: (location: {
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    zip?: string;
  }) => void;
}

export const ListingLocation: React.FC<ListingLocationProps> = ({
  location,
  onLocationDetected
}) => {
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [locationDetected, setLocationDetected] = useState(false);
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState({
    latitude: 0,
    longitude: 0,
    city: '',
    state: ''
  });
  const [zip, setZip] = useState('');

  // Auto-detect location on mount
  useEffect(() => {
    if (!location.latitude && !location.longitude) {
      detectUserLocation();
    } else {
      setDetectedLocation({
        latitude: location.latitude || 0,
        longitude: location.longitude || 0,
        city: location.city,
        state: location.state
      });
      setLocationDetected(true);
    }
  }, []);

  const detectUserLocation = async () => {
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser');
      return;
    }

    setLocationDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Use reverse geocoding to get city and state from OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                'User-Agent': 'MarketplaceApp/1.0'
              }
            }
          );
          const data = await response.json();

          const city = data.address.city ||
                       data.address.town ||
                       data.address.village ||
                       data.address.county || '';
          const state = data.address.state || '';
          const zipCode = data.address.postcode || '';

          const detectedLoc = {
            latitude,
            longitude,
            city,
            state
          };

          setDetectedLocation(detectedLoc);
          setZip(zipCode);
          setLocationDetected(true);

          // Notify parent component
          onLocationDetected({
            ...detectedLoc,
            zip: zipCode
          });
        } catch (error) {
          console.error('Error getting location name:', error);
          // Still save coordinates even if we can't get the name
          const detectedLoc = {
            latitude,
            longitude,
            city: '',
            state: ''
          };
          setDetectedLocation(detectedLoc);
          setLocationDetected(true);

          onLocationDetected(detectedLoc);
        }

        setLocationDetecting(false);
      },
      (error) => {
        console.log('Location detection declined or failed:', error.message);
        setLocationDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const city = e.target.value;
    if (!useManualLocation) setUseManualLocation(true);

    onLocationDetected({
      latitude: detectedLocation.latitude,
      longitude: detectedLocation.longitude,
      city,
      state: location.state,
      zip
    });
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const state = e.target.value;
    if (!useManualLocation) setUseManualLocation(true);

    onLocationDetected({
      latitude: detectedLocation.latitude,
      longitude: detectedLocation.longitude,
      city: location.city,
      state,
      zip
    });
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const zipCode = e.target.value;
    setZip(zipCode);

    onLocationDetected({
      latitude: detectedLocation.latitude,
      longitude: detectedLocation.longitude,
      city: location.city,
      state: location.state,
      zip: zipCode
    });
  };

  const handleChangeLocation = () => {
    setUseManualLocation(true);
  };

  return (
    <Section>
      <SectionTitle>Location</SectionTitle>

      {locationDetecting && (
        <LocationDetecting>
          <LocationStatusIcon>📍</LocationStatusIcon>
          <DetectingText>Detecting your location...</DetectingText>
        </LocationDetecting>
      )}

      {locationDetected && !useManualLocation && (
        <LocationStatus>
          <LocationStatusIcon>✅</LocationStatusIcon>
          <LocationStatusText>
            <LocationStatusTitle>Location detected</LocationStatusTitle>
            <LocationStatusSubtitle>
              {detectedLocation.city}, {detectedLocation.state}
            </LocationStatusSubtitle>
          </LocationStatusText>
          <ChangeLocationButton
            type="button"
            onClick={handleChangeLocation}
          >
            Change Location
          </ChangeLocationButton>
        </LocationStatus>
      )}

      {(!locationDetected || useManualLocation) && !locationDetecting && (
        <div style={{ marginBottom: '16px' }}>
          <DetectLocationButton
            type="button"
            onClick={detectUserLocation}
            disabled={locationDetecting}
          >
            <span>📍</span>
            <span>Detect My Location</span>
          </DetectLocationButton>
        </div>
      )}

      <Row>
        <FormGroup>
          <Label htmlFor="location_city">City *</Label>
          <Input
            id="location_city"
            name="location_city"
            type="text"
            value={location.city}
            onChange={handleCityChange}
            placeholder="San Francisco"
            required
            disabled={locationDetected && !useManualLocation}
          />
        </FormGroup>

        <FormGroup>
          <Label htmlFor="location_state">State *</Label>
          <Input
            id="location_state"
            name="location_state"
            type="text"
            value={location.state}
            onChange={handleStateChange}
            placeholder="CA"
            maxLength={2}
            required
            disabled={locationDetected && !useManualLocation}
          />
        </FormGroup>
      </Row>

      <FormGroup>
        <Label htmlFor="location_zip">ZIP Code (Optional)</Label>
        <Input
          id="location_zip"
          name="location_zip"
          type="text"
          value={zip}
          onChange={handleZipChange}
          placeholder="94102"
          maxLength={10}
        />
      </FormGroup>
    </Section>
  );
};

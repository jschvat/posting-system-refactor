import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import marketplaceApi from '../../services/marketplaceApi';
import { ImageUpload, ImageFile } from '../../components/marketplace/ImageUpload';
import { ListingBasicInfo } from '../../components/marketplace/forms/ListingBasicInfo';
import { ListingPricing } from '../../components/marketplace/forms/ListingPricing';
import { ListingLocation } from '../../components/marketplace/forms/ListingLocation';
import { useGeolocation } from '../../hooks/useGeolocation';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0;
`;

const Form = styled.form`
  background: ${({ theme }) => theme.colors.white};
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
`;

const Section = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => props.variant === 'primary' ? `
    background: ${({ theme }) => theme.colors.info};
    color: ${({ theme }) => theme.colors.white};

    &:hover:not(:disabled) {
      background: ${({ theme }) => theme.colors.infoDark};
    }
  ` : `
    background: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.text.primary};

    &:hover:not(:disabled) {
      background: ${props => props.theme.colors.border};
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: ${({ theme }) => theme.colors.statusRejectedBg};
  color: ${({ theme }) => theme.colors.errorDark};
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const SuccessMessage = styled.div`
  background: ${({ theme }) => theme.colors.successLight};
  color: ${({ theme }) => theme.colors.successDark};
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
`;

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}

export const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [useManualLocation, setUseManualLocation] = useState(false);

  // Use geolocation hook for automatic location detection
  const {
    location: detectedLocation,
    loading: locationDetecting,
    isDetected: locationDetected,
    detectLocation: detectUserLocation
  } = useGeolocation({
    autoDetect: true,
    enableReverseGeocoding: true,
    onSuccess: (location) => {
      // Auto-fill the form with detected location
      setFormData(prev => ({
        ...prev,
        location_city: location.city || '',
        location_state: location.state || '',
        location_zip: location.zip || ''
      }));
    },
    onError: (error) => {
      console.log('Location detection failed:', error);
    }
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    listing_type: 'sale',
    price: '',
    original_price: '',
    quantity: '1',
    condition: 'used',
    allow_offers: true,
    min_offer_price: '',
    location_city: '',
    location_state: '',
    location_zip: '',
    shipping_available: false,
    shipping_cost: '',
    local_pickup_only: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await marketplaceApi.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Validation
      if (!formData.title || !formData.description) {
        throw new Error('Title and description are required');
      }

      if (!formData.location_city || !formData.location_state) {
        throw new Error('Location is required');
      }

      if (formData.listing_type === 'sale' && !formData.price) {
        throw new Error('Price is required for sale listings');
      }

      // Use detected location coordinates, or geocode if user entered manually
      let latitude = detectedLocation?.latitude || 0;
      let longitude = detectedLocation?.longitude || 0;

      // If user manually entered location and we don't have coordinates, geocode it
      if (useManualLocation && (!latitude || !longitude)) {
        try {
          const geocodeResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(formData.location_city)}&state=${encodeURIComponent(formData.location_state)}&country=USA&format=json&limit=1`,
            {
              headers: {
                'User-Agent': 'MarketplaceApp/1.0'
              }
            }
          );
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.length > 0) {
            latitude = parseFloat(geocodeData[0].lat);
            longitude = parseFloat(geocodeData[0].lon);
          }
        } catch (geocodeError) {
          console.error('Error geocoding location:', geocodeError);
          // Fall back to default coordinates if geocoding fails
          latitude = 37.7749; // Default to SF
          longitude = -122.4194;
        }
      }

      // Validate we have coordinates
      if (!latitude || !longitude) {
        throw new Error('Unable to determine location coordinates. Please allow location access or enter a valid city and state.');
      }

      const listingData = {
        title: formData.title,
        description: formData.description,
        category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
        listing_type: formData.listing_type as 'sale' | 'raffle' | 'auction',
        price: formData.price ? parseFloat(formData.price) : undefined,
        original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
        quantity: parseInt(formData.quantity),
        condition: formData.condition,
        allow_offers: formData.allow_offers,
        min_offer_price: formData.min_offer_price ? parseFloat(formData.min_offer_price) : undefined,
        location_latitude: latitude,
        location_longitude: longitude,
        location_city: formData.location_city,
        location_state: formData.location_state,
        location_zip: formData.location_zip || undefined,
        location_country: 'USA',
        shipping_available: formData.shipping_available,
        shipping_cost: formData.shipping_cost ? parseFloat(formData.shipping_cost) : undefined,
        local_pickup_only: formData.local_pickup_only,
        status: 'active'
      };

      const response = await marketplaceApi.createListing(listingData);

      if (response.success) {
        const listingId = response.data.id;

        // Upload images if any
        if (images.length > 0) {
          setSuccess('Listing created! Uploading images...');

          try {
            // Update upload progress for each image
            const imagesToUpload = images.map(img => img.file);

            // Track overall progress
            let uploadedCount = 0;
            const totalImages = imagesToUpload.length;

            const uploadResponse = await marketplaceApi.uploadImages(
              listingId,
              imagesToUpload,
              (progress) => {
                // Update progress for current image
                const overallProgress = ((uploadedCount * 100) + progress) / totalImages;
                console.log(`Upload progress: ${Math.round(overallProgress)}%`);
              }
            );

            if (uploadResponse.success) {
              setSuccess(`Listing created with ${uploadResponse.data.length} image(s)!`);
            }
          } catch (uploadError: any) {
            console.error('Error uploading images:', uploadError);
            setError('Listing created but some images failed to upload');
          }
        } else {
          setSuccess('Listing created successfully!');
        }

        setTimeout(() => {
          navigate(`/marketplace/${listingId}`);
        }, 1500);
      } else {
        throw new Error(response.error || 'Failed to create listing');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Create New Listing</Title>
        <Subtitle>List an item for sale, auction, or raffle</Subtitle>
      </Header>

      <Form onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        <ListingBasicInfo
          formData={formData}
          categories={categories}
          onChange={handleChange}
        />

        <Section>
          <SectionTitle>Photos</SectionTitle>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={10}
            maxFileSize={10}
          />
        </Section>

        <ListingPricing
          formData={formData}
          onChange={handleChange}
        />

        <ListingLocation
          formData={formData}
          onChange={handleChange}
          locationDetecting={locationDetecting}
          locationDetected={locationDetected}
          detectedLocation={detectedLocation}
          useManualLocation={useManualLocation}
          onDetectLocation={detectUserLocation}
          onChangeLocation={() => setUseManualLocation(true)}
          onManualEdit={() => setUseManualLocation(true)}
        />

        <ButtonGroup>
          <Button type="button" variant="secondary" onClick={() => navigate('/marketplace')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

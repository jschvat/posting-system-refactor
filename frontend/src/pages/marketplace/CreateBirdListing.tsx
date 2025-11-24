import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import marketplaceApi from '../../services/marketplaceApi';

const Container = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
`;

const Header = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  margin-bottom: 32px;
`;

const Form = styled.form`
  background: ${props => props.theme.colors.white};
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px ${props => props.theme.colors.overlayLight};
`;

const Section = styled.div`
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid ${props => props.theme.colors.border};

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  min-height: 120px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  font-weight: 400;
  color: ${props => props.theme.colors.text.primary};
  cursor: pointer;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 32px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${props => props.variant === 'primary' ? `
    background: ${props.theme.colors.primary};
    color: white;

    &:hover {
      background: ${props.theme.colors.primaryDark};
    }
  ` : `
    background: ${props.theme.colors.border};
    color: ${props.theme.colors.text.primary};

    &:hover {
      background: ${props.theme.colors.borderLight};
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

export const CreateBirdListing: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Basic listing fields
    title: '',
    description: '',
    price: '',
    location_city: '',
    location_state: '',

    // Bird-specific fields
    bird_species: '',
    bird_subspecies: '',
    color_mutation: '',
    color_description: '',
    sex: 'unknown',
    age_years: '',
    age_months: '',
    health_status: 'good',
    health_certificate_available: false,
    dna_sexed: false,
    temperament: '',
    is_hand_fed: false,
    is_hand_tamed: false,
    can_talk: false,
    talks_vocabulary: '',
    proven_breeder: false,
    breeding_history: '',
    breeder_certification: '',
    includes_health_guarantee: false,
    health_guarantee_duration_days: '',
    shipping_methods: '',
    includes_carrier: false
  });

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
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.price || !formData.bird_species) {
        throw new Error('Please fill in all required fields (Title, Description, Price, Species)');
      }

      // Get user's location using geolocation
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      // Create the bird listing
      const response = await fetch('http://localhost:3001/api/marketplace/birds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          age_years: formData.age_years ? parseInt(formData.age_years) : null,
          age_months: formData.age_months ? parseInt(formData.age_months) : null,
          health_guarantee_duration_days: formData.health_guarantee_duration_days ?
            parseInt(formData.health_guarantee_duration_days) : null,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          category_id: 9 // Birds category
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create listing');
      }

      // Navigate to the bird marketplace
      navigate('/marketplace/birds');
    } catch (err: any) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>Create Bird Listing</Header>
      <Subtitle>List your bird for sale in the Breeder's Nest marketplace</Subtitle>

      <Form onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Section>
          <SectionTitle>Basic Information</SectionTitle>

          <FormGroup>
            <Label>Title *</Label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Lutino Cockatiel Male - Excellent Singer"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Description *</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your bird's personality, health, and any special characteristics..."
              required
            />
          </FormGroup>

          <Row>
            <FormGroup>
              <Label>Price (USD) *</Label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Species *</Label>
              <Select name="bird_species" value={formData.bird_species} onChange={handleChange} required>
                <option value="">Select Species</option>
                <option value="Budgerigar">Budgerigar / Parakeet</option>
                <option value="English Budgie">English Budgie</option>
                <option value="Cockatiel">Cockatiel</option>
                <option value="Peach-Faced Lovebird">Peach-Faced Lovebird</option>
                <option value="Fischer Lovebird">Fischer Lovebird</option>
                <option value="Green Cheek Conure">Green Cheek Conure</option>
                <option value="Sun Conure">Sun Conure</option>
                <option value="Zebra Finch">Zebra Finch</option>
                <option value="Society Finch">Society Finch</option>
                <option value="Gouldian Finch">Gouldian Finch</option>
                <option value="Canary">Canary</option>
                <option value="African Grey Parrot">African Grey Parrot</option>
                <option value="Amazon Parrot">Amazon Parrot</option>
                <option value="Macaw">Macaw</option>
                <option value="Cockatoo">Cockatoo</option>
                <option value="Indian Ringneck Parakeet">Indian Ringneck Parakeet</option>
              </Select>
            </FormGroup>
          </Row>

          <Row>
            <FormGroup>
              <Label>City</Label>
              <Input
                type="text"
                name="location_city"
                value={formData.location_city}
                onChange={handleChange}
                placeholder="e.g., Houston"
              />
            </FormGroup>

            <FormGroup>
              <Label>State</Label>
              <Input
                type="text"
                name="location_state"
                value={formData.location_state}
                onChange={handleChange}
                placeholder="e.g., TX"
              />
            </FormGroup>
          </Row>
        </Section>

        <Section>
          <SectionTitle>Bird Details</SectionTitle>

          <Row>
            <FormGroup>
              <Label>Subspecies / Variety</Label>
              <Input
                type="text"
                name="bird_subspecies"
                value={formData.bird_subspecies}
                onChange={handleChange}
                placeholder="e.g., Australian Budgie"
              />
            </FormGroup>

            <FormGroup>
              <Label>Color Mutation</Label>
              <Input
                type="text"
                name="color_mutation"
                value={formData.color_mutation}
                onChange={handleChange}
                placeholder="e.g., Lutino, Pied, Blue"
              />
            </FormGroup>
          </Row>

          <FormGroup>
            <Label>Color Description</Label>
            <Input
              type="text"
              name="color_description"
              value={formData.color_description}
              onChange={handleChange}
              placeholder="Describe the bird's coloring..."
            />
          </FormGroup>

          <Row>
            <FormGroup>
              <Label>Sex</Label>
              <Select name="sex" value={formData.sex} onChange={handleChange}>
                <option value="unknown">Unknown</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="pair">Pair</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Temperament</Label>
              <Select name="temperament" value={formData.temperament} onChange={handleChange}>
                <option value="">Select Temperament</option>
                <option value="friendly">Friendly</option>
                <option value="tame">Tame</option>
                <option value="semi_tame">Semi-Tame</option>
                <option value="not_tame">Not Tame</option>
                <option value="bonded">Bonded to Person</option>
              </Select>
            </FormGroup>
          </Row>

          <Row>
            <FormGroup>
              <Label>Age (Years)</Label>
              <Input
                type="number"
                name="age_years"
                value={formData.age_years}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </FormGroup>

            <FormGroup>
              <Label>Age (Months)</Label>
              <Input
                type="number"
                name="age_months"
                value={formData.age_months}
                onChange={handleChange}
                min="0"
                max="11"
                placeholder="0"
              />
            </FormGroup>
          </Row>

          <FormGroup>
            <Label>Health Status</Label>
            <Select name="health_status" value={formData.health_status} onChange={handleChange}>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <CheckboxWrapper>
              <Checkbox
                name="dna_sexed"
                checked={formData.dna_sexed}
                onChange={handleChange}
              />
              <CheckboxLabel>DNA Sexed</CheckboxLabel>
            </CheckboxWrapper>

            <CheckboxWrapper>
              <Checkbox
                name="health_certificate_available"
                checked={formData.health_certificate_available}
                onChange={handleChange}
              />
              <CheckboxLabel>Health Certificate Available</CheckboxLabel>
            </CheckboxWrapper>

            <CheckboxWrapper>
              <Checkbox
                name="is_hand_fed"
                checked={formData.is_hand_fed}
                onChange={handleChange}
              />
              <CheckboxLabel>Hand-Fed</CheckboxLabel>
            </CheckboxWrapper>

            <CheckboxWrapper>
              <Checkbox
                name="is_hand_tamed"
                checked={formData.is_hand_tamed}
                onChange={handleChange}
              />
              <CheckboxLabel>Hand-Tamed</CheckboxLabel>
            </CheckboxWrapper>

            <CheckboxWrapper>
              <Checkbox
                name="can_talk"
                checked={formData.can_talk}
                onChange={handleChange}
              />
              <CheckboxLabel>Can Talk / Mimic</CheckboxLabel>
            </CheckboxWrapper>

            {formData.can_talk && (
              <FormGroup>
                <Label>Vocabulary / Songs</Label>
                <Input
                  type="text"
                  name="talks_vocabulary"
                  value={formData.talks_vocabulary}
                  onChange={handleChange}
                  placeholder="e.g., Whistles Happy Birthday, says 'Hello'"
                />
              </FormGroup>
            )}

            <CheckboxWrapper>
              <Checkbox
                name="proven_breeder"
                checked={formData.proven_breeder}
                onChange={handleChange}
              />
              <CheckboxLabel>Proven Breeder</CheckboxLabel>
            </CheckboxWrapper>

            {formData.proven_breeder && (
              <FormGroup>
                <Label>Breeding History</Label>
                <TextArea
                  name="breeding_history"
                  value={formData.breeding_history}
                  onChange={handleChange}
                  placeholder="Describe breeding history and offspring..."
                />
              </FormGroup>
            )}
          </FormGroup>
        </Section>

        <Section>
          <SectionTitle>Breeder Information</SectionTitle>

          <FormGroup>
            <Label>Breeder Certification</Label>
            <Input
              type="text"
              name="breeder_certification"
              value={formData.breeder_certification}
              onChange={handleChange}
              placeholder="e.g., NPIP Certified, AFA Member"
            />
          </FormGroup>

          <CheckboxWrapper>
            <Checkbox
              name="includes_health_guarantee"
              checked={formData.includes_health_guarantee}
              onChange={handleChange}
            />
            <CheckboxLabel>Includes Health Guarantee</CheckboxLabel>
          </CheckboxWrapper>

          {formData.includes_health_guarantee && (
            <FormGroup>
              <Label>Guarantee Duration (Days)</Label>
              <Input
                type="number"
                name="health_guarantee_duration_days"
                value={formData.health_guarantee_duration_days}
                onChange={handleChange}
                min="0"
                placeholder="e.g., 7, 14, 30"
              />
            </FormGroup>
          )}

          <FormGroup>
            <Label>Shipping Methods</Label>
            <Input
              type="text"
              name="shipping_methods"
              value={formData.shipping_methods}
              onChange={handleChange}
              placeholder="e.g., Local pickup only, Can ship via Delta Cargo"
            />
          </FormGroup>

          <CheckboxWrapper>
            <Checkbox
              name="includes_carrier"
              checked={formData.includes_carrier}
              onChange={handleChange}
            />
            <CheckboxLabel>Includes Carrier/Travel Cage</CheckboxLabel>
          </CheckboxWrapper>
        </Section>

        <ButtonGroup>
          <Button type="button" variant="secondary" onClick={() => navigate('/marketplace/birds')}>
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

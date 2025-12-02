/**
 * Create Supply Listing Page
 * Form for listing bird supplies (food, toys, cages, health products, etc.)
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import marketplaceApi from '../../services/marketplaceApi';
import { ImageUpload } from '../../components/marketplace/ImageUpload';

interface SupplyCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  subcategories?: SupplyCategory[];
}

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

const Row3 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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

  ${props => props.variant === 'secondary' ? `
    background: ${props.theme.colors.background};
    color: ${props.theme.colors.text.primary};
    border: 1px solid ${props.theme.colors.border};

    &:hover {
      background: ${props.theme.colors.border};
    }
  ` : `
    background: linear-gradient(135deg, #2E8B57, #3CB371);
    color: white;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(46, 139, 87, 0.3);
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  color: #c00;
`;

const SuccessMessage = styled.div`
  background: #efe;
  border: 1px solid #cfc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  color: #060;
`;

const HelpText = styled.span`
  display: block;
  font-size: 12px;
  color: ${props => props.theme.colors.text.muted};
  margin-top: 4px;
`;

export const CreateSupplyListing: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState<File[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    // Basic listing info
    title: '',
    description: '',
    price: '',
    quantity: '1',

    // Location
    location_city: '',
    location_state: '',

    // Shipping
    shipping_available: false,
    shipping_cost: '',

    // Supply-specific fields
    supply_category_id: '',
    brand: '',
    model: '',
    sku: '',
    upc: '',

    // Dimensions
    weight_lbs: '',
    dimensions_length: '',
    dimensions_width: '',
    dimensions_height: '',

    // Wholesale options
    is_wholesale: false,
    minimum_order_quantity: '1',
    bulk_discount_available: false,

    // Business info
    is_manufacturer: false,
    is_authorized_dealer: false,
    warranty_months: '',

    // Category-specific fields (shown conditionally)
    cage_bar_spacing: '',
    cage_material: '',
    suitable_bird_sizes: '',
    food_type: '',
    food_weight_oz: '',
    expiration_date: '',
    ingredients: '',
    suitable_species: '',
    toy_type: '',
    toy_materials: '',
    bird_safe: true,
    health_product_type: '',
    requires_vet_prescription: false,
    active_ingredients: ''
  });

  useEffect(() => {
    fetchCategories();
    detectLocation();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await marketplaceApi.getBirdSupplyCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const detectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Could use reverse geocoding here to get city/state
          console.log('Location detected:', position.coords);
        },
        () => console.log('Location access denied')
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.title || !formData.description || !formData.price) {
        setError('Please fill in all required fields (title, description, price)');
        setLoading(false);
        return;
      }

      // Create the listing
      const response = await marketplaceApi.createBirdSupplyListing(formData);

      if (response.success) {
        const listingId = response.data.id;

        // Upload images if any were provided
        if (images.length > 0) {
          try {
            await marketplaceApi.uploadImages(listingId, images);
          } catch (imageErr) {
            console.error('Error uploading images:', imageErr);
            // Don't fail the entire listing creation if images fail
            setError('Listing created but some images failed to upload. You can add them later.');
          }
        }

        setSuccess('Listing created successfully!');
        setTimeout(() => {
          navigate('/marketplace/birds/supplies');
        }, 1500);
      } else {
        setError(response.error || 'Failed to create listing');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the listing');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategorySlug = categories.find(c => c.id === parseInt(formData.supply_category_id))?.slug;

  return (
    <Container>
      <Header>List a Bird Supply Product</Header>
      <Subtitle>Sell bird food, toys, cages, health products, and more</Subtitle>

      <Form onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}

        {/* Basic Information */}
        <Section>
          <SectionTitle>Basic Information</SectionTitle>

          <FormGroup>
            <Label>Product Title *</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Premium Parrot Seed Mix 5lb Bag"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Description *</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product, including features, benefits, and any important details..."
              required
            />
          </FormGroup>

          <Row>
            <FormGroup>
              <Label>Category</Label>
              <Select
                name="supply_category_id"
                value={formData.supply_category_id}
                onChange={handleChange}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Brand</Label>
              <Input
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Kaytee, ZuPreem, etc."
              />
            </FormGroup>
          </Row>

          <Row>
            <FormGroup>
              <Label>Model/SKU</Label>
              <Input
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Product model number"
              />
            </FormGroup>

            <FormGroup>
              <Label>UPC</Label>
              <Input
                name="upc"
                value={formData.upc}
                onChange={handleChange}
                placeholder="Universal Product Code"
              />
            </FormGroup>
          </Row>
        </Section>

        {/* Product Images */}
        <Section>
          <SectionTitle>Product Images</SectionTitle>
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            maxImages={8}
            maxSizeMB={5}
          />
          <HelpText>Upload up to 8 images. First image will be the primary listing photo.</HelpText>
        </Section>

        {/* Pricing & Inventory */}
        <Section>
          <SectionTitle>Pricing & Inventory</SectionTitle>

          <Row>
            <FormGroup>
              <Label>Price ($) *</Label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>Quantity Available</Label>
              <Input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
              />
            </FormGroup>
          </Row>

          <CheckboxWrapper>
            <Checkbox
              id="is_wholesale"
              name="is_wholesale"
              checked={formData.is_wholesale}
              onChange={handleChange}
            />
            <CheckboxLabel htmlFor="is_wholesale">
              This is a wholesale listing (bulk orders only)
            </CheckboxLabel>
          </CheckboxWrapper>

          {formData.is_wholesale && (
            <Row>
              <FormGroup>
                <Label>Minimum Order Quantity</Label>
                <Input
                  type="number"
                  name="minimum_order_quantity"
                  value={formData.minimum_order_quantity}
                  onChange={handleChange}
                  min="1"
                />
              </FormGroup>

              <FormGroup>
                <CheckboxWrapper style={{ marginTop: 32 }}>
                  <Checkbox
                    id="bulk_discount_available"
                    name="bulk_discount_available"
                    checked={formData.bulk_discount_available}
                    onChange={handleChange}
                  />
                  <CheckboxLabel htmlFor="bulk_discount_available">
                    Bulk discounts available
                  </CheckboxLabel>
                </CheckboxWrapper>
              </FormGroup>
            </Row>
          )}
        </Section>

        {/* Product Details */}
        <Section>
          <SectionTitle>Product Details</SectionTitle>

          <Row>
            <FormGroup>
              <Label>Weight (lbs)</Label>
              <Input
                type="number"
                name="weight_lbs"
                value={formData.weight_lbs}
                onChange={handleChange}
                step="0.1"
                min="0"
              />
            </FormGroup>

            <FormGroup>
              <Label>Warranty (months)</Label>
              <Input
                type="number"
                name="warranty_months"
                value={formData.warranty_months}
                onChange={handleChange}
                min="0"
              />
            </FormGroup>
          </Row>

          <Row3>
            <FormGroup>
              <Label>Length (in)</Label>
              <Input
                type="number"
                name="dimensions_length"
                value={formData.dimensions_length}
                onChange={handleChange}
                step="0.1"
                min="0"
              />
            </FormGroup>

            <FormGroup>
              <Label>Width (in)</Label>
              <Input
                type="number"
                name="dimensions_width"
                value={formData.dimensions_width}
                onChange={handleChange}
                step="0.1"
                min="0"
              />
            </FormGroup>

            <FormGroup>
              <Label>Height (in)</Label>
              <Input
                type="number"
                name="dimensions_height"
                value={formData.dimensions_height}
                onChange={handleChange}
                step="0.1"
                min="0"
              />
            </FormGroup>
          </Row3>

          <Row>
            <CheckboxWrapper>
              <Checkbox
                id="is_manufacturer"
                name="is_manufacturer"
                checked={formData.is_manufacturer}
                onChange={handleChange}
              />
              <CheckboxLabel htmlFor="is_manufacturer">
                I am the manufacturer
              </CheckboxLabel>
            </CheckboxWrapper>

            <CheckboxWrapper>
              <Checkbox
                id="is_authorized_dealer"
                name="is_authorized_dealer"
                checked={formData.is_authorized_dealer}
                onChange={handleChange}
              />
              <CheckboxLabel htmlFor="is_authorized_dealer">
                Authorized dealer
              </CheckboxLabel>
            </CheckboxWrapper>
          </Row>
        </Section>

        {/* Category-specific fields */}
        {selectedCategorySlug === 'cages-enclosures' && (
          <Section>
            <SectionTitle>Cage Details</SectionTitle>
            <Row>
              <FormGroup>
                <Label>Bar Spacing (inches)</Label>
                <Input
                  type="number"
                  name="cage_bar_spacing"
                  value={formData.cage_bar_spacing}
                  onChange={handleChange}
                  step="0.125"
                  min="0"
                />
                <HelpText>Common: 1/2" for small birds, 3/4" for medium, 1" for large</HelpText>
              </FormGroup>

              <FormGroup>
                <Label>Material</Label>
                <Select
                  name="cage_material"
                  value={formData.cage_material}
                  onChange={handleChange}
                >
                  <option value="">Select material</option>
                  <option value="wrought_iron">Wrought Iron</option>
                  <option value="stainless_steel">Stainless Steel</option>
                  <option value="powder_coated">Powder Coated</option>
                  <option value="acrylic">Acrylic</option>
                  <option value="wood">Wood</option>
                </Select>
              </FormGroup>
            </Row>

            <FormGroup>
              <Label>Suitable Bird Sizes</Label>
              <Input
                name="suitable_bird_sizes"
                value={formData.suitable_bird_sizes}
                onChange={handleChange}
                placeholder="e.g., Small (finches, canaries), Medium (cockatiels)"
              />
            </FormGroup>
          </Section>
        )}

        {selectedCategorySlug === 'food-nutrition' && (
          <Section>
            <SectionTitle>Food Details</SectionTitle>
            <Row>
              <FormGroup>
                <Label>Food Type</Label>
                <Select
                  name="food_type"
                  value={formData.food_type}
                  onChange={handleChange}
                >
                  <option value="">Select type</option>
                  <option value="seed_mix">Seed Mix</option>
                  <option value="pellets">Pellets</option>
                  <option value="fresh_foods">Fresh Foods</option>
                  <option value="treats">Treats</option>
                  <option value="supplements">Supplements</option>
                  <option value="nectar">Nectar</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Weight (oz)</Label>
                <Input
                  type="number"
                  name="food_weight_oz"
                  value={formData.food_weight_oz}
                  onChange={handleChange}
                  min="0"
                />
              </FormGroup>
            </Row>

            <Row>
              <FormGroup>
                <Label>Expiration Date</Label>
                <Input
                  type="date"
                  name="expiration_date"
                  value={formData.expiration_date}
                  onChange={handleChange}
                />
              </FormGroup>

              <FormGroup>
                <Label>Suitable Species</Label>
                <Input
                  name="suitable_species"
                  value={formData.suitable_species}
                  onChange={handleChange}
                  placeholder="e.g., Parrots, Finches, Canaries"
                />
              </FormGroup>
            </Row>

            <FormGroup>
              <Label>Ingredients</Label>
              <TextArea
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
                placeholder="List main ingredients..."
              />
            </FormGroup>
          </Section>
        )}

        {selectedCategorySlug === 'toys-enrichment' && (
          <Section>
            <SectionTitle>Toy Details</SectionTitle>
            <Row>
              <FormGroup>
                <Label>Toy Type</Label>
                <Select
                  name="toy_type"
                  value={formData.toy_type}
                  onChange={handleChange}
                >
                  <option value="">Select type</option>
                  <option value="foraging">Foraging</option>
                  <option value="chewing">Chewing/Shredding</option>
                  <option value="climbing">Climbing</option>
                  <option value="swinging">Swings</option>
                  <option value="interactive">Interactive/Puzzle</option>
                  <option value="musical">Musical/Noise</option>
                  <option value="foot">Foot Toys</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Materials</Label>
                <Input
                  name="toy_materials"
                  value={formData.toy_materials}
                  onChange={handleChange}
                  placeholder="e.g., Wood, rope, leather, acrylic"
                />
              </FormGroup>
            </Row>

            <CheckboxWrapper>
              <Checkbox
                id="bird_safe"
                name="bird_safe"
                checked={formData.bird_safe}
                onChange={handleChange}
              />
              <CheckboxLabel htmlFor="bird_safe">
                Bird-safe materials (non-toxic, no zinc/lead)
              </CheckboxLabel>
            </CheckboxWrapper>
          </Section>
        )}

        {selectedCategorySlug === 'health-wellness' && (
          <Section>
            <SectionTitle>Health Product Details</SectionTitle>
            <Row>
              <FormGroup>
                <Label>Product Type</Label>
                <Select
                  name="health_product_type"
                  value={formData.health_product_type}
                  onChange={handleChange}
                >
                  <option value="">Select type</option>
                  <option value="vitamins">Vitamins/Supplements</option>
                  <option value="first_aid">First Aid</option>
                  <option value="mite_treatment">Mite/Parasite Treatment</option>
                  <option value="probiotics">Probiotics</option>
                  <option value="disinfectant">Disinfectants</option>
                  <option value="medication">Medication</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <CheckboxWrapper style={{ marginTop: 32 }}>
                  <Checkbox
                    id="requires_vet_prescription"
                    name="requires_vet_prescription"
                    checked={formData.requires_vet_prescription}
                    onChange={handleChange}
                  />
                  <CheckboxLabel htmlFor="requires_vet_prescription">
                    Requires veterinary prescription
                  </CheckboxLabel>
                </CheckboxWrapper>
              </FormGroup>
            </Row>

            <FormGroup>
              <Label>Active Ingredients</Label>
              <TextArea
                name="active_ingredients"
                value={formData.active_ingredients}
                onChange={handleChange}
                placeholder="List active ingredients and concentrations..."
              />
            </FormGroup>
          </Section>
        )}

        {/* Location & Shipping */}
        <Section>
          <SectionTitle>Location & Shipping</SectionTitle>

          <Row>
            <FormGroup>
              <Label>City</Label>
              <Input
                name="location_city"
                value={formData.location_city}
                onChange={handleChange}
                placeholder="Your city"
              />
            </FormGroup>

            <FormGroup>
              <Label>State</Label>
              <Input
                name="location_state"
                value={formData.location_state}
                onChange={handleChange}
                placeholder="Your state"
              />
            </FormGroup>
          </Row>

          <CheckboxWrapper>
            <Checkbox
              id="shipping_available"
              name="shipping_available"
              checked={formData.shipping_available}
              onChange={handleChange}
            />
            <CheckboxLabel htmlFor="shipping_available">
              Shipping available
            </CheckboxLabel>
          </CheckboxWrapper>

          {formData.shipping_available && (
            <FormGroup>
              <Label>Shipping Cost ($)</Label>
              <Input
                type="number"
                name="shipping_cost"
                value={formData.shipping_cost}
                onChange={handleChange}
                placeholder="0.00 for free shipping"
                step="0.01"
                min="0"
              />
              <HelpText>Enter 0 for free shipping</HelpText>
            </FormGroup>
          )}
        </Section>

        <ButtonGroup>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/marketplace/birds/supplies')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Listing'}
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default CreateSupplyListing;

-- Bird Breeder Marketplace - Specialized Extension
-- Migration 027: bird_listing_attributes for specialized bird breeding marketplace

-- ============================================================================
-- 1. BIRD LISTING ATTRIBUTES (Extended attributes for bird listings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketplace_bird_attributes (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,

    -- Bird Species & Type
    bird_species VARCHAR(100) NOT NULL, -- e.g., "Parakeet", "Cockatiel", "Canary"
    bird_subspecies VARCHAR(100), -- e.g., "English Budgie", "Australian Budgie"
    common_name VARCHAR(100), -- Common name/nickname
    scientific_name VARCHAR(150), -- Scientific classification

    -- Physical Characteristics
    color_mutation VARCHAR(100), -- e.g., "Lutino", "Albino", "Pied", "Blue"
    color_description TEXT, -- Detailed color description
    sex VARCHAR(20) CHECK (sex IN ('male', 'female', 'unknown', 'pair', 'trio')),
    age_years INTEGER CHECK (age_years >= 0),
    age_months INTEGER CHECK (age_months >= 0 AND age_months < 12),
    hatch_date DATE,
    size VARCHAR(20) CHECK (size IN ('extra_small', 'small', 'medium', 'large', 'extra_large')),

    -- Health & Genetics
    health_status VARCHAR(30) CHECK (health_status IN (
        'excellent', 'good', 'fair', 'special_needs', 'recovering'
    )),
    health_certificate_available BOOLEAN DEFAULT FALSE,
    dna_sexed BOOLEAN DEFAULT FALSE,
    disease_tested BOOLEAN DEFAULT FALSE,
    disease_test_results TEXT,
    vaccinations TEXT[], -- Array of vaccinations
    genetic_lineage TEXT, -- Pedigree/lineage information
    genetic_mutations TEXT[], -- Known genetic mutations

    -- Breeding Information
    proven_breeder BOOLEAN DEFAULT FALSE,
    breeding_history TEXT, -- Past breeding success
    fertility_status VARCHAR(30) CHECK (fertility_status IN (
        'fertile', 'unknown', 'infertile', 'not_for_breeding'
    )),
    parent_lineage TEXT, -- Information about parents

    -- Temperament & Behavior
    temperament VARCHAR(30) CHECK (temperament IN (
        'friendly', 'tame', 'semi_tame', 'not_tame', 'bonded', 'aggressive'
    )),
    is_hand_fed BOOLEAN DEFAULT FALSE,
    is_hand_tamed BOOLEAN DEFAULT FALSE,
    can_talk BOOLEAN DEFAULT FALSE,
    talks_vocabulary TEXT, -- Words/phrases the bird knows
    behavioral_notes TEXT,
    socialization_level VARCHAR(30) CHECK (socialization_level IN (
        'highly_social', 'social', 'moderate', 'shy', 'aggressive'
    )),

    -- Care Requirements
    diet_type VARCHAR(30) CHECK (diet_type IN (
        'seed', 'pellet', 'mixed', 'fruit_veg', 'specialized'
    )),
    diet_notes TEXT,
    housing_requirements TEXT,
    special_care_needs TEXT,
    noise_level VARCHAR(20) CHECK (noise_level IN (
        'quiet', 'moderate', 'loud', 'very_loud'
    )),

    -- Breeder Information
    breeder_certification VARCHAR(100), -- e.g., "NPIP Certified", "AFA Member"
    breeder_years_experience INTEGER,
    breeding_program_description TEXT,
    breeder_specialization TEXT, -- What types of birds breeder specializes in

    -- Registration & Documentation
    registration_number VARCHAR(100),
    registration_organization VARCHAR(100), -- e.g., "AFA", "NFSS", "ASA"
    cites_certificate BOOLEAN DEFAULT FALSE, -- For exotic/protected species
    band_number VARCHAR(50), -- Leg band number
    band_type VARCHAR(30) CHECK (band_type IN ('closed', 'open', 'none')),
    microchipped BOOLEAN DEFAULT FALSE,
    microchip_number VARCHAR(50),

    -- Shipping & Delivery
    flight_ready BOOLEAN DEFAULT FALSE, -- Ready for air shipping
    shipping_methods TEXT[], -- Available shipping methods
    shipping_restrictions TEXT,
    includes_carrier BOOLEAN DEFAULT FALSE,
    includes_health_guarantee BOOLEAN DEFAULT FALSE,
    health_guarantee_duration_days INTEGER,

    -- Package Inclusions
    includes_cage BOOLEAN DEFAULT FALSE,
    includes_toys BOOLEAN DEFAULT FALSE,
    includes_food BOOLEAN DEFAULT FALSE,
    includes_medical_records BOOLEAN DEFAULT FALSE,
    package_inclusions TEXT,

    -- Additional Metadata
    rare_breed BOOLEAN DEFAULT FALSE,
    show_quality BOOLEAN DEFAULT FALSE,
    pet_quality BOOLEAN DEFAULT TRUE,
    breeding_rights_included BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(listing_id)
);

-- Indexes for common queries
CREATE INDEX idx_bird_attributes_listing ON marketplace_bird_attributes(listing_id);
CREATE INDEX idx_bird_attributes_species ON marketplace_bird_attributes(bird_species);
CREATE INDEX idx_bird_attributes_subspecies ON marketplace_bird_attributes(bird_subspecies);
CREATE INDEX idx_bird_attributes_color ON marketplace_bird_attributes(color_mutation);
CREATE INDEX idx_bird_attributes_sex ON marketplace_bird_attributes(sex);
CREATE INDEX idx_bird_attributes_age ON marketplace_bird_attributes(age_years, age_months);
CREATE INDEX idx_bird_attributes_temperament ON marketplace_bird_attributes(temperament);
CREATE INDEX idx_bird_attributes_hand_fed ON marketplace_bird_attributes(is_hand_fed) WHERE is_hand_fed = TRUE;
CREATE INDEX idx_bird_attributes_breeder ON marketplace_bird_attributes(proven_breeder) WHERE proven_breeder = TRUE;
CREATE INDEX idx_bird_attributes_rare ON marketplace_bird_attributes(rare_breed) WHERE rare_breed = TRUE;

-- Full-text search for bird attributes
CREATE INDEX idx_bird_attributes_search ON marketplace_bird_attributes
USING gin(to_tsvector('english',
    COALESCE(bird_species, '') || ' ' ||
    COALESCE(bird_subspecies, '') || ' ' ||
    COALESCE(color_mutation, '') || ' ' ||
    COALESCE(color_description, '')
));

-- ============================================================================
-- 2. BIRD SPECIES MASTER LIST (Reference table for bird species)
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketplace_bird_species (
    id SERIAL PRIMARY KEY,
    species_name VARCHAR(100) NOT NULL UNIQUE,
    scientific_name VARCHAR(150),
    common_names TEXT[], -- Array of common names

    -- Classification
    family VARCHAR(100),
    genus VARCHAR(100),
    species_group VARCHAR(100), -- e.g., "Parakeets", "Finches", "Parrots"

    -- Characteristics
    typical_lifespan_years INTEGER,
    average_size_inches INTEGER,
    care_level VARCHAR(20) CHECK (care_level IN ('beginner', 'intermediate', 'advanced', 'expert')),

    -- Legal & Conservation
    cites_status VARCHAR(20) CHECK (cites_status IN ('not_listed', 'appendix_1', 'appendix_2', 'appendix_3')),
    protected_status BOOLEAN DEFAULT FALSE,
    permit_required BOOLEAN DEFAULT FALSE,

    -- Metadata
    description TEXT,
    care_sheet_url TEXT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    listing_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bird_species_name ON marketplace_bird_species(species_name);
CREATE INDEX idx_bird_species_group ON marketplace_bird_species(species_group);
CREATE INDEX idx_bird_species_active ON marketplace_bird_species(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_bird_species_cites ON marketplace_bird_species(cites_status);

-- ============================================================================
-- 3. BIRD COLOR MUTATIONS (Reference table for color variations)
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketplace_bird_color_mutations (
    id SERIAL PRIMARY KEY,
    mutation_name VARCHAR(100) NOT NULL,
    species_id INTEGER REFERENCES marketplace_bird_species(id) ON DELETE CASCADE,

    -- Genetics
    genetic_type VARCHAR(30) CHECK (genetic_type IN (
        'dominant', 'recessive', 'sex_linked', 'incomplete_dominant', 'co_dominant'
    )),
    genetic_description TEXT,

    -- Characteristics
    color_description TEXT,
    rarity VARCHAR(20) CHECK (rarity IN ('common', 'uncommon', 'rare', 'very_rare', 'ultra_rare')),

    -- Visual
    image_url TEXT,
    example_images TEXT[],

    is_active BOOLEAN DEFAULT TRUE,
    listing_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(species_id, mutation_name)
);

CREATE INDEX idx_bird_mutations_species ON marketplace_bird_color_mutations(species_id);
CREATE INDEX idx_bird_mutations_rarity ON marketplace_bird_color_mutations(rarity);
CREATE INDEX idx_bird_mutations_active ON marketplace_bird_color_mutations(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to ensure bird listings are in appropriate category
CREATE OR REPLACE FUNCTION enforce_bird_category()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if listing has bird attributes but isn't in a bird-related category
    -- This is a validation function, implementation depends on your category structure
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_bird_category
BEFORE INSERT OR UPDATE ON marketplace_bird_attributes
FOR EACH ROW EXECUTE FUNCTION enforce_bird_category();

-- Trigger to update bird species listing count
CREATE OR REPLACE FUNCTION update_bird_species_count()
RETURNS TRIGGER AS $$
DECLARE
    species_rec RECORD;
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Find or create species and increment count
        SELECT id INTO species_rec FROM marketplace_bird_species
        WHERE species_name = NEW.bird_species;

        IF FOUND THEN
            UPDATE marketplace_bird_species
            SET listing_count = listing_count + 1
            WHERE species_name = NEW.bird_species;
        END IF;
    ELSIF TG_OP = 'UPDATE' AND OLD.bird_species != NEW.bird_species THEN
        -- Decrement old species, increment new species
        UPDATE marketplace_bird_species
        SET listing_count = listing_count - 1
        WHERE species_name = OLD.bird_species;

        UPDATE marketplace_bird_species
        SET listing_count = listing_count + 1
        WHERE species_name = NEW.bird_species;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE marketplace_bird_species
        SET listing_count = listing_count - 1
        WHERE species_name = OLD.bird_species;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_bird_species_count
AFTER INSERT OR UPDATE OR DELETE ON marketplace_bird_attributes
FOR EACH ROW EXECUTE FUNCTION update_bird_species_count();

-- ============================================================================
-- SEED DATA - Common Bird Species
-- ============================================================================

INSERT INTO marketplace_bird_species (species_name, scientific_name, family, species_group, typical_lifespan_years, average_size_inches, care_level, description) VALUES
-- Parakeets
('Budgerigar', 'Melopsittacus undulatus', 'Psittacidae', 'Parakeets', 10, 7, 'beginner', 'Small, colorful parakeets native to Australia, commonly known as budgies'),
('English Budgie', 'Melopsittacus undulatus', 'Psittacidae', 'Parakeets', 12, 8, 'beginner', 'Larger show-type budgerigar with fluffier feathers'),
('Indian Ringneck Parakeet', 'Psittacula krameri', 'Psittacidae', 'Parakeets', 25, 16, 'intermediate', 'Medium-sized parakeet known for talking ability and distinctive neck ring'),

-- Cockatiels
('Cockatiel', 'Nymphicus hollandicus', 'Cacatuidae', 'Cockatiels', 20, 13, 'beginner', 'Popular pet bird native to Australia with distinctive crest'),

-- Lovebirds
('Peach-Faced Lovebird', 'Agapornis roseicollis', 'Psittacidae', 'Lovebirds', 15, 6, 'beginner', 'Small, affectionate parrots with peach-colored faces'),
('Fischer Lovebird', 'Agapornis fischeri', 'Psittacidae', 'Lovebirds', 15, 6, 'beginner', 'Colorful small parrots with orange faces and blue rumps'),

-- Conures
('Green Cheek Conure', 'Pyrrhura molinae', 'Psittacidae', 'Conures', 25, 10, 'intermediate', 'Small, playful parrots with green bodies and maroon tail'),
('Sun Conure', 'Aratinga solstitialis', 'Psittacidae', 'Conures', 30, 12, 'intermediate', 'Brightly colored yellow and orange parrots'),

-- Finches
('Zebra Finch', 'Taeniopygia guttata', 'Estrildidae', 'Finches', 7, 4, 'beginner', 'Small Australian finches with zebra-like markings'),
('Society Finch', 'Lonchura striata domestica', 'Estrildidae', 'Finches', 7, 4, 'beginner', 'Domesticated finches known for friendly nature'),
('Gouldian Finch', 'Chloebia gouldiae', 'Estrildidae', 'Finches', 7, 5, 'intermediate', 'Colorful Australian finches with vibrant plumage'),

-- Canaries
('Canary', 'Serinus canaria', 'Fringillidae', 'Canaries', 10, 5, 'beginner', 'Small songbirds known for beautiful singing'),

-- Larger Parrots
('African Grey Parrot', 'Psittacus erithacus', 'Psittacidae', 'Large Parrots', 50, 13, 'expert', 'Highly intelligent parrots known for exceptional talking ability'),
('Amazon Parrot', 'Amazona species', 'Psittacidae', 'Large Parrots', 50, 14, 'advanced', 'Medium to large parrots known for vibrant colors and talking ability'),
('Macaw', 'Ara species', 'Psittacidae', 'Large Parrots', 60, 35, 'expert', 'Large, colorful parrots requiring significant space and experience'),
('Cockatoo', 'Cacatua species', 'Cacatuidae', 'Large Parrots', 50, 18, 'expert', 'Large parrots with distinctive crests, require experienced owners')
ON CONFLICT (species_name) DO NOTHING;

-- ============================================================================
-- SEED DATA - Common Color Mutations
-- ============================================================================

-- Note: This is a simplified seed. In production, you'd want to be more comprehensive
INSERT INTO marketplace_bird_color_mutations (mutation_name, species_id, genetic_type, color_description, rarity)
SELECT 'Lutino', id, 'sex_linked', 'Yellow body with red eyes', 'common'
FROM marketplace_bird_species WHERE species_name = 'Budgerigar'
UNION ALL
SELECT 'Albino', id, 'recessive', 'Pure white with red eyes', 'uncommon'
FROM marketplace_bird_species WHERE species_name = 'Budgerigar'
UNION ALL
SELECT 'Pied', id, 'dominant', 'Patches of normal color and white', 'common'
FROM marketplace_bird_species WHERE species_name = 'Budgerigar'
UNION ALL
SELECT 'Blue', id, 'recessive', 'Blue body instead of green', 'common'
FROM marketplace_bird_species WHERE species_name = 'Budgerigar'
UNION ALL
SELECT 'Normal Grey', id, 'dominant', 'Natural grey with yellow face', 'common'
FROM marketplace_bird_species WHERE species_name = 'Cockatiel'
UNION ALL
SELECT 'Lutino', id, 'sex_linked', 'Yellow and white with red eyes', 'common'
FROM marketplace_bird_species WHERE species_name = 'Cockatiel'
UNION ALL
SELECT 'Pearl', id, 'sex_linked', 'Spotted/scalloped pattern', 'common'
FROM marketplace_bird_species WHERE species_name = 'Cockatiel'
UNION ALL
SELECT 'Pineapple', id, 'recessive', 'Yellow, orange, and red coloring', 'uncommon'
FROM marketplace_bird_species WHERE species_name = 'Green Cheek Conure'
ON CONFLICT (species_id, mutation_name) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE marketplace_bird_attributes IS 'Extended attributes specifically for bird breeder listings with health, genetics, and temperament details';
COMMENT ON TABLE marketplace_bird_species IS 'Master reference table for bird species with care requirements and legal status';
COMMENT ON TABLE marketplace_bird_color_mutations IS 'Reference table for genetic color mutations by species';

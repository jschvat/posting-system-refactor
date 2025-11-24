-- Seller Ratings and Bird Supplies Migration
-- Migration 028: seller_ratings, seller_rating_stats, bird_supply_categories, bird_supply_attributes

-- ============================================================================
-- 1. SELLER RATINGS (Reviews and ratings for marketplace sellers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketplace_seller_ratings (
    id SERIAL PRIMARY KEY,

    -- Who is being rated
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Who is giving the rating
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Associated transaction (optional but recommended)
    transaction_id INTEGER REFERENCES marketplace_transactions(id) ON DELETE SET NULL,
    listing_id INTEGER REFERENCES marketplace_listings(id) ON DELETE SET NULL,

    -- Rating details
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_title VARCHAR(200),
    review_text TEXT,

    -- Category-specific ratings (optional)
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    shipping_speed_rating INTEGER CHECK (shipping_speed_rating >= 1 AND shipping_speed_rating <= 5),
    item_as_described_rating INTEGER CHECK (item_as_described_rating >= 1 AND item_as_described_rating <= 5),
    packaging_rating INTEGER CHECK (packaging_rating >= 1 AND packaging_rating <= 5),

    -- For bird-specific ratings
    bird_health_rating INTEGER CHECK (bird_health_rating >= 1 AND bird_health_rating <= 5),
    bird_temperament_accurate BOOLEAN,
    bird_documentation_provided BOOLEAN,

    -- Verification
    is_verified_purchase BOOLEAN DEFAULT FALSE,

    -- Response from seller
    seller_response TEXT,
    seller_responded_at TIMESTAMP,

    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    flag_reason TEXT,
    is_hidden BOOLEAN DEFAULT FALSE,
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Prevent duplicate reviews for same transaction
    UNIQUE(buyer_id, transaction_id),
    -- Prevent multiple reviews from same buyer to same seller for same listing
    UNIQUE(buyer_id, seller_id, listing_id)
);

CREATE INDEX idx_seller_ratings_seller ON marketplace_seller_ratings(seller_id);
CREATE INDEX idx_seller_ratings_buyer ON marketplace_seller_ratings(buyer_id);
CREATE INDEX idx_seller_ratings_listing ON marketplace_seller_ratings(listing_id);
CREATE INDEX idx_seller_ratings_rating ON marketplace_seller_ratings(rating);
CREATE INDEX idx_seller_ratings_created ON marketplace_seller_ratings(created_at DESC);
CREATE INDEX idx_seller_ratings_verified ON marketplace_seller_ratings(is_verified_purchase) WHERE is_verified_purchase = TRUE;

-- ============================================================================
-- 2. SELLER RATING STATISTICS (Aggregated rating stats for performance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketplace_seller_stats (
    id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Overall stats
    total_ratings INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.00,

    -- Rating distribution
    five_star_count INTEGER DEFAULT 0,
    four_star_count INTEGER DEFAULT 0,
    three_star_count INTEGER DEFAULT 0,
    two_star_count INTEGER DEFAULT 0,
    one_star_count INTEGER DEFAULT 0,

    -- Category averages
    avg_communication DECIMAL(3,2),
    avg_shipping_speed DECIMAL(3,2),
    avg_item_accuracy DECIMAL(3,2),
    avg_packaging DECIMAL(3,2),

    -- Bird-specific averages
    avg_bird_health DECIMAL(3,2),
    bird_temperament_accuracy_pct DECIMAL(5,2),
    bird_documentation_pct DECIMAL(5,2),

    -- Transaction stats
    total_sales INTEGER DEFAULT 0,
    total_completed_transactions INTEGER DEFAULT 0,

    -- Seller tier (based on ratings and volume)
    seller_tier VARCHAR(20) DEFAULT 'new' CHECK (seller_tier IN (
        'new', 'bronze', 'silver', 'gold', 'platinum', 'top_rated'
    )),

    -- Badges/achievements
    badges JSONB DEFAULT '[]',

    -- Timestamps
    last_rating_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seller_stats_rating ON marketplace_seller_stats(average_rating DESC);
CREATE INDEX idx_seller_stats_tier ON marketplace_seller_stats(seller_tier);
CREATE INDEX idx_seller_stats_total ON marketplace_seller_stats(total_ratings DESC);

-- ============================================================================
-- 3. BIRD SUPPLY CATEGORIES (Categories for bird supplies/products)
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketplace_bird_supply_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_id INTEGER REFERENCES marketplace_bird_supply_categories(id) ON DELETE CASCADE,

    -- Display
    description TEXT,
    icon_name VARCHAR(50), -- Icon identifier for frontend
    icon_url VARCHAR(500),
    display_order INTEGER DEFAULT 0,

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    listing_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bird_supply_categories_slug ON marketplace_bird_supply_categories(slug);
CREATE INDEX idx_bird_supply_categories_parent ON marketplace_bird_supply_categories(parent_id);
CREATE INDEX idx_bird_supply_categories_active ON marketplace_bird_supply_categories(is_active);

-- ============================================================================
-- 4. BIRD SUPPLY ATTRIBUTES (Extended attributes for bird supply listings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketplace_bird_supply_attributes (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL UNIQUE REFERENCES marketplace_listings(id) ON DELETE CASCADE,

    -- Category
    supply_category_id INTEGER REFERENCES marketplace_bird_supply_categories(id) ON DELETE SET NULL,

    -- Product details
    brand VARCHAR(100),
    model VARCHAR(100),
    sku VARCHAR(100),
    upc VARCHAR(50),

    -- Physical attributes
    weight_lbs DECIMAL(10,2),
    dimensions_length DECIMAL(10,2),
    dimensions_width DECIMAL(10,2),
    dimensions_height DECIMAL(10,2),
    dimensions_unit VARCHAR(10) DEFAULT 'inches',

    -- For cages/enclosures
    cage_bar_spacing DECIMAL(5,2),
    cage_material VARCHAR(50),
    suitable_bird_sizes TEXT[], -- e.g., ['small', 'medium']

    -- For food/treats
    food_type VARCHAR(50), -- e.g., 'seed', 'pellet', 'treat', 'supplement'
    food_weight_oz DECIMAL(10,2),
    expiration_date DATE,
    ingredients TEXT,
    suitable_species TEXT[], -- e.g., ['Budgerigar', 'Cockatiel']

    -- For toys
    toy_type VARCHAR(50), -- e.g., 'foraging', 'chew', 'swing', 'puzzle'
    toy_materials TEXT[],
    bird_safe BOOLEAN DEFAULT TRUE,

    -- For health/medical
    health_product_type VARCHAR(50), -- e.g., 'supplement', 'medication', 'first_aid'
    requires_vet_prescription BOOLEAN DEFAULT FALSE,
    active_ingredients TEXT,

    -- Wholesale/business info
    is_wholesale BOOLEAN DEFAULT FALSE,
    minimum_order_quantity INTEGER DEFAULT 1,
    bulk_discount_available BOOLEAN DEFAULT FALSE,
    bulk_discount_tiers JSONB, -- e.g., [{"qty": 10, "discount_pct": 5}, {"qty": 50, "discount_pct": 10}]

    -- Supplier info
    is_manufacturer BOOLEAN DEFAULT FALSE,
    is_authorized_dealer BOOLEAN DEFAULT FALSE,
    warranty_months INTEGER,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bird_supply_listing ON marketplace_bird_supply_attributes(listing_id);
CREATE INDEX idx_bird_supply_category ON marketplace_bird_supply_attributes(supply_category_id);
CREATE INDEX idx_bird_supply_brand ON marketplace_bird_supply_attributes(brand);
CREATE INDEX idx_bird_supply_wholesale ON marketplace_bird_supply_attributes(is_wholesale) WHERE is_wholesale = TRUE;

-- ============================================================================
-- 5. TRIGGERS FOR RATING STATISTICS
-- ============================================================================

-- Function to update seller statistics when a rating is added/modified
CREATE OR REPLACE FUNCTION update_seller_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    seller_record RECORD;
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Recalculate all stats for the seller
        SELECT
            COUNT(*) as total,
            AVG(rating) as avg_rating,
            COUNT(*) FILTER (WHERE rating = 5) as five_star,
            COUNT(*) FILTER (WHERE rating = 4) as four_star,
            COUNT(*) FILTER (WHERE rating = 3) as three_star,
            COUNT(*) FILTER (WHERE rating = 2) as two_star,
            COUNT(*) FILTER (WHERE rating = 1) as one_star,
            AVG(communication_rating) as avg_comm,
            AVG(shipping_speed_rating) as avg_ship,
            AVG(item_as_described_rating) as avg_item,
            AVG(packaging_rating) as avg_pack,
            AVG(bird_health_rating) as avg_bird_health,
            AVG(bird_temperament_accurate::int) * 100 as temp_pct,
            AVG(bird_documentation_provided::int) * 100 as doc_pct,
            MAX(created_at) as last_rating
        INTO seller_record
        FROM marketplace_seller_ratings
        WHERE seller_id = NEW.seller_id AND is_hidden = FALSE;

        -- Upsert seller stats
        INSERT INTO marketplace_seller_stats (
            seller_id, total_ratings, average_rating,
            five_star_count, four_star_count, three_star_count,
            two_star_count, one_star_count,
            avg_communication, avg_shipping_speed, avg_item_accuracy, avg_packaging,
            avg_bird_health, bird_temperament_accuracy_pct, bird_documentation_pct,
            last_rating_at, updated_at
        ) VALUES (
            NEW.seller_id, seller_record.total, seller_record.avg_rating,
            seller_record.five_star, seller_record.four_star, seller_record.three_star,
            seller_record.two_star, seller_record.one_star,
            seller_record.avg_comm, seller_record.avg_ship, seller_record.avg_item, seller_record.avg_pack,
            seller_record.avg_bird_health, seller_record.temp_pct, seller_record.doc_pct,
            seller_record.last_rating, CURRENT_TIMESTAMP
        )
        ON CONFLICT (seller_id) DO UPDATE SET
            total_ratings = EXCLUDED.total_ratings,
            average_rating = EXCLUDED.average_rating,
            five_star_count = EXCLUDED.five_star_count,
            four_star_count = EXCLUDED.four_star_count,
            three_star_count = EXCLUDED.three_star_count,
            two_star_count = EXCLUDED.two_star_count,
            one_star_count = EXCLUDED.one_star_count,
            avg_communication = EXCLUDED.avg_communication,
            avg_shipping_speed = EXCLUDED.avg_shipping_speed,
            avg_item_accuracy = EXCLUDED.avg_item_accuracy,
            avg_packaging = EXCLUDED.avg_packaging,
            avg_bird_health = EXCLUDED.avg_bird_health,
            bird_temperament_accuracy_pct = EXCLUDED.bird_temperament_accuracy_pct,
            bird_documentation_pct = EXCLUDED.bird_documentation_pct,
            last_rating_at = EXCLUDED.last_rating_at,
            updated_at = CURRENT_TIMESTAMP;

        -- Update seller tier based on ratings
        UPDATE marketplace_seller_stats
        SET seller_tier = CASE
            WHEN total_ratings >= 100 AND average_rating >= 4.9 THEN 'top_rated'
            WHEN total_ratings >= 50 AND average_rating >= 4.7 THEN 'platinum'
            WHEN total_ratings >= 25 AND average_rating >= 4.5 THEN 'gold'
            WHEN total_ratings >= 10 AND average_rating >= 4.0 THEN 'silver'
            WHEN total_ratings >= 5 THEN 'bronze'
            ELSE 'new'
        END
        WHERE seller_id = NEW.seller_id;

        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Recalculate for deleted rating
        PERFORM update_seller_rating_stats() FROM marketplace_seller_ratings WHERE seller_id = OLD.seller_id LIMIT 1;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_seller_stats
AFTER INSERT OR UPDATE OR DELETE ON marketplace_seller_ratings
FOR EACH ROW EXECUTE FUNCTION update_seller_rating_stats();

-- ============================================================================
-- 6. SEED DATA - Bird Supply Categories
-- ============================================================================

INSERT INTO marketplace_bird_supply_categories (name, slug, description, icon_name, display_order) VALUES
-- Main categories
('Cages & Enclosures', 'cages-enclosures', 'Bird cages, aviaries, and flight cages', 'cage', 1),
('Food & Nutrition', 'food-nutrition', 'Seeds, pellets, treats, and supplements', 'food', 2),
('Toys & Enrichment', 'toys-enrichment', 'Toys, swings, and enrichment activities', 'toy', 3),
('Health & Wellness', 'health-wellness', 'Health products, supplements, and first aid', 'health', 4),
('Perches & Stands', 'perches-stands', 'Perches, play stands, and gym equipment', 'perch', 5),
('Bedding & Liners', 'bedding-liners', 'Cage liners, bedding, and nesting materials', 'bedding', 6),
('Feeding Supplies', 'feeding-supplies', 'Dishes, waterers, and feeders', 'feeder', 7),
('Travel & Carriers', 'travel-carriers', 'Carriers, travel cages, and harnesses', 'travel', 8),
('Grooming', 'grooming', 'Nail care, bathing, and grooming supplies', 'grooming', 9),
('Books & Resources', 'books-resources', 'Care guides, training books, and resources', 'book', 10),
('Breeding Supplies', 'breeding-supplies', 'Nesting boxes, incubators, and breeding equipment', 'breeding', 11)
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for Cages
INSERT INTO marketplace_bird_supply_categories (name, slug, parent_id, description, display_order)
SELECT 'Flight Cages', 'flight-cages', id, 'Large cages for flight exercise', 1
FROM marketplace_bird_supply_categories WHERE slug = 'cages-enclosures'
UNION ALL
SELECT 'Travel Cages', 'travel-cages-sub', id, 'Portable cages for transport', 2
FROM marketplace_bird_supply_categories WHERE slug = 'cages-enclosures'
UNION ALL
SELECT 'Aviaries', 'aviaries', id, 'Outdoor and indoor aviaries', 3
FROM marketplace_bird_supply_categories WHERE slug = 'cages-enclosures'
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for Food
INSERT INTO marketplace_bird_supply_categories (name, slug, parent_id, description, display_order)
SELECT 'Seed Mixes', 'seed-mixes', id, 'Quality seed blends for birds', 1
FROM marketplace_bird_supply_categories WHERE slug = 'food-nutrition'
UNION ALL
SELECT 'Pellets', 'pellets', id, 'Nutritionally complete pellet diets', 2
FROM marketplace_bird_supply_categories WHERE slug = 'food-nutrition'
UNION ALL
SELECT 'Treats & Snacks', 'treats-snacks', id, 'Healthy treats and snacks', 3
FROM marketplace_bird_supply_categories WHERE slug = 'food-nutrition'
UNION ALL
SELECT 'Supplements', 'supplements', id, 'Vitamins and nutritional supplements', 4
FROM marketplace_bird_supply_categories WHERE slug = 'food-nutrition'
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for Toys
INSERT INTO marketplace_bird_supply_categories (name, slug, parent_id, description, display_order)
SELECT 'Foraging Toys', 'foraging-toys', id, 'Toys that encourage natural foraging', 1
FROM marketplace_bird_supply_categories WHERE slug = 'toys-enrichment'
UNION ALL
SELECT 'Chew Toys', 'chew-toys', id, 'Safe chewing and shredding toys', 2
FROM marketplace_bird_supply_categories WHERE slug = 'toys-enrichment'
UNION ALL
SELECT 'Swings & Ladders', 'swings-ladders', id, 'Swings, ladders, and climbing toys', 3
FROM marketplace_bird_supply_categories WHERE slug = 'toys-enrichment'
UNION ALL
SELECT 'Puzzle Toys', 'puzzle-toys', id, 'Interactive puzzle and training toys', 4
FROM marketplace_bird_supply_categories WHERE slug = 'toys-enrichment'
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE marketplace_seller_ratings IS 'Individual ratings and reviews for marketplace sellers';
COMMENT ON TABLE marketplace_seller_stats IS 'Aggregated seller rating statistics for performance queries';
COMMENT ON TABLE marketplace_bird_supply_categories IS 'Categories for bird supplies, food, toys, cages, etc.';
COMMENT ON TABLE marketplace_bird_supply_attributes IS 'Extended attributes for bird supply product listings';

COMMENT ON COLUMN marketplace_seller_stats.seller_tier IS 'Seller tier based on rating count and average: new, bronze, silver, gold, platinum, top_rated';
COMMENT ON COLUMN marketplace_bird_supply_attributes.bulk_discount_tiers IS 'JSON array of quantity-based discount tiers for wholesale';

/**
 * Seed Bird Supplies Marketplace with Products and Reviews
 * Creates realistic bird supply listings with seller ratings
 */

const db = require('../config/database');

const birdSupplies = [
  // Cages & Enclosures
  {
    title: "Large Flight Cage - 32x21x63 inches",
    description: "Spacious flight cage perfect for budgies, cockatiels, or finches. Features two large front doors, four feeder doors, and includes perches and food cups. Powder-coated steel construction. Easy to assemble with no tools required.",
    price: 149.99,
    category: "cages-enclosures",
    brand: "Prevue Pet",
    location: { city: "Los Angeles", state: "CA", lat: 34.0522, lng: -118.2437 },
    image: "https://images.unsplash.com/photo-1520808663317-647b476a81b9?w=800",
    attrs: { cage_bar_spacing: 0.5, cage_material: "powder-coated steel", suitable_bird_sizes: ["small", "medium"] }
  },
  {
    title: "Deluxe Parrot Cage with Play Top",
    description: "Premium parrot cage with integrated play top gym. Ideal for conures, amazons, and african greys. Includes seed guards, waste tray, and locking casters. Bar spacing 3/4 inch.",
    price: 329.00,
    category: "cages-enclosures",
    brand: "A&E Cage Company",
    location: { city: "Houston", state: "TX", lat: 29.7604, lng: -95.3698 },
    image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800",
    attrs: { cage_bar_spacing: 0.75, cage_material: "wrought iron", suitable_bird_sizes: ["medium", "large"] }
  },
  {
    title: "Stainless Steel Macaw Cage - Lifetime Quality",
    description: "Professional grade stainless steel cage for large parrots. Will last a lifetime! Non-toxic, easy to clean, resistant to rust and bacteria. Investment piece for your feathered family member.",
    price: 1299.00,
    category: "cages-enclosures",
    brand: "Kings Cages",
    location: { city: "Phoenix", state: "AZ", lat: 33.4484, lng: -112.0740 },
    image: "https://images.unsplash.com/photo-1544923246-77307dd628b5?w=800",
    attrs: { cage_bar_spacing: 1.0, cage_material: "stainless steel", suitable_bird_sizes: ["large", "extra-large"] }
  },

  // Food & Nutrition
  {
    title: "Zupreem FruitBlend Flavor Pellets - Medium Birds",
    description: "Colorful, fruity pellets loved by cockatiels, quakers, and small conures. Fortified with essential vitamins and minerals. No artificial preservatives. 2lb bag.",
    price: 14.99,
    category: "food-nutrition",
    brand: "ZuPreem",
    location: { city: "Miami", state: "FL", lat: 25.7617, lng: -80.1918 },
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
    attrs: { food_type: "pellet", food_weight_oz: 32, suitable_species: ["Cockatiel", "Conure", "Quaker"] }
  },
  {
    title: "Kaytee Forti-Diet Pro Health - Cockatiel",
    description: "Nutritionally fortified daily diet for cockatiels. Contains DHA omega-3 for brain health and natural probiotics. Larger, more desirable pieces birds love. 5lb bag.",
    price: 12.49,
    category: "food-nutrition",
    brand: "Kaytee",
    location: { city: "Denver", state: "CO", lat: 39.7392, lng: -104.9903 },
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
    attrs: { food_type: "seed", food_weight_oz: 80, suitable_species: ["Cockatiel"] }
  },
  {
    title: "Harrison's Adult Lifetime Fine Pellets",
    description: "Organic, veterinarian-recommended pellets. The gold standard in avian nutrition. Made with certified organic ingredients. Ideal for small to medium birds. 1lb bag.",
    price: 18.99,
    category: "food-nutrition",
    brand: "Harrison's Bird Foods",
    location: { city: "Seattle", state: "WA", lat: 47.6062, lng: -122.3321 },
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
    attrs: { food_type: "pellet", food_weight_oz: 16, suitable_species: ["Budgerigar", "Cockatiel", "Lovebird", "Finch"] }
  },
  {
    title: "Lafeber's Avi-Cakes - Parrot Size",
    description: "Nutritious avi-cakes that provide foraging enrichment. Balanced nutrition with omega fatty acids. Birds work to break apart the cakes, preventing boredom. 12oz box.",
    price: 9.99,
    category: "food-nutrition",
    brand: "Lafeber",
    location: { city: "Chicago", state: "IL", lat: 41.8781, lng: -87.6298 },
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
    attrs: { food_type: "treat", food_weight_oz: 12, suitable_species: ["African Grey", "Amazon", "Cockatoo", "Macaw"] }
  },

  // Toys & Enrichment
  {
    title: "Planet Pleasures Pineapple Foraging Toy",
    description: "All-natural foraging toy made from palm leaves. Stuff with treats for hours of entertainment. Completely bird-safe and biodegradable. Great for medium birds.",
    price: 8.99,
    category: "toys-enrichment",
    brand: "Planet Pleasures",
    location: { city: "Portland", state: "OR", lat: 45.5152, lng: -122.6784 },
    image: "https://images.unsplash.com/photo-1518882605630-8eb651fd5a9d?w=800",
    attrs: { toy_type: "foraging", toy_materials: ["palm leaf", "natural fiber"], bird_safe: true }
  },
  {
    title: "Super Bird Creations Flying Trapeze",
    description: "Colorful rope trapeze swing that birds love! Features cotton rope and wooden beads. Perfect for climbing, swinging, and preening. Suitable for medium to large birds.",
    price: 15.99,
    category: "toys-enrichment",
    brand: "Super Bird Creations",
    location: { city: "Austin", state: "TX", lat: 30.2672, lng: -97.7431 },
    image: "https://images.unsplash.com/photo-1518882605630-8eb651fd5a9d?w=800",
    attrs: { toy_type: "swing", toy_materials: ["cotton rope", "wood", "acrylic"], bird_safe: true }
  },
  {
    title: "Bonka Bird Toys Shredding Tower",
    description: "Ultimate shredding toy for birds who love to destroy! Made with bird-safe paper, cardboard, and wood. Satisfies natural chewing instincts. Lasts 2-4 weeks depending on bird size.",
    price: 12.49,
    category: "toys-enrichment",
    brand: "Bonka Bird Toys",
    location: { city: "San Diego", state: "CA", lat: 32.7157, lng: -117.1611 },
    image: "https://images.unsplash.com/photo-1518882605630-8eb651fd5a9d?w=800",
    attrs: { toy_type: "chew", toy_materials: ["paper", "cardboard", "wood"], bird_safe: true }
  },

  // Health & Wellness
  {
    title: "Nekton-S Multi-Vitamin Supplement",
    description: "Complete vitamin supplement for all cage birds. Essential for birds on seed diets. Dissolves easily in water. Veterinarian recommended. 35g container.",
    price: 16.99,
    category: "health-wellness",
    brand: "Nekton",
    location: { city: "Atlanta", state: "GA", lat: 33.7490, lng: -84.3880 },
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800",
    attrs: { health_product_type: "supplement", requires_vet_prescription: false }
  },
  {
    title: "Vetafarm Calcivet Calcium Supplement",
    description: "Liquid calcium and vitamin D3 supplement. Essential for egg-laying hens and growing birds. Prevents calcium deficiency. Simply add to drinking water. 100ml bottle.",
    price: 14.49,
    category: "health-wellness",
    brand: "Vetafarm",
    location: { city: "Dallas", state: "TX", lat: 32.7767, lng: -96.7970 },
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800",
    attrs: { health_product_type: "supplement", requires_vet_prescription: false }
  },

  // Perches & Stands
  {
    title: "Java Wood Multi-Branch Perch",
    description: "Natural Java wood perch with multiple branches. Varying diameters promote healthy feet. Mounts easily to cage bars. Approximately 12 inches long.",
    price: 19.99,
    category: "perches-stands",
    brand: "A&E Cage Company",
    location: { city: "Las Vegas", state: "NV", lat: 36.1699, lng: -115.1398 },
    image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800",
    attrs: { suitable_bird_sizes: ["small", "medium", "large"] }
  },
  {
    title: "Polly's Pet Products Sandy Perch",
    description: "Textured sandy perch helps keep nails trimmed naturally. Comfortable grip for bird's feet. Available in multiple sizes. This listing is for medium (1 inch diameter).",
    price: 7.99,
    category: "perches-stands",
    brand: "Polly's Pet Products",
    location: { city: "Orlando", state: "FL", lat: 28.5383, lng: -81.3792 },
    image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800",
    attrs: { suitable_bird_sizes: ["medium"] }
  },
  {
    title: "Tabletop Play Stand with Feeding Cups",
    description: "Portable tabletop play stand for out-of-cage time. Includes 2 stainless steel cups and toy hook. Great for training sessions. 14x14x18 inches.",
    price: 49.99,
    category: "perches-stands",
    brand: "Prevue Pet",
    location: { city: "Tampa", state: "FL", lat: 27.9506, lng: -82.4572 },
    image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800",
    attrs: { suitable_bird_sizes: ["small", "medium"] }
  },

  // Feeding Supplies
  {
    title: "Lixit Quick Lock Crock - 10oz",
    description: "Heavy-duty crock that locks securely to cage. Dishwasher safe. Birds can't tip it over! Perfect for food, water, or treats. Stainless steel construction.",
    price: 6.99,
    category: "feeding-supplies",
    brand: "Lixit",
    location: { city: "Indianapolis", state: "IN", lat: 39.7684, lng: -86.1581 },
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
    attrs: {}
  },
  {
    title: "JW Pet InSight Clean Cup - Medium",
    description: "Innovative design keeps food and water clean longer. Hooded design prevents debris. Easy to remove and clean. Great for messy eaters!",
    price: 4.99,
    category: "feeding-supplies",
    brand: "JW Pet",
    location: { city: "Reno", state: "NV", lat: 39.5296, lng: -119.8138 },
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
    attrs: {}
  },

  // Travel & Carriers
  {
    title: "Prevue Travel Carrier - Medium",
    description: "Sturdy travel carrier for vet visits and short trips. Features carrying handle and secure door latch. Includes removable perch and cup. 12x9x15 inches.",
    price: 34.99,
    category: "travel-carriers",
    brand: "Prevue Pet",
    location: { city: "Boston", state: "MA", lat: 42.3601, lng: -71.0589 },
    image: "https://images.unsplash.com/photo-1520808663317-647b476a81b9?w=800",
    attrs: { suitable_bird_sizes: ["small", "medium"] }
  },
  {
    title: "Aviator Bird Harness - Petite",
    description: "The original bird harness and leash! Safe way to take your bird outdoors. Escape-proof design. This listing is petite size for budgies and lovebirds.",
    price: 24.99,
    category: "travel-carriers",
    brand: "The Aviator",
    location: { city: "San Francisco", state: "CA", lat: 37.7749, lng: -122.4194 },
    image: "https://images.unsplash.com/photo-1520808663317-647b476a81b9?w=800",
    attrs: { suitable_bird_sizes: ["small"] }
  },

  // Breeding Supplies
  {
    title: "Prevue Cockatiel Nest Box",
    description: "Quality wooden nest box sized for cockatiels. Includes inspection door and removable bottom. Pine construction. 11.5x11.5x10 inches.",
    price: 18.99,
    category: "breeding-supplies",
    brand: "Prevue Pet",
    location: { city: "Nashville", state: "TN", lat: 36.1627, lng: -86.7816 },
    image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800",
    attrs: { suitable_bird_sizes: ["medium"] }
  },
  {
    title: "Kaytee Nesting Material - Natural",
    description: "Soft, natural nesting material for breeding birds. Safe for all species. Helps birds build comfortable nests. 1oz bag.",
    price: 3.99,
    category: "breeding-supplies",
    brand: "Kaytee",
    location: { city: "Minneapolis", state: "MN", lat: 44.9778, lng: -93.2650 },
    image: "https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=800",
    attrs: {}
  }
];

const reviewTemplates = [
  { rating: 5, title: "Excellent product!", texts: [
    "My birds absolutely love this! Great quality and fast shipping.",
    "Exceeded my expectations. Will definitely buy again.",
    "Perfect for my feathered friends. Highly recommend!",
    "Best purchase I've made for my birds. Amazing quality.",
    "Outstanding product! My cockatiel goes crazy for it."
  ]},
  { rating: 5, title: "Great quality", texts: [
    "Very well made and my birds love it.",
    "Fantastic quality for the price. Birds approved!",
    "Sturdy construction, exactly as described.",
    "Premium quality. Worth every penny.",
    "My parrot has been so happy since we got this."
  ]},
  { rating: 4, title: "Good product", texts: [
    "Nice product, birds seem to enjoy it. Shipping was a bit slow.",
    "Good quality overall. Minor issue with packaging but product was fine.",
    "Pretty good, would buy again. Birds like it.",
    "Solid product, meets expectations. Recommended.",
    "Good value for money. Birds are happy."
  ]},
  { rating: 4, title: "Happy with purchase", texts: [
    "Birds took a few days to warm up to it, but now they love it!",
    "Good product, slightly smaller than expected but still works great.",
    "Quality is good. Wish it came in more colors.",
    "Works well for my cockatiels. Good purchase.",
    "Nice addition to the cage. Birds enjoy it."
  ]},
  { rating: 3, title: "It's okay", texts: [
    "Decent product but not amazing. Gets the job done.",
    "Average quality. My birds use it occasionally.",
    "It's fine, nothing special. Works as expected.",
    "Okay product, might look for alternatives next time."
  ]},
  { rating: 2, title: "Not impressed", texts: [
    "Quality could be better. My bird barely touches it.",
    "Smaller than pictured. Disappointed.",
    "Broke after a few weeks. Expected better durability."
  ]},
  { rating: 1, title: "Would not recommend", texts: [
    "Poor quality, fell apart within days.",
    "My bird was scared of it and won't go near it.",
    "Complete waste of money. Very disappointed."
  ]}
];

const userNames = [
  "parrot_lover", "bird_mom", "feathered_friends", "cockatiel_crazy", "budgie_breeder",
  "avian_enthusiast", "polly_parent", "chirpy_chick", "finch_fan", "conure_keeper",
  "lovebird_lucy", "macaw_mike", "tweety_owner", "birdie_best", "cage_bird_club"
];

async function seedBirdSupplies() {
  db.initializeDatabase();
  await db.testConnection();

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');
    console.log('🌱 Starting bird supplies seed...\n');

    // Get existing users or create sellers
    const sellersResult = await client.query(
      `SELECT id, username FROM users WHERE username IN ('admin', 'bird_breeder', 'testuser') LIMIT 3`
    );

    let sellerIds = sellersResult.rows.map(r => r.id);

    if (sellerIds.length === 0) {
      // Create a seller
      const newSeller = await client.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name)
         VALUES ('supply_seller', 'seller@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Supply', 'Seller')
         RETURNING id`
      );
      sellerIds = [newSeller.rows[0].id];
    }

    console.log(`✓ Using ${sellerIds.length} seller(s)\n`);

    // Get/create buyer users for reviews
    let buyerIds = [];
    for (const username of userNames.slice(0, 10)) {
      const existing = await client.query(`SELECT id FROM users WHERE username = $1`, [username]);
      if (existing.rows.length > 0) {
        buyerIds.push(existing.rows[0].id);
      } else {
        const newUser = await client.query(
          `INSERT INTO users (username, email, password_hash, first_name, last_name)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [username, `${username}@example.com`, '$2a$10$abcdefghijklmnopqrstuv', username.split('_')[0], 'User']
        );
        buyerIds.push(newUser.rows[0].id);
      }
    }
    console.log(`✓ Created/found ${buyerIds.length} reviewer users\n`);

    // Get bird supply category IDs
    const categoriesResult = await client.query(
      `SELECT id, slug FROM marketplace_bird_supply_categories WHERE parent_id IS NULL`
    );
    const categoryMap = {};
    for (const cat of categoriesResult.rows) {
      categoryMap[cat.slug] = cat.id;
    }
    console.log(`✓ Found ${Object.keys(categoryMap).length} supply categories\n`);

    // Get main marketplace category for birds/supplies
    let mainCategoryId;
    const mainCatResult = await client.query(
      `SELECT id FROM marketplace_categories WHERE name ILIKE '%bird%' OR name ILIKE '%pet%' LIMIT 1`
    );
    if (mainCatResult.rows.length > 0) {
      mainCategoryId = mainCatResult.rows[0].id;
    } else {
      const newCat = await client.query(
        `INSERT INTO marketplace_categories (name, description, icon) VALUES ('Bird Supplies', 'Supplies for pet birds', '🐦') RETURNING id`
      );
      mainCategoryId = newCat.rows[0].id;
    }

    let listingCount = 0;
    let reviewCount = 0;

    // Create supply listings
    for (const supply of birdSupplies) {
      const sellerId = sellerIds[Math.floor(Math.random() * sellerIds.length)];

      // Create marketplace listing
      const listingResult = await client.query(
        `INSERT INTO marketplace_listings
         (user_id, title, description, price, location_city, location_state, location_latitude, location_longitude,
          category_id, listing_type, status, view_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          sellerId,
          supply.title,
          supply.description,
          supply.price,
          supply.location.city,
          supply.location.state,
          supply.location.lat,
          supply.location.lng,
          mainCategoryId,
          'sale',
          'active',
          Math.floor(Math.random() * 500) + 50
        ]
      );

      const listingId = listingResult.rows[0].id;

      // Create bird supply attributes
      const supplyCategoryId = categoryMap[supply.category] || null;
      await client.query(
        `INSERT INTO marketplace_bird_supply_attributes
         (listing_id, supply_category_id, brand, cage_bar_spacing, cage_material, suitable_bird_sizes,
          food_type, food_weight_oz, suitable_species, toy_type, toy_materials, bird_safe,
          health_product_type, requires_vet_prescription)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          listingId,
          supplyCategoryId,
          supply.brand || null,
          supply.attrs?.cage_bar_spacing || null,
          supply.attrs?.cage_material || null,
          supply.attrs?.suitable_bird_sizes || null,
          supply.attrs?.food_type || null,
          supply.attrs?.food_weight_oz || null,
          supply.attrs?.suitable_species || null,
          supply.attrs?.toy_type || null,
          supply.attrs?.toy_materials || null,
          supply.attrs?.bird_safe ?? null,
          supply.attrs?.health_product_type || null,
          supply.attrs?.requires_vet_prescription || false
        ]
      );

      // Add image
      if (supply.image) {
        await client.query(
          `INSERT INTO marketplace_media (listing_id, file_url, file_type, file_size, display_order, is_primary)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [listingId, supply.image, 'image/jpeg', 0, 1, true]
        );
      }

      listingCount++;
      console.log(`✓ Created listing: ${supply.title}`);

      // Add 3-8 reviews per listing
      const numReviews = Math.floor(Math.random() * 6) + 3;
      const usedBuyers = new Set();

      for (let i = 0; i < numReviews && i < buyerIds.length; i++) {
        // Pick a random buyer that hasn't reviewed this listing
        let buyerId;
        do {
          buyerId = buyerIds[Math.floor(Math.random() * buyerIds.length)];
        } while (usedBuyers.has(buyerId) && usedBuyers.size < buyerIds.length);

        if (usedBuyers.has(buyerId)) continue;
        usedBuyers.add(buyerId);

        // Skip if buyer is seller
        if (buyerId === sellerId) continue;

        // Weight towards positive reviews (realistic distribution)
        const rand = Math.random();
        let template;
        if (rand < 0.45) template = reviewTemplates[0]; // 5 star
        else if (rand < 0.75) template = reviewTemplates[1]; // 5 star
        else if (rand < 0.85) template = reviewTemplates[2]; // 4 star
        else if (rand < 0.92) template = reviewTemplates[3]; // 4 star
        else if (rand < 0.96) template = reviewTemplates[4]; // 3 star
        else if (rand < 0.98) template = reviewTemplates[5]; // 2 star
        else template = reviewTemplates[6]; // 1 star

        const reviewText = template.texts[Math.floor(Math.random() * template.texts.length)];

        try {
          await client.query(
            `INSERT INTO marketplace_seller_ratings
             (seller_id, buyer_id, listing_id, rating, review_title, review_text,
              communication_rating, shipping_speed_rating, item_as_described_rating, packaging_rating,
              is_verified_purchase, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
            [
              sellerId,
              buyerId,
              listingId,
              template.rating,
              template.title,
              reviewText,
              Math.max(1, template.rating + Math.floor(Math.random() * 2) - 1), // communication
              Math.max(1, template.rating + Math.floor(Math.random() * 2) - 1), // shipping
              template.rating, // item as described
              Math.max(1, template.rating + Math.floor(Math.random() * 2) - 1), // packaging
              Math.random() > 0.3, // 70% verified
              new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000) // random date in last 90 days
            ]
          );
          reviewCount++;
        } catch (e) {
          // Skip duplicate reviews
          if (!e.message.includes('duplicate')) {
            console.error('Review error:', e.message);
          }
        }
      }
    }

    await client.query('COMMIT');

    console.log('\n🎉 Bird supplies seed completed!');
    console.log(`📦 Created ${listingCount} supply listings`);
    console.log(`⭐ Created ${reviewCount} reviews`);
    console.log(`📁 Categories: Cages, Food, Toys, Health, Perches, Feeding, Travel, Breeding`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding bird supplies:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedBirdSupplies()
    .then(() => {
      console.log('\n✅ Seed script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Seed script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedBirdSupplies };

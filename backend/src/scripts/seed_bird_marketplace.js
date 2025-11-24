/**
 * Seed Bird Marketplace with Extensive Test Data
 * Creates realistic bird listings with images and detailed attributes
 */

const db = require('../config/database');

// Bird listing data with realistic details
const birdListings = [
  // Budgerigars
  {
    title: "Beautiful Blue Budgie Pair - Proven Breeders",
    description: "Stunning pair of blue budgerigars with excellent genetics. These birds have successfully raised 3 clutches together. Very healthy and active. Perfect for breeding or as companions. Both are hand-tamed and friendly.",
    price: 85.00,
    location: "Los Angeles, CA",
    latitude: 34.0522,
    longitude: -118.2437,
    bird_species: "Budgerigar",
    bird_subspecies: null,
    color_mutation: "Blue",
    color_description: "Vibrant sky blue with white highlights",
    sex: "pair",
    age_years: 2,
    age_months: 3,
    health_status: "excellent",
    health_certificate_available: true,
    dna_sexed: true,
    temperament: "friendly",
    is_hand_fed: true,
    is_hand_tamed: true,
    can_talk: true,
    talks_vocabulary: "Hello, Pretty bird, Come here",
    proven_breeder: true,
    breeder_certification: "NPIP Certified",
    shipping_methods: ["Local pickup", "Ground shipping"],
    includes_carrier: true,
    includes_health_guarantee: true,
    health_guarantee_duration_days: 14,
    image_url: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&h=600&fit=crop"
  },
  {
    title: "Lutino Budgie - Hand Tamed Baby",
    description: "Adorable 4-month-old lutino budgerigar looking for a loving home. This baby is hand-fed, very tame, and loves to sit on your finger. Eats pellets, seeds, and fresh vegetables. Great for first-time bird owners!",
    price: 45.00,
    location: "San Diego, CA",
    latitude: 32.7157,
    longitude: -117.1611,
    bird_species: "Budgerigar",
    color_mutation: "Lutino",
    color_description: "Bright yellow with red eyes",
    sex: "male",
    age_years: 0,
    age_months: 4,
    health_status: "excellent",
    health_certificate_available: true,
    dna_sexed: true,
    temperament: "friendly",
    is_hand_fed: true,
    is_hand_tamed: true,
    can_talk: false,
    proven_breeder: false,
    includes_health_guarantee: true,
    health_guarantee_duration_days: 7,
    image_url: "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=800&h=600&fit=crop"
  },
  {
    title: "Rare Albino Budgie - Show Quality",
    description: "Exceptional albino budgerigar with perfect feather condition and conformation. This bird has won ribbons at local bird shows. Pure white with striking red eyes. Very rare coloration. Serious inquiries only.",
    price: 120.00,
    location: "Phoenix, AZ",
    latitude: 33.4484,
    longitude: -112.0740,
    bird_species: "Budgerigar",
    color_mutation: "Albino",
    color_description: "Pure white with red eyes",
    sex: "female",
    age_years: 1,
    age_months: 2,
    health_status: "excellent",
    health_certificate_available: true,
    dna_sexed: true,
    temperament: "tame",
    is_hand_fed: true,
    is_hand_tamed: true,
    show_quality: true,
    breeder_certification: "AFA Member",
    includes_health_guarantee: true,
    health_guarantee_duration_days: 30,
    image_url: "https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800&h=600&fit=crop"
  },

  // Cockatiels
  {
    title: "Pearl Cockatiel - Sweet & Affectionate",
    description: "Gorgeous pearl cockatiel hen, 8 months old. She loves head scratches and will whistle back at you. Very social and enjoys being out of her cage. Comes with care guide and favorite toys.",
    price: 95.00,
    location: "Austin, TX",
    latitude: 30.2672,
    longitude: -97.7431,
    bird_species: "Cockatiel",
    color_mutation: "Pearl",
    color_description: "Beautiful pearl pattern with yellow and grey",
    sex: "female",
    age_years: 0,
    age_months: 8,
    health_status: "excellent",
    health_certificate_available: true,
    dna_sexed: true,
    temperament: "friendly",
    is_hand_fed: true,
    is_hand_tamed: true,
    can_talk: false,
    includes_health_guarantee: true,
    health_guarantee_duration_days: 14,
    image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
  },
  {
    title: "Lutino Cockatiel Male - Excellent Singer",
    description: "Stunning lutino cockatiel cock bird with a beautiful song repertoire. He whistles several tunes including 'Happy Birthday' and 'Jingle Bells'. Very healthy and active. DNA sexed male. Perfect companion bird.",
    price: 110.00,
    location: "Houston, TX",
    latitude: 29.7604,
    longitude: -95.3698,
    bird_species: "Cockatiel",
    color_mutation: "Lutino",
    color_description: "Bright yellow and white with orange cheek patches",
    sex: "male",
    age_years: 1,
    age_months: 6,
    health_status: "excellent",
    health_certificate_available: true,
    dna_sexed: true,
    temperament: "friendly",
    is_hand_fed: true,
    is_hand_tamed: true,
    can_talk: false,
    talks_vocabulary: "Whistles: Happy Birthday, Jingle Bells, Andy Griffith theme",
    shipping_methods: ["Local pickup", "Airport shipping"],
    includes_health_guarantee: true,
    health_guarantee_duration_days: 14,
    image_url: "https://images.unsplash.com/photo-1598224750208-e0b4d2e0c3de?w=800&h=600&fit=crop"
  },
  {
    title: "Normal Grey Cockatiel Breeding Pair",
    description: "Proven breeding pair of normal grey cockatiels. Both are 3 years old and have raised multiple successful clutches. Healthy, strong birds with excellent genetics. Great for breeding program or as aviary birds.",
    price: 150.00,
    location: "Dallas, TX",
    latitude: 32.7767,
    longitude: -96.7970,
    bird_species: "Cockatiel",
    color_mutation: "Normal Grey",
    color_description: "Classic grey body with yellow face and orange cheeks",
    sex: "pair",
    age_years: 3,
    age_months: 0,
    health_status: "excellent",
    health_certificate_available: true,
    dna_sexed: true,
    temperament: "bonded",
    is_hand_fed: false,
    proven_breeder: true,
    breeding_history: "Successfully raised 8 clutches with 4-6 babies each",
    breeder_certification: "NPIP Certified",
    includes_health_guarantee: true,
    health_guarantee_duration_days: 7,
    image_url: "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=800&h=600&fit=crop"
  },

  // Green Cheek Conures
  {
    title: "Pineapple Green Cheek Conure - Super Tame!",
    description: "Incredibly sweet pineapple green cheek conure baby! Hand-fed from 2 weeks old, this little clown is ready for their forever home. Loves to play, cuddle, and make you laugh. Step-up trained and weaned onto pellets.",
    price: 375.00,
    location: "Miami, FL",
    latitude: 25.7617,
    longitude: -80.1918,
    bird_species: "Green Cheek Conure",
    color_mutation: "Pineapple",
    color_description: "Beautiful yellow, orange, and red coloring with light green wings",
    sex: "unknown",
    age_years: 0,
    age_months: 3,
    health_status: "excellent",
    health_certificate_available: true,
    dna_sexed: false,
    temperament: "friendly",
    is_hand_fed: true,
    is_hand_tamed: true,
    can_talk: false,
    socialization_level: "highly_social",
    shipping_methods: ["Local pickup", "Airport shipping"],
    includes_carrier: true,
    includes_health_guarantee: true,
    health_guarantee_duration_days: 30,
    package_inclusions: "Starter food pack, favorite toys, care guide",
    image_url: "https://images.unsplash.com/photo-1580421470026-83bae18d2c82?w=800&h=600&fit=crop"
  },
  {
    title: "Normal Green Cheek Conure - Playful Personality",
    description: "5-month-old normal green cheek conure with a huge personality! This little bird loves to hang upside down, play with toys, and snuggle in your hoodie. Very social and entertaining. Great family pet.",
    price: 325.00,
    location: "Orlando, FL",
    latitude: 28.5383,
    longitude: -81.3792,
    bird_species: "Green Cheek Conure",
    color_mutation: null,
    color_description: "Natural green coloring with grey head and maroon tail",
    sex: "unknown",
    age_years: 0,
    age_months: 5,
    health_status: "excellent",
    health_certificate_available: true,
    temperament: "friendly",
    is_hand_fed: true,
    is_hand_tamed: true,
    socialization_level: "highly_social",
    includes_health_guarantee: true,
    health_guarantee_duration_days: 21,
    image_url: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&h=600&fit=crop"
  },

  // Sun Conures
  {
    title: "Sun Conure - Vibrant & Loving",
    description: "Stunning sun conure with brilliant orange and yellow plumage. This bird is a real showstopper! Very affectionate and loves attention. WARNING: Sun conures are LOUD! Best for experienced bird owners who can handle their vocal nature.",
    price: 550.00,
    location: "Tampa, FL",
    latitude: 27.9506,
    longitude: -82.4572,
    bird_species: "Sun Conure",
    color_mutation: null,
    color_description: "Brilliant yellow and orange with hints of green",
    sex: "male",
    age_years: 1,
    age_months: 0,
    health_status: "excellent",
    health_certificate_available: true,
    dna_sexed: true,
    temperament: "friendly",
    is_hand_fed: true,
    is_hand_tamed: true,
    can_talk: true,
    talks_vocabulary: "Hello, Pretty bird, What doing?",
    noise_level: "very_loud",
    socialization_level: "highly_social",
    shipping_methods: ["Local pickup", "Airport shipping"],
    includes_health_guarantee: true,
    health_guarantee_duration_days: 30,
    image_url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop"
  },

  // Lovebirds
  {
    title: "Peach-Faced Lovebirds - Bonded Pair",
    description: "Beautiful bonded pair of peach-faced lovebirds. They are inseparable and must go together. Very active and entertaining to watch. Not hand-tamed but make wonderful aviary birds. Proven breeders.",
    price: 125.00,
    location: "Las Vegas, NV",
    latitude: 36.1699,
    longitude: -115.1398,
    bird_species: "Peach-Faced Lovebird",
    color_mutation: null,
    color_description: "Green body with peach-colored face and blue rump",
    sex: "pair",
    age_years: 2,
    age_months: 0,
    health_status: "excellent",
    temperament: "bonded",
    is_hand_fed: false,
    proven_breeder: true,
    includes_health_guarantee: true,
    health_guarantee_duration_days: 7,
    image_url: "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=800&h=600&fit=crop"
  },
  {
    title: "Hand-Raised Fischer's Lovebird Baby",
    description: "Super sweet Fischer's lovebird baby, hand-fed and very tame. Loves head scritches and playing with toys. These birds have amazing personalities packed into a tiny body. DNA test available for additional fee.",
    price: 95.00,
    location: "Reno, NV",
    latitude: 39.5296,
    longitude: -119.8138,
    bird_species: "Fischer Lovebird",
    color_mutation: null,
    color_description: "Orange face, blue rump, and green body",
    sex: "unknown",
    age_years: 0,
    age_months: 4,
    health_status: "excellent",
    health_certificate_available: true,
    temperament: "friendly",
    is_hand_fed: true,
    is_hand_tamed: true,
    socialization_level: "highly_social",
    includes_health_guarantee: true,
    health_guarantee_duration_days: 14,
    image_url: "https://images.unsplash.com/photo-1598224750208-e0b4d2e0c3de?w=800&h=600&fit=crop"
  },

  // Finches
  {
    title: "Zebra Finches - Multiple Pairs Available",
    description: "Beautiful zebra finches, multiple color variations available. These hardy little birds are perfect for beginners. Great for aviaries or indoor cages. Pairs are $40, or individuals at $25 each. Very easy to care for!",
    price: 40.00,
    location: "Seattle, WA",
    latitude: 47.6062,
    longitude: -122.3321,
    bird_species: "Zebra Finch",
    color_mutation: null,
    color_description: "Classic zebra stripes with orange cheek patches",
    sex: "pair",
    age_years: 1,
    age_months: 0,
    health_status: "good",
    temperament: "not_tame",
    is_hand_fed: false,
    proven_breeder: true,
    care_level: "beginner",
    image_url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
  },
  {
    title: "Gouldian Finches - Stunning Color Varieties",
    description: "Rare and beautiful Gouldian finches in multiple head color variations: red head, black head, and yellow head available. These are some of the most colorful birds in the world! Not hand-tame but incredible display birds.",
    price: 150.00,
    location: "Portland, OR",
    latitude: 45.5152,
    longitude: -122.6784,
    bird_species: "Gouldian Finch",
    color_mutation: null,
    color_description: "Rainbow of colors including purple, yellow, green, and blue",
    sex: "pair",
    age_years: 1,
    age_months: 6,
    health_status: "excellent",
    temperament: "not_tame",
    is_hand_fed: false,
    rare_breed: true,
    care_level: "intermediate",
    shipping_methods: ["Local pickup"],
    image_url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=600&fit=crop"
  },

  // Canaries
  {
    title: "Male Canary - Beautiful Singer",
    description: "Gorgeous yellow canary male with an amazing song! He sings for hours every morning and evening. Perfect for someone who appreciates bird song. Very healthy and eats a variety of seeds and fresh foods.",
    price: 75.00,
    location: "Denver, CO",
    latitude: 39.7392,
    longitude: -104.9903,
    bird_species: "Canary",
    color_mutation: null,
    color_description: "Bright yellow",
    sex: "male",
    age_years: 2,
    age_months: 0,
    health_status: "excellent",
    temperament: "not_tame",
    is_hand_fed: false,
    can_talk: false,
    image_url: "https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800&h=600&fit=crop"
  },

  // Indian Ringneck
  {
    title: "Indian Ringneck Parakeet - Talking Prodigy",
    description: "2-year-old Indian Ringneck with an incredible vocabulary of over 50 words and phrases! Very intelligent and entertaining. Knows how to open his cage and play games. Requires an experienced owner who can provide mental stimulation.",
    price: 650.00,
    location: "Chicago, IL",
    latitude: 41.8781,
    longitude: -87.6298,
    bird_species: "Indian Ringneck Parakeet",
    color_mutation: null,
    color_description: "Green body with distinctive black and pink neck ring",
    sex: "male",
    age_years: 2,
    age_months: 0,
    health_status: "excellent",
    health_certificate_available: true,
    dna_sexed: true,
    temperament: "tame",
    is_hand_fed: true,
    is_hand_tamed: true,
    can_talk: true,
    talks_vocabulary: "Over 50 words including: Hello, Good morning, I love you, Pretty bird, Want treat, Step up, and many more phrases",
    care_level: "intermediate",
    shipping_methods: ["Local pickup", "Airport shipping"],
    includes_health_guarantee: true,
    health_guarantee_duration_days: 14,
    image_url: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&h=600&fit=crop"
  },
  {
    title: "Blue Indian Ringneck - Young & Trainable",
    description: "Beautiful blue mutation Indian Ringneck, 8 months old. Still developing his ring and personality. Very smart and food motivated, making training easy. Starting to say a few words. Will make an amazing companion for the right person.",
    price: 700.00,
    location: "Indianapolis, IN",
    latitude: 39.7684,
    longitude: -86.1581,
    bird_species: "Indian Ringneck Parakeet",
    color_mutation: null,
    color_description: "Beautiful turquoise blue coloring",
    sex: "male",
    age_years: 0,
    age_months: 8,
    health_status: "excellent",
    health_certificate_available: true,
    dna_sexed: true,
    temperament: "tame",
    is_hand_fed: true,
    is_hand_tamed: true,
    can_talk: true,
    talks_vocabulary: "Learning: Hello, Pretty bird",
    care_level: "intermediate",
    includes_health_guarantee: true,
    health_guarantee_duration_days: 21,
    image_url: "https://images.unsplash.com/photo-1580421470026-83bae18d2c82?w=800&h=600&fit=crop"
  },

  // African Grey
  {
    title: "Congo African Grey - Highly Intelligent",
    description: "5-year-old Congo African Grey parrot with exceptional intelligence and talking ability. Knows over 100 words and can use them in context. Very bonded to women, shy with men. Requires experienced owner committed to daily interaction and enrichment. This is a lifetime commitment bird!",
    price: 1800.00,
    location: "Atlanta, GA",
    latitude: 33.7490,
    longitude: -84.3880,
    bird_species: "African Grey Parrot",
    color_mutation: null,
    color_description: "Grey body with bright red tail feathers",
    sex: "unknown",
    age_years: 5,
    age_months: 0,
    health_status: "excellent",
    health_certificate_available: true,
    temperament: "bonded",
    is_hand_fed: true,
    is_hand_tamed: true,
    can_talk: true,
    talks_vocabulary: "100+ words, speaks in context, mimics sounds and other pets",
    care_level: "expert",
    behavioral_notes: "Very bonded to female owner. Requires slow introduction to new people. May pluck if stressed.",
    shipping_methods: ["Local pickup only"],
    includes_health_guarantee: false,
    image_url: "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=800&h=600&fit=crop"
  }
];

async function seedBirdMarketplace() {
  // Initialize database connection
  db.initializeDatabase();
  await db.testConnection();

  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Starting bird marketplace seed...');

    // Get or create test user
    let userId;
    const userCheck = await client.query(
      `SELECT id FROM users WHERE username = 'bird_breeder' LIMIT 1`
    );

    if (userCheck.rows.length > 0) {
      userId = userCheck.rows[0].id;
      console.log('✓ Using existing bird_breeder user (ID: ' + userId + ')');
    } else {
      const userResult = await client.query(
        `INSERT INTO users (username, email, password_hash, first_name, last_name)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        ['bird_breeder', 'bird_breeder@example.com', '$2a$10$abcdefghijklmnopqrstuv', 'Bird', 'Breeder']
      );
      userId = userResult.rows[0].id;
      console.log('✓ Created bird_breeder user (ID: ' + userId + ')');
    }

    // Get category ID for birds (or create if doesn't exist)
    let categoryId;
    const categoryCheck = await client.query(
      `SELECT id FROM marketplace_categories WHERE name ILIKE '%bird%' OR name ILIKE '%pet%' LIMIT 1`
    );

    if (categoryCheck.rows.length > 0) {
      categoryId = categoryCheck.rows[0].id;
    } else {
      const categoryResult = await client.query(
        `INSERT INTO marketplace_categories (name, description, icon)
         VALUES ($1, $2, $3)
         RETURNING id`,
        ['Birds & Pets', 'Pet birds and supplies', '🐦']
      );
      categoryId = categoryResult.rows[0].id;
    }

    console.log('✓ Using category ID: ' + categoryId);

    let createdCount = 0;

    // Create bird listings
    for (const bird of birdListings) {
      // Parse location
      const locationParts = bird.location.split(', ');
      const city = locationParts[0] || 'Unknown';
      const state = locationParts[1] || 'Unknown';

      // Create marketplace listing
      const listingResult = await client.query(
        `INSERT INTO marketplace_listings
         (user_id, title, description, price, location_city, location_state, location_latitude, location_longitude,
          category_id, listing_type, status, view_count)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING id`,
        [
          userId,
          bird.title,
          bird.description,
          bird.price,
          city,
          state,
          bird.latitude,
          bird.longitude,
          categoryId,
          'sale',
          'active',
          Math.floor(Math.random() * 100) // Random view count
        ]
      );

      const listingId = listingResult.rows[0].id;

      // Create bird attributes
      await client.query(
        `INSERT INTO marketplace_bird_attributes
         (listing_id, bird_species, bird_subspecies, color_mutation, color_description,
          sex, age_years, age_months, health_status, health_certificate_available,
          dna_sexed, temperament, is_hand_fed, is_hand_tamed, can_talk, talks_vocabulary,
          proven_breeder, breeding_history, breeder_certification, includes_health_guarantee,
          health_guarantee_duration_days, shipping_methods, includes_carrier, package_inclusions,
          socialization_level, noise_level, rare_breed, show_quality, behavioral_notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)`,
        [
          listingId,
          bird.bird_species,
          bird.bird_subspecies || null,
          bird.color_mutation || null,
          bird.color_description || null,
          bird.sex || 'unknown',
          bird.age_years || null,
          bird.age_months || null,
          bird.health_status || 'good',
          bird.health_certificate_available || false,
          bird.dna_sexed || false,
          bird.temperament || null,
          bird.is_hand_fed || false,
          bird.is_hand_tamed || false,
          bird.can_talk || false,
          bird.talks_vocabulary || null,
          bird.proven_breeder || false,
          bird.breeding_history || null,
          bird.breeder_certification || null,
          bird.includes_health_guarantee || false,
          bird.health_guarantee_duration_days || null,
          bird.shipping_methods || null,
          bird.includes_carrier || false,
          bird.package_inclusions || null,
          bird.socialization_level || null,
          bird.noise_level || null,
          bird.rare_breed || false,
          bird.show_quality || false,
          bird.behavioral_notes || null
        ]
      );

      // Add image if provided
      if (bird.image_url) {
        await client.query(
          `INSERT INTO marketplace_media (listing_id, file_url, file_type, file_size, display_order, is_primary)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [listingId, bird.image_url, 'image/jpeg', 0, 1, true]
        );
      }

      createdCount++;
      console.log(`✓ Created listing ${createdCount}/${birdListings.length}: ${bird.title}`);
    }

    await client.query('COMMIT');

    console.log('\n🎉 Bird marketplace seed completed!');
    console.log(`📊 Created ${createdCount} bird listings`);
    console.log(`🐦 Species included: Budgerigars, Cockatiels, Conures, Lovebirds, Finches, Canaries, Indian Ringnecks, African Greys`);
    console.log(`🌍 Locations: Los Angeles, San Diego, Phoenix, Austin, Houston, Dallas, Miami, Orlando, Tampa, Las Vegas, Reno, Seattle, Portland, Denver, Chicago, Indianapolis, Atlanta`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding bird marketplace:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the seed if called directly
if (require.main === module) {
  seedBirdMarketplace()
    .then(() => {
      console.log('\n✅ Seed script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Seed script failed:', error);
      process.exit(1);
    });
}

module.exports = { seedBirdMarketplace };

/**
 * Seed Seller Ratings
 * Adds sample seller ratings and stats for visual testing
 */

require('dotenv').config();
const db = require('../config/database');

async function seedSellerRatings() {
  // Initialize the database connection
  db.initializeDatabase();

  const client = await db.pool.connect();

  try {
    console.log('Seeding seller ratings...\n');

    // Get users who have marketplace listings
    const sellersResult = await client.query(`
      SELECT DISTINCT ml.user_id, u.username
      FROM marketplace_listings ml
      JOIN users u ON ml.user_id = u.id
      WHERE ml.status = 'active'
      LIMIT 10
    `);

    if (sellersResult.rows.length === 0) {
      console.log('No sellers with listings found. Creating some test data...');

      // Get any users to make them sellers
      const usersResult = await client.query(`
        SELECT id, username FROM users LIMIT 5
      `);

      if (usersResult.rows.length === 0) {
        console.log('No users found in database. Please create users first.');
        return;
      }

      // Use existing users as sellers
      for (const user of usersResult.rows) {
        sellersResult.rows.push({ user_id: user.id, username: user.username });
      }
    }

    console.log(`Found ${sellersResult.rows.length} sellers to rate.\n`);

    // Get all users to act as buyers/raters
    const buyersResult = await client.query(`
      SELECT id, username FROM users LIMIT 20
    `);

    const buyers = buyersResult.rows;

    if (buyers.length < 2) {
      console.log('Need at least 2 users to create ratings.');
      return;
    }

    // Get some listings to associate with reviews
    const listingsResult = await client.query(`
      SELECT id, user_id FROM marketplace_listings LIMIT 50
    `);
    const listings = listingsResult.rows;

    // Sample review texts
    const positiveReviews = [
      "Excellent seller! Bird arrived healthy and exactly as described. Great communication throughout.",
      "Amazing experience! The cockatiel was hand-tamed just as promised. Would buy from again!",
      "Super fast shipping and the bird is beautiful. Very knowledgeable breeder.",
      "Wonderful seller, answered all my questions promptly. Bird is thriving!",
      "Top notch! Provided health certificate and detailed care instructions.",
      "Best breeder I've dealt with. Professional and caring about their birds.",
      "Great communication and the bird was well-socialized. Highly recommend!",
      "Exceptional quality birds. You can tell they're raised with love.",
      "Smooth transaction, bird arrived safely. Very happy customer!",
      "Outstanding seller! Went above and beyond to ensure safe delivery."
    ];

    const mixedReviews = [
      "Good seller overall. Shipping took a bit longer than expected but bird is healthy.",
      "Nice bird, though slightly different coloring than photos. Still happy with purchase.",
      "Decent experience. Communication could be better but product was as described.",
      "Bird is great, just wish there was more follow-up after sale."
    ];

    const criticalReviews = [
      "Bird was healthy but shipping delays caused some stress. Seller was responsive though.",
      "Okay experience. Had to follow up multiple times for tracking info."
    ];

    const reviewTitles = [
      "Great experience!",
      "Highly recommend this seller",
      "Beautiful bird, happy customer",
      "Professional breeder",
      "Good transaction",
      "Will buy again!",
      "Exceeded expectations",
      "Satisfied customer",
      "As described",
      "Fast shipping"
    ];

    // Create ratings for each seller
    for (const seller of sellersResult.rows) {
      // Determine how many ratings this seller should have (varied for realism)
      const ratingProfiles = [
        { count: 45, avgTarget: 4.9, tier: 'platinum' },   // Platinum seller
        { count: 25, avgTarget: 4.6, tier: 'gold' },       // Gold seller
        { count: 12, avgTarget: 4.3, tier: 'silver' },     // Silver seller
        { count: 6, avgTarget: 4.0, tier: 'bronze' },      // Bronze seller
        { count: 2, avgTarget: 3.5, tier: 'bronze' },      // New seller
        { count: 0, avgTarget: 0, tier: 'new' }            // No ratings
      ];

      // Pick a random profile for this seller
      const profile = ratingProfiles[Math.floor(Math.random() * ratingProfiles.length)];

      console.log(`Creating ${profile.count} ratings for seller: ${seller.username} (target tier: ${profile.tier})`);

      // Track rating counts for stats
      const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let totalRating = 0;
      let createdCount = 0;

      // Get listings for this seller
      const sellerListings = listings.filter(l => l.user_id === seller.user_id);

      for (let i = 0; i < profile.count; i++) {
        // Select a buyer (not the seller themselves)
        const availableBuyers = buyers.filter(b => b.id !== seller.user_id);
        if (availableBuyers.length === 0) continue;

        const buyer = availableBuyers[Math.floor(Math.random() * availableBuyers.length)];

        // Generate rating based on target average
        let rating;
        const rand = Math.random();
        if (profile.avgTarget >= 4.5) {
          // Mostly 5s and 4s
          rating = rand < 0.7 ? 5 : (rand < 0.95 ? 4 : 3);
        } else if (profile.avgTarget >= 4.0) {
          // Mix of 5s, 4s, some 3s
          rating = rand < 0.5 ? 5 : (rand < 0.85 ? 4 : 3);
        } else {
          // More varied
          rating = rand < 0.3 ? 5 : (rand < 0.6 ? 4 : (rand < 0.85 ? 3 : 2));
        }

        ratingCounts[rating]++;
        totalRating += rating;

        // Select appropriate review text
        let reviewText;
        if (rating >= 5) {
          reviewText = positiveReviews[Math.floor(Math.random() * positiveReviews.length)];
        } else if (rating >= 4) {
          reviewText = Math.random() > 0.5
            ? positiveReviews[Math.floor(Math.random() * positiveReviews.length)]
            : mixedReviews[Math.floor(Math.random() * mixedReviews.length)];
        } else {
          reviewText = Math.random() > 0.3
            ? mixedReviews[Math.floor(Math.random() * mixedReviews.length)]
            : criticalReviews[Math.floor(Math.random() * criticalReviews.length)];
        }

        const reviewTitle = reviewTitles[Math.floor(Math.random() * reviewTitles.length)];

        // Get a listing for this review (if available)
        const listing = sellerListings.length > 0
          ? sellerListings[i % sellerListings.length]
          : null;

        // Create the rating (with random date in past 6 months)
        const daysAgo = Math.floor(Math.random() * 180);
        const ratingDate = new Date();
        ratingDate.setDate(ratingDate.getDate() - daysAgo);

        // Generate sub-ratings
        const commRating = Math.min(5, Math.max(1, rating + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)));
        const shipRating = Math.min(5, Math.max(1, rating + (Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0)));
        const descRating = Math.min(5, Math.max(1, rating + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0)));
        const packRating = Math.min(5, Math.max(1, rating + (Math.random() > 0.8 ? (Math.random() > 0.5 ? 1 : -1) : 0)));

        try {
          await client.query(`
            INSERT INTO marketplace_seller_ratings (
              seller_id, buyer_id, listing_id, rating, review_title, review_text,
              communication_rating, shipping_speed_rating, item_as_described_rating,
              packaging_rating, is_verified_purchase, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            ON CONFLICT (buyer_id, seller_id, listing_id) DO NOTHING
          `, [
            seller.user_id,
            buyer.id,
            listing?.id || null,
            rating,
            reviewTitle,
            reviewText,
            commRating,
            shipRating,
            descRating,
            packRating,
            Math.random() > 0.2, // 80% verified purchases
            ratingDate
          ]);
          createdCount++;
        } catch (err) {
          // Skip duplicates or constraint violations
          console.log(`  Skipped duplicate rating for buyer ${buyer.id}`);
        }
      }

      // Calculate and insert/update seller stats
      if (createdCount > 0) {
        const avgRating = (totalRating / profile.count).toFixed(2);

        // Determine tier based on actual created count
        let tier = 'new';
        if (createdCount >= 30 && avgRating >= 4.5) tier = 'platinum';
        else if (createdCount >= 15 && avgRating >= 4.2) tier = 'gold';
        else if (createdCount >= 5 && avgRating >= 3.8) tier = 'silver';
        else if (createdCount >= 1) tier = 'bronze';

        const ratingDistribution = JSON.stringify({
          "1": ratingCounts[1],
          "2": ratingCounts[2],
          "3": ratingCounts[3],
          "4": ratingCounts[4],
          "5": ratingCounts[5]
        });

        await client.query(`
          INSERT INTO marketplace_seller_stats (
            user_id, total_reviews, average_rating, rating_distribution, seller_level
          ) VALUES ($1, $2, $3, $4::jsonb, $5)
          ON CONFLICT (user_id) DO UPDATE SET
            total_reviews = $2,
            average_rating = $3,
            rating_distribution = $4::jsonb,
            seller_level = $5,
            updated_at = NOW()
        `, [
          seller.user_id,
          createdCount,
          avgRating,
          ratingDistribution,
          tier
        ]);

        console.log(`  -> Created stats: ${avgRating} avg, ${createdCount} reviews, ${tier} tier`);
      }
    }

    console.log('\nSeller ratings seeded successfully!');

    // Display summary
    const statsResult = await client.query(`
      SELECT
        mss.seller_level,
        COUNT(*) as count,
        ROUND(AVG(mss.average_rating::numeric), 2) as avg_rating,
        SUM(mss.total_reviews) as total_reviews
      FROM marketplace_seller_stats mss
      GROUP BY mss.seller_level
      ORDER BY
        CASE mss.seller_level
          WHEN 'platinum' THEN 1
          WHEN 'gold' THEN 2
          WHEN 'silver' THEN 3
          WHEN 'bronze' THEN 4
          ELSE 5
        END
    `);

    console.log('\n=== Seller Stats Summary ===');
    console.log('Level       | Sellers | Avg Rating | Total Reviews');
    console.log('------------|---------|------------|---------------');
    for (const row of statsResult.rows) {
      console.log(
        `${row.seller_level.padEnd(11)} | ${String(row.count).padEnd(7)} | ${String(row.avg_rating).padEnd(10)} | ${row.total_reviews}`
      );
    }

  } catch (error) {
    console.error('Error seeding seller ratings:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedSellerRatings();

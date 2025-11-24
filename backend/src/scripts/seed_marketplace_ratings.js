/**
 * Seed random seller ratings for all marketplace sellers
 */
const db = require('../config/database');

async function seedMarketplaceRatings() {
  console.log('Seeding marketplace seller ratings...\n');

  try {
    // Initialize database connection
    await db.initializeDatabase();
    // Get all unique sellers who have listings
    const sellersResult = await db.query(`
      SELECT DISTINCT ml.user_id, u.username
      FROM marketplace_listings ml
      JOIN users u ON ml.user_id = u.id
      WHERE ml.status = 'active'
      ORDER BY ml.user_id
    `);

    const sellers = sellersResult.rows;
    console.log(`Found ${sellers.length} sellers with active listings\n`);

    // Get list of potential buyers (users who are not the seller)
    const buyersResult = await db.query(`
      SELECT id, username FROM users WHERE id <= 20 ORDER BY id
    `);
    const allBuyers = buyersResult.rows;

    for (const seller of sellers) {
      // Check if seller already has ratings
      const existingRatings = await db.query(`
        SELECT COUNT(*) as count FROM marketplace_seller_ratings WHERE seller_id = $1
      `, [seller.user_id]);

      if (parseInt(existingRatings.rows[0].count) > 0) {
        console.log(`Seller ${seller.username} (ID: ${seller.user_id}) already has ratings, skipping...`);
        continue;
      }

      // Random number of reviews (3-12)
      const numReviews = Math.floor(Math.random() * 10) + 3;

      // Get buyers who aren't this seller
      const buyers = allBuyers.filter(b => b.id !== seller.user_id);

      console.log(`Adding ${numReviews} ratings for seller ${seller.username} (ID: ${seller.user_id})...`);

      for (let i = 0; i < numReviews && i < buyers.length; i++) {
        const buyer = buyers[i];

        // Weighted random rating (biased towards higher ratings)
        const ratingWeights = [1, 2, 3, 4, 4, 4, 5, 5, 5, 5, 5, 5];
        const rating = ratingWeights[Math.floor(Math.random() * ratingWeights.length)];

        // Random review text based on rating
        const reviewTexts = {
          5: [
            "Excellent seller! Fast shipping and item exactly as described.",
            "Great experience! Would definitely buy from again.",
            "Amazing quality and communication. Highly recommend!",
            "Perfect transaction from start to finish.",
            "Couldn't be happier with my purchase!"
          ],
          4: [
            "Good seller, item arrived as expected.",
            "Nice transaction, would recommend.",
            "Happy with the purchase, quick delivery.",
            "Good communication and fair pricing."
          ],
          3: [
            "Item was okay, took a while to arrive.",
            "Average experience, nothing special.",
            "Product was fine but shipping could be faster."
          ],
          2: [
            "Item was not quite as described.",
            "Slow shipping and limited communication."
          ],
          1: [
            "Very disappointed with the purchase.",
            "Would not recommend this seller."
          ]
        };

        const texts = reviewTexts[rating];
        const reviewText = texts[Math.floor(Math.random() * texts.length)];

        // Random sub-ratings (close to main rating)
        const subRatingVariance = () => Math.max(1, Math.min(5, rating + Math.floor(Math.random() * 3) - 1));

        // Random days ago (0-90)
        const daysAgo = Math.floor(Math.random() * 90);

        await db.query(`
          INSERT INTO marketplace_seller_ratings (
            seller_id, buyer_id, rating, review_text,
            communication_rating, shipping_speed_rating, item_as_described_rating,
            is_verified_purchase, created_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW() - INTERVAL '1 day' * $8)
        `, [
          seller.user_id,
          buyer.id,
          rating,
          reviewText,
          subRatingVariance(),
          subRatingVariance(),
          subRatingVariance(),
          daysAgo
        ]);
      }

      // Update seller stats
      await updateSellerStats(seller.user_id);
    }

    console.log('\nDone seeding marketplace ratings!');

    // Show summary
    const summaryResult = await db.query(`
      SELECT
        mss.user_id,
        u.username,
        mss.total_reviews,
        mss.average_rating,
        mss.seller_level
      FROM marketplace_seller_stats mss
      JOIN users u ON mss.user_id = u.id
      ORDER BY mss.total_reviews DESC
    `);

    console.log('\nSeller Stats Summary:');
    console.log('=====================');
    for (const row of summaryResult.rows) {
      console.log(`${row.username}: ${row.total_reviews} reviews, ${parseFloat(row.average_rating).toFixed(2)} avg, ${row.seller_level} tier`);
    }

  } catch (error) {
    console.error('Error seeding ratings:', error);
  } finally {
    await db.pool.end();
  }
}

async function updateSellerStats(sellerId) {
  const statsQuery = await db.query(`
    SELECT
      COUNT(*) as total,
      AVG(rating) as avg_rating,
      COUNT(*) FILTER (WHERE rating = 5) as five_star,
      COUNT(*) FILTER (WHERE rating = 4) as four_star,
      COUNT(*) FILTER (WHERE rating = 3) as three_star,
      COUNT(*) FILTER (WHERE rating = 2) as two_star,
      COUNT(*) FILTER (WHERE rating = 1) as one_star
    FROM marketplace_seller_ratings
    WHERE seller_id = $1 AND is_hidden = FALSE
  `, [sellerId]);

  const stats = statsQuery.rows[0];

  // Determine tier
  let tier = 'new';
  if (stats.total >= 30 && stats.avg_rating >= 4.5) tier = 'platinum';
  else if (stats.total >= 15 && stats.avg_rating >= 4.2) tier = 'gold';
  else if (stats.total >= 5 && stats.avg_rating >= 3.8) tier = 'silver';
  else if (stats.total >= 1) tier = 'bronze';

  const ratingDistribution = JSON.stringify({
    "1": parseInt(stats.one_star) || 0,
    "2": parseInt(stats.two_star) || 0,
    "3": parseInt(stats.three_star) || 0,
    "4": parseInt(stats.four_star) || 0,
    "5": parseInt(stats.five_star) || 0
  });

  await db.query(`
    INSERT INTO marketplace_seller_stats (
      user_id, total_reviews, average_rating, rating_distribution, seller_level
    ) VALUES ($1, $2, $3, $4::jsonb, $5)
    ON CONFLICT (user_id) DO UPDATE SET
      total_reviews = EXCLUDED.total_reviews,
      average_rating = EXCLUDED.average_rating,
      rating_distribution = EXCLUDED.rating_distribution,
      seller_level = EXCLUDED.seller_level,
      updated_at = CURRENT_TIMESTAMP
  `, [
    sellerId,
    stats.total || 0,
    stats.avg_rating || 0,
    ratingDistribution,
    tier
  ]);
}

seedMarketplaceRatings();

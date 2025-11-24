/**
 * Marketplace Bird Supplies Routes
 * API endpoints for bird supplies, food, toys, cages, etc.
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');

/**
 * GET /api/marketplace/bird-supplies/categories
 * Get all bird supply categories
 */
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        bsc.*,
        parent.name as parent_name,
        (SELECT COUNT(*) FROM marketplace_bird_supply_attributes bsa
         JOIN marketplace_listings ml ON bsa.listing_id = ml.id
         WHERE bsa.supply_category_id = bsc.id AND ml.status = 'active') as active_listings
      FROM marketplace_bird_supply_categories bsc
      LEFT JOIN marketplace_bird_supply_categories parent ON bsc.parent_id = parent.id
      WHERE bsc.is_active = TRUE
      ORDER BY bsc.parent_id NULLS FIRST, bsc.display_order
    `);

    // Organize into hierarchical structure
    const categories = [];
    const categoryMap = {};

    result.rows.forEach(cat => {
      categoryMap[cat.id] = { ...cat, subcategories: [] };
    });

    result.rows.forEach(cat => {
      if (cat.parent_id) {
        if (categoryMap[cat.parent_id]) {
          categoryMap[cat.parent_id].subcategories.push(categoryMap[cat.id]);
        }
      } else {
        categories.push(categoryMap[cat.id]);
      }
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching bird supply categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

/**
 * GET /api/marketplace/bird-supplies
 * Browse bird supplies with filters
 */
router.get('/', async (req, res) => {
  try {
    const {
      query,
      category,
      brand,
      min_price,
      max_price,
      is_wholesale,
      location,
      user_latitude,
      user_longitude,
      radius,
      sort_by = 'created_at',
      sort_order = 'DESC',
      page = 1,
      limit = 20
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build dynamic WHERE conditions
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Base conditions
    conditions.push(`ml.status = 'active'`);
    conditions.push(`ml.listing_type = 'sale'`);

    // Text search
    if (query) {
      conditions.push(`(
        ml.title ILIKE $${paramIndex} OR
        ml.description ILIKE $${paramIndex} OR
        bsa.brand ILIKE $${paramIndex}
      )`);
      params.push(`%${query}%`);
      paramIndex++;
    }

    // Category filter
    if (category) {
      conditions.push(`(
        bsc.slug = $${paramIndex} OR
        bsc.parent_id = (SELECT id FROM marketplace_bird_supply_categories WHERE slug = $${paramIndex})
      )`);
      params.push(category);
      paramIndex++;
    }

    // Brand filter
    if (brand) {
      conditions.push(`bsa.brand ILIKE $${paramIndex}`);
      params.push(`%${brand}%`);
      paramIndex++;
    }

    // Price filters
    if (min_price) {
      conditions.push(`ml.price >= $${paramIndex}`);
      params.push(parseFloat(min_price));
      paramIndex++;
    }

    if (max_price) {
      conditions.push(`ml.price <= $${paramIndex}`);
      params.push(parseFloat(max_price));
      paramIndex++;
    }

    // Wholesale filter
    if (is_wholesale === 'true') {
      conditions.push(`bsa.is_wholesale = TRUE`);
    }

    // Location filter
    if (location) {
      conditions.push(`(ml.location_city ILIKE $${paramIndex} OR ml.location_state ILIKE $${paramIndex})`);
      params.push(`%${location}%`);
      paramIndex++;
    }

    // Distance calculation
    let distanceCalculation = 'NULL';
    if (user_latitude && user_longitude) {
      distanceCalculation = `
        (3959 * acos(
          cos(radians($${paramIndex})) *
          cos(radians(ml.location_latitude)) *
          cos(radians(ml.location_longitude) - radians($${paramIndex + 1})) +
          sin(radians($${paramIndex})) *
          sin(radians(ml.location_latitude))
        ))
      `;

      params.push(parseFloat(user_latitude));
      params.push(parseFloat(user_longitude));
      paramIndex += 2;

      if (radius) {
        conditions.push(`${distanceCalculation} <= $${paramIndex}`);
        params.push(parseFloat(radius));
        paramIndex++;
      }
    }

    // Sort options
    const validSortColumns = {
      'created_at': 'ml.created_at',
      'price': 'ml.price',
      'views': 'ml.view_count',
      'brand': 'bsa.brand',
      'distance': 'distance_miles'
    };

    const sortColumn = validSortColumns[sort_by] || 'ml.created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const queryText = `
      SELECT
        ml.*,
        bsa.supply_category_id,
        bsa.brand,
        bsa.model,
        bsa.is_wholesale,
        bsa.minimum_order_quantity,
        bsa.bulk_discount_available,
        bsa.warranty_months,
        bsc.name as category_name,
        bsc.slug as category_slug,
        bsc.icon_name as category_icon,
        u.username as seller_username,
        u.first_name as seller_first_name,
        u.avatar_url as seller_avatar,
        mss.average_rating as seller_rating,
        mss.total_reviews as seller_total_ratings,
        mss.seller_level as seller_tier,
        (SELECT file_url FROM marketplace_media
         WHERE listing_id = ml.id AND is_primary = true
         LIMIT 1) as primary_image,
        ${distanceCalculation} as distance_miles,
        COUNT(*) OVER() as total_count
      FROM marketplace_listings ml
      INNER JOIN marketplace_bird_supply_attributes bsa ON ml.id = bsa.listing_id
      LEFT JOIN marketplace_bird_supply_categories bsc ON bsa.supply_category_id = bsc.id
      LEFT JOIN users u ON ml.user_id = u.id
      LEFT JOIN marketplace_seller_stats mss ON ml.user_id = mss.user_id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), offset);

    const result = await db.query(queryText, params);

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    const listings = result.rows.map(row => {
      const { total_count, ...listing } = row;
      return listing;
    });

    res.json({
      success: true,
      data: listings,
      pagination: {
        page: parseInt(page),
        pages: totalPages,
        total: totalCount,
        hasMore: parseInt(page) < totalPages,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error browsing bird supplies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to browse bird supplies',
      message: error.message
    });
  }
});

/**
 * GET /api/marketplace/bird-supplies/:id
 * Get detailed bird supply listing
 */
router.get('/:id', async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);

    const queryText = `
      SELECT
        ml.*,
        bsa.*,
        bsc.name as category_name,
        bsc.slug as category_slug,
        u.username as seller_username,
        u.first_name as seller_first_name,
        u.last_name as seller_last_name,
        u.avatar_url as seller_avatar,
        mss.average_rating as seller_rating,
        mss.total_reviews as seller_total_ratings,
        mss.seller_level as seller_tier,
        (SELECT json_agg(json_build_object(
          'id', mm.id,
          'file_url', mm.file_url,
          'display_order', mm.display_order,
          'is_primary', mm.is_primary
        ) ORDER BY mm.display_order)
        FROM marketplace_media mm
        WHERE mm.listing_id = ml.id
        ) as images
      FROM marketplace_listings ml
      INNER JOIN marketplace_bird_supply_attributes bsa ON ml.id = bsa.listing_id
      LEFT JOIN marketplace_bird_supply_categories bsc ON bsa.supply_category_id = bsc.id
      LEFT JOIN users u ON ml.user_id = u.id
      LEFT JOIN marketplace_seller_stats mss ON ml.user_id = mss.user_id
      WHERE ml.id = $1
    `;

    const result = await db.query(queryText, [listingId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bird supply listing not found'
      });
    }

    // Increment view count
    await db.query(
      `UPDATE marketplace_listings SET view_count = view_count + 1 WHERE id = $1`,
      [listingId]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching bird supply listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bird supply listing'
    });
  }
});

/**
 * POST /api/marketplace/bird-supplies
 * Create a new bird supply listing
 */
router.post('/', authenticate, async (req, res) => {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    const {
      // Marketplace listing fields
      title,
      description,
      price,
      quantity,
      location_city,
      location_state,
      location_latitude,
      location_longitude,
      shipping_available,
      shipping_cost,

      // Bird supply specific fields
      supply_category_id,
      brand,
      model,
      sku,
      upc,
      weight_lbs,
      dimensions_length,
      dimensions_width,
      dimensions_height,
      is_wholesale,
      minimum_order_quantity,
      bulk_discount_available,
      bulk_discount_tiers,
      is_manufacturer,
      is_authorized_dealer,
      warranty_months,

      // Category-specific fields
      cage_bar_spacing,
      cage_material,
      suitable_bird_sizes,
      food_type,
      food_weight_oz,
      expiration_date,
      ingredients,
      suitable_species,
      toy_type,
      toy_materials,
      bird_safe,
      health_product_type,
      requires_vet_prescription,
      active_ingredients
    } = req.body;

    // Validate required fields
    if (!title || !description || !price) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, price'
      });
    }

    // Create marketplace listing
    const listingResult = await client.query(`
      INSERT INTO marketplace_listings (
        user_id, title, description, price, quantity,
        location_city, location_state, location_latitude, location_longitude,
        shipping_available, shipping_cost,
        listing_type, status, condition
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'sale', 'active', 'new')
      RETURNING *
    `, [
      req.user.id,
      title,
      description,
      parseFloat(price),
      quantity || 1,
      location_city || null,
      location_state || null,
      location_latitude ? parseFloat(location_latitude) : null,
      location_longitude ? parseFloat(location_longitude) : null,
      shipping_available || false,
      shipping_cost ? parseFloat(shipping_cost) : null
    ]);

    const listingId = listingResult.rows[0].id;

    // Create bird supply attributes
    await client.query(`
      INSERT INTO marketplace_bird_supply_attributes (
        listing_id, supply_category_id, brand, model, sku, upc,
        weight_lbs, dimensions_length, dimensions_width, dimensions_height,
        is_wholesale, minimum_order_quantity, bulk_discount_available, bulk_discount_tiers,
        is_manufacturer, is_authorized_dealer, warranty_months,
        cage_bar_spacing, cage_material, suitable_bird_sizes,
        food_type, food_weight_oz, expiration_date, ingredients, suitable_species,
        toy_type, toy_materials, bird_safe,
        health_product_type, requires_vet_prescription, active_ingredients
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31
      )
    `, [
      listingId,
      supply_category_id ? parseInt(supply_category_id) : null,
      brand || null,
      model || null,
      sku || null,
      upc || null,
      weight_lbs ? parseFloat(weight_lbs) : null,
      dimensions_length ? parseFloat(dimensions_length) : null,
      dimensions_width ? parseFloat(dimensions_width) : null,
      dimensions_height ? parseFloat(dimensions_height) : null,
      is_wholesale || false,
      minimum_order_quantity || 1,
      bulk_discount_available || false,
      bulk_discount_tiers ? JSON.stringify(bulk_discount_tiers) : null,
      is_manufacturer || false,
      is_authorized_dealer || false,
      warranty_months ? parseInt(warranty_months) : null,
      cage_bar_spacing ? parseFloat(cage_bar_spacing) : null,
      cage_material || null,
      suitable_bird_sizes || null,
      food_type || null,
      food_weight_oz ? parseFloat(food_weight_oz) : null,
      expiration_date || null,
      ingredients || null,
      suitable_species || null,
      toy_type || null,
      toy_materials || null,
      bird_safe !== undefined ? bird_safe : true,
      health_product_type || null,
      requires_vet_prescription || false,
      active_ingredients || null
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: listingResult.rows[0],
      message: 'Bird supply listing created successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating bird supply listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create bird supply listing',
      message: error.message
    });
  } finally {
    client.release();
  }
});

/**
 * GET /api/marketplace/bird-supplies/brands
 * Get list of brands with listing counts
 */
router.get('/brands/list', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        bsa.brand,
        COUNT(*) as listing_count
      FROM marketplace_bird_supply_attributes bsa
      JOIN marketplace_listings ml ON bsa.listing_id = ml.id
      WHERE bsa.brand IS NOT NULL AND ml.status = 'active'
      GROUP BY bsa.brand
      ORDER BY listing_count DESC, bsa.brand
      LIMIT 50
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brands'
    });
  }
});

module.exports = router;

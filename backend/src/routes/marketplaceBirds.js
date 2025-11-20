/**
 * Marketplace Birds Routes
 * API endpoints for bird breeder marketplace with specialized bird attributes
 */

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');

/**
 * GET /api/marketplace/birds
 * Browse bird listings with specialized filters
 */
router.get('/', async (req, res) => {
  try {
    const {
      query,
      species,
      subspecies,
      sex,
      color_mutation,
      temperament,
      min_age_months,
      max_age_months,
      hand_fed,
      dna_sexed,
      health_certified,
      proven_breeder,
      can_talk,
      min_price,
      max_price,
      location,
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

    // Base condition: only active listings
    conditions.push(`ml.status = 'active'`);
    conditions.push(`ml.listing_type = 'sale'`);

    // Text search in title, description, species
    if (query) {
      conditions.push(`(
        ml.title ILIKE $${paramIndex} OR
        ml.description ILIKE $${paramIndex} OR
        mba.bird_species ILIKE $${paramIndex}
      )`);
      params.push(`%${query}%`);
      paramIndex++;
    }

    // Species filter
    if (species) {
      conditions.push(`mba.bird_species ILIKE $${paramIndex}`);
      params.push(`%${species}%`);
      paramIndex++;
    }

    // Subspecies filter
    if (subspecies) {
      conditions.push(`mba.bird_subspecies ILIKE $${paramIndex}`);
      params.push(`%${subspecies}%`);
      paramIndex++;
    }

    // Sex filter
    if (sex) {
      conditions.push(`mba.sex = $${paramIndex}`);
      params.push(sex);
      paramIndex++;
    }

    // Color mutation filter
    if (color_mutation) {
      conditions.push(`mba.color_mutation ILIKE $${paramIndex}`);
      params.push(`%${color_mutation}%`);
      paramIndex++;
    }

    // Temperament filter
    if (temperament) {
      conditions.push(`mba.temperament = $${paramIndex}`);
      params.push(temperament);
      paramIndex++;
    }

    // Age filters (convert to total months for comparison)
    if (min_age_months) {
      conditions.push(`(COALESCE(mba.age_years, 0) * 12 + COALESCE(mba.age_months, 0)) >= $${paramIndex}`);
      params.push(parseInt(min_age_months));
      paramIndex++;
    }

    if (max_age_months) {
      conditions.push(`(COALESCE(mba.age_years, 0) * 12 + COALESCE(mba.age_months, 0)) <= $${paramIndex}`);
      params.push(parseInt(max_age_months));
      paramIndex++;
    }

    // Boolean filters
    if (hand_fed === 'true') {
      conditions.push(`mba.is_hand_fed = true`);
    }

    if (dna_sexed === 'true') {
      conditions.push(`mba.dna_sexed = true`);
    }

    if (health_certified === 'true') {
      conditions.push(`mba.health_certificate_available = true`);
    }

    if (proven_breeder === 'true') {
      conditions.push(`mba.proven_breeder = true`);
    }

    if (can_talk === 'true') {
      conditions.push(`mba.can_talk = true`);
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

    // Location filter
    if (location) {
      conditions.push(`ml.location ILIKE $${paramIndex}`);
      params.push(`%${location}%`);
      paramIndex++;
    }

    // Validate sort column
    const validSortColumns = {
      'created_at': 'ml.created_at',
      'price': 'ml.price',
      'views': 'ml.views',
      'species': 'mba.bird_species'
    };

    const sortColumn = validSortColumns[sort_by] || 'ml.created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Main query with bird attributes joined
    const queryText = `
      SELECT
        ml.*,
        mba.bird_species,
        mba.bird_subspecies,
        mba.color_mutation,
        mba.color_description,
        mba.sex,
        mba.age_years,
        mba.age_months,
        mba.hatch_date,
        mba.health_status,
        mba.health_certificate_available,
        mba.dna_sexed,
        mba.temperament,
        mba.is_hand_fed,
        mba.is_hand_tamed,
        mba.can_talk,
        mba.talks_vocabulary,
        mba.proven_breeder,
        mba.breeder_certification,
        mba.includes_health_guarantee,
        u.username as seller_username,
        u.first_name as seller_first_name,
        u.last_name as seller_last_name,
        u.avatar_url as seller_avatar,
        COUNT(*) OVER() as total_count
      FROM marketplace_listings ml
      INNER JOIN marketplace_bird_attributes mba ON ml.id = mba.listing_id
      LEFT JOIN users u ON ml.seller_id = u.id
      ${whereClause}
      ORDER BY ${sortColumn} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(parseInt(limit), offset);

    const result = await db.query(queryText, params);

    const totalCount = result.rows.length > 0 ? parseInt(result.rows[0].total_count) : 0;
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    // Remove total_count from each row
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
    console.error('Error browsing bird listings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to browse bird listings',
      message: error.message
    });
  }
});

/**
 * GET /api/marketplace/birds/species
 * Get list of available bird species with counts
 */
router.get('/species', async (req, res) => {
  try {
    const queryText = `
      SELECT
        mbs.id,
        mbs.species_name,
        mbs.scientific_name,
        mbs.family,
        mbs.species_group,
        mbs.typical_lifespan_years,
        mbs.average_size_inches,
        mbs.care_level,
        mbs.description,
        mbs.listing_count,
        COUNT(DISTINCT mba.listing_id) as active_listings
      FROM marketplace_bird_species mbs
      LEFT JOIN marketplace_bird_attributes mba ON mbs.species_name = mba.bird_species
      LEFT JOIN marketplace_listings ml ON mba.listing_id = ml.id AND ml.status = 'active'
      WHERE mbs.is_active = true
      GROUP BY mbs.id
      ORDER BY mbs.species_group, mbs.species_name
    `;

    const result = await db.query(queryText);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching bird species:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bird species'
    });
  }
});

/**
 * GET /api/marketplace/birds/colors/:species
 * Get available color mutations for a specific species
 */
router.get('/colors/:species', async (req, res) => {
  try {
    const { species } = req.params;

    const queryText = `
      SELECT
        mbc.id,
        mbc.mutation_name,
        mbc.genetic_type,
        mbc.color_description,
        mbc.rarity,
        mbc.image_url,
        COUNT(DISTINCT mba.listing_id) as active_listings
      FROM marketplace_bird_color_mutations mbc
      INNER JOIN marketplace_bird_species mbs ON mbc.species_id = mbs.id
      LEFT JOIN marketplace_bird_attributes mba ON
        mbs.species_name = mba.bird_species AND
        mbc.mutation_name = mba.color_mutation
      LEFT JOIN marketplace_listings ml ON mba.listing_id = ml.id AND ml.status = 'active'
      WHERE mbs.species_name ILIKE $1 AND mbc.is_active = true
      GROUP BY mbc.id
      ORDER BY mbc.rarity, mbc.mutation_name
    `;

    const result = await db.query(queryText, [species]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching color mutations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch color mutations'
    });
  }
});

/**
 * GET /api/marketplace/birds/:id
 * Get detailed bird listing with all attributes
 */
router.get('/:id', async (req, res) => {
  try {
    const listingId = parseInt(req.params.id);

    const queryText = `
      SELECT
        ml.*,
        mba.*,
        u.username as seller_username,
        u.first_name as seller_first_name,
        u.last_name as seller_last_name,
        u.avatar_url as seller_avatar,
        u.email as seller_email,
        (SELECT json_agg(json_build_object(
          'id', mli.id,
          'image_url', mli.image_url,
          'display_order', mli.display_order,
          'caption', mli.caption
        ) ORDER BY mli.display_order)
        FROM marketplace_listing_images mli
        WHERE mli.listing_id = ml.id
        ) as images
      FROM marketplace_listings ml
      INNER JOIN marketplace_bird_attributes mba ON ml.id = mba.listing_id
      LEFT JOIN users u ON ml.seller_id = u.id
      WHERE ml.id = $1
    `;

    const result = await db.query(queryText, [listingId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bird listing not found'
      });
    }

    // Increment view count
    await db.query(
      `UPDATE marketplace_listings SET views = views + 1 WHERE id = $1`,
      [listingId]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching bird listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bird listing'
    });
  }
});

/**
 * POST /api/marketplace/birds
 * Create a new bird listing (requires authentication)
 */
router.post('/', authenticate, async (req, res) => {
  const client = await db.pool.getConnection();

  try {
    await client.query('BEGIN');

    const {
      // Marketplace listing fields
      title,
      description,
      price,
      location,
      latitude,
      longitude,
      category_id,

      // Bird-specific fields
      bird_species,
      bird_subspecies,
      color_mutation,
      color_description,
      sex,
      age_years,
      age_months,
      hatch_date,
      health_status,
      health_certificate_available,
      dna_sexed,
      disease_tested,
      temperament,
      is_hand_fed,
      is_hand_tamed,
      can_talk,
      talks_vocabulary,
      proven_breeder,
      breeding_history,
      breeder_certification,
      includes_health_guarantee,
      health_guarantee_duration_days,
      shipping_methods,
      includes_carrier
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !bird_species) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, price, bird_species'
      });
    }

    // Create marketplace listing
    const listingResult = await client.query(`
      INSERT INTO marketplace_listings (
        seller_id, title, description, price, location, latitude, longitude,
        category_id, listing_type, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'sale', 'active')
      RETURNING *
    `, [
      req.user.id,
      title,
      description,
      parseFloat(price),
      location,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null,
      category_id ? parseInt(category_id) : null
    ]);

    const listingId = listingResult.rows[0].id;

    // Create bird attributes
    await client.query(`
      INSERT INTO marketplace_bird_attributes (
        listing_id, bird_species, bird_subspecies, color_mutation, color_description,
        sex, age_years, age_months, hatch_date, health_status, health_certificate_available,
        dna_sexed, disease_tested, temperament, is_hand_fed, is_hand_tamed,
        can_talk, talks_vocabulary, proven_breeder, breeding_history,
        breeder_certification, includes_health_guarantee, health_guarantee_duration_days,
        shipping_methods, includes_carrier
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      )
    `, [
      listingId,
      bird_species,
      bird_subspecies || null,
      color_mutation || null,
      color_description || null,
      sex || 'unknown',
      age_years ? parseInt(age_years) : null,
      age_months ? parseInt(age_months) : null,
      hatch_date || null,
      health_status || 'good',
      health_certificate_available || false,
      dna_sexed || false,
      disease_tested || false,
      temperament || null,
      is_hand_fed || false,
      is_hand_tamed || false,
      can_talk || false,
      talks_vocabulary || null,
      proven_breeder || false,
      breeding_history || null,
      breeder_certification || null,
      includes_health_guarantee || false,
      health_guarantee_duration_days ? parseInt(health_guarantee_duration_days) : null,
      shipping_methods || null,
      includes_carrier || false
    ]);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: listingResult.rows[0],
      message: 'Bird listing created successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating bird listing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create bird listing',
      message: error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;

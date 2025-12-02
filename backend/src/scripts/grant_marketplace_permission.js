/**
 * Script to grant marketplace permissions to users
 * Usage: node src/scripts/grant_marketplace_permission.js <user_id> <marketplace_slug>
 */

const { query } = require('../config/database');

async function grantPermission(userId, marketplaceSlug) {
  try {
    // Get marketplace type
    const marketplaceResult = await query(`
      SELECT id, name FROM marketplace_types
      WHERE slug = $1 AND is_active = TRUE
    `, [marketplaceSlug]);

    if (marketplaceResult.rows.length === 0) {
      console.error(`❌ Marketplace "${marketplaceSlug}" not found`);
      console.log('\nAvailable marketplaces:');
      const allMarketplaces = await query(`
        SELECT slug, name, requires_permission FROM marketplace_types
        WHERE is_active = TRUE ORDER BY name
      `);
      allMarketplaces.rows.forEach(m => {
        console.log(`  - ${m.slug}: ${m.name} (requires_permission: ${m.requires_permission})`);
      });
      process.exit(1);
    }

    const marketplace = marketplaceResult.rows[0];

    // Grant permission
    const result = await query(`
      INSERT INTO user_marketplace_permissions
        (user_id, marketplace_type_id, granted_by, is_active)
      VALUES ($1, $2, $3, TRUE)
      ON CONFLICT (user_id, marketplace_type_id) DO UPDATE
      SET is_active = TRUE, granted_at = CURRENT_TIMESTAMP, granted_by = $3
      RETURNING id, granted_at
    `, [userId, marketplace.id, userId]);

    console.log(`✅ Successfully granted "${marketplace.name}" access to user ${userId}`);
    console.log(`   Permission ID: ${result.rows[0].id}`);
    console.log(`   Granted at: ${result.rows[0].granted_at}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error granting permission:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node src/scripts/grant_marketplace_permission.js <user_id> <marketplace_slug>');
  console.log('\nExample:');
  console.log('  node src/scripts/grant_marketplace_permission.js 22 birds');
  console.log('  node src/scripts/grant_marketplace_permission.js 22 bird-supplies');
  process.exit(1);
}

const userId = parseInt(args[0]);
const marketplaceSlug = args[1];

if (isNaN(userId) || userId < 1) {
  console.error('❌ Invalid user ID. Must be a positive integer.');
  process.exit(1);
}

grantPermission(userId, marketplaceSlug);

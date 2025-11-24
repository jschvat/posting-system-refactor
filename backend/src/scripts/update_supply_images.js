/**
 * Update Bird Supply Images with Working Free Images
 */

const db = require('../config/database');

// Using Unsplash and Pexels images that allow hotlinking
const imageUpdates = [
  // Cages - bird cage images
  { pattern: '%Flight Cage%', image: 'https://images.unsplash.com/photo-1520808663317-647b476a81b9?w=400&h=400&fit=crop' },
  { pattern: '%Parrot Cage%Play Top%', image: 'https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&h=400&fit=crop' },
  { pattern: '%Macaw Cage%', image: 'https://images.unsplash.com/photo-1544923246-77307dd628b5?w=400&h=400&fit=crop' },

  // Food - bird seed/food images
  { pattern: '%Zupreem%FruitBlend%', image: 'https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?w=400&h=400&fit=crop' },
  { pattern: '%Kaytee%Forti-Diet%', image: 'https://images.pexels.com/photos/4033149/pexels-photo-4033149.jpeg?w=400&h=400&fit=crop' },
  { pattern: '%Harrison%Pellets%', image: 'https://images.pexels.com/photos/5731878/pexels-photo-5731878.jpeg?w=400&h=400&fit=crop' },
  { pattern: '%Lafeber%Avi-Cakes%', image: 'https://images.pexels.com/photos/4033146/pexels-photo-4033146.jpeg?w=400&h=400&fit=crop' },

  // Toys - colorful toy images
  { pattern: '%Pineapple%Foraging%', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop' },
  { pattern: '%Flying Trapeze%', image: 'https://images.unsplash.com/photo-1590418606746-018840f9cd0f?w=400&h=400&fit=crop' },
  { pattern: '%Shredding Tower%', image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop' },

  // Health - supplement/vitamin bottles
  { pattern: '%Nekton%Multi-Vitamin%', image: 'https://images.pexels.com/photos/3683074/pexels-photo-3683074.jpeg?w=400&h=400&fit=crop' },
  { pattern: '%Calcivet%Calcium%', image: 'https://images.pexels.com/photos/3683056/pexels-photo-3683056.jpeg?w=400&h=400&fit=crop' },

  // Perches - wood/nature images
  { pattern: '%Java Wood%Perch%', image: 'https://images.unsplash.com/photo-1518882605630-8eb651fd5a9d?w=400&h=400&fit=crop' },
  { pattern: '%Sandy Perch%', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
  { pattern: '%Play Stand%Feeding%', image: 'https://images.unsplash.com/photo-1520808663317-647b476a81b9?w=400&h=400&fit=crop' },

  // Feeding Supplies - bowl/dish images
  { pattern: '%Quick Lock Crock%', image: 'https://images.pexels.com/photos/4226896/pexels-photo-4226896.jpeg?w=400&h=400&fit=crop' },
  { pattern: '%InSight%Clean Cup%', image: 'https://images.pexels.com/photos/4226894/pexels-photo-4226894.jpeg?w=400&h=400&fit=crop' },

  // Travel - carrier images
  { pattern: '%Travel Carrier%', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=400&fit=crop' },
  { pattern: '%Aviator%Harness%', image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&h=400&fit=crop' },

  // Breeding - nest images
  { pattern: '%Nest Box%', image: 'https://images.unsplash.com/photo-1557401622-cfc0aa5d146c?w=400&h=400&fit=crop' },
  { pattern: '%Nesting Material%', image: 'https://images.unsplash.com/photo-1504618223053-559bdef9dd5a?w=400&h=400&fit=crop' }
];

async function updateSupplyImages() {
  db.initializeDatabase();
  await db.testConnection();

  const client = await db.pool.connect();

  try {
    console.log('🖼️  Updating bird supply images with working URLs...\n');

    let updateCount = 0;

    for (const update of imageUpdates) {
      const listings = await client.query(
        `SELECT ml.id, ml.title FROM marketplace_listings ml
         INNER JOIN marketplace_bird_supply_attributes bsa ON ml.id = bsa.listing_id
         WHERE ml.title ILIKE $1`,
        [update.pattern]
      );

      for (const listing of listings.rows) {
        const existing = await client.query(
          `SELECT id FROM marketplace_media WHERE listing_id = $1 AND is_primary = true`,
          [listing.id]
        );

        if (existing.rows.length > 0) {
          await client.query(
            `UPDATE marketplace_media SET file_url = $1 WHERE listing_id = $2 AND is_primary = true`,
            [update.image, listing.id]
          );
        } else {
          await client.query(
            `INSERT INTO marketplace_media (listing_id, file_url, file_type, file_size, display_order, is_primary)
             VALUES ($1, $2, 'image/jpeg', 0, 1, true)`,
            [listing.id, update.image]
          );
        }

        console.log(`✓ Updated: ${listing.title}`);
        updateCount++;
      }
    }

    console.log(`\n🎉 Updated ${updateCount} product images`);

  } catch (error) {
    console.error('❌ Error updating images:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  updateSupplyImages()
    .then(() => {
      console.log('\n✅ Image update completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Failed:', error);
      process.exit(1);
    });
}

module.exports = { updateSupplyImages };

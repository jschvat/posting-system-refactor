# Marketplace Permissions System

A flexible, admin-controlled permissions system for managing access to different marketplace types.

## Overview

The marketplace permissions system allows you to:
- Define multiple marketplace types (e.g., Bird Breeders, Bird Supplies, etc.)
- Control which marketplaces require special permissions
- Grant/revoke user access to specific marketplaces
- Automatically show/hide marketplace navigation based on permissions

## Database Schema

### `marketplace_types`
Defines available marketplace categories:
- `id`: Primary key
- `name`: Display name (e.g., "Bird Breeders")
- `slug`: URL-friendly identifier (e.g., "birds")
- `description`: Optional description
- `icon`: Optional emoji or icon
- `requires_permission`: Boolean - if false, everyone has access
- `is_active`: Boolean - soft delete flag

### `user_marketplace_permissions`
Grants users access to specific marketplaces:
- `id`: Primary key
- `user_id`: Reference to users table
- `marketplace_type_id`: Reference to marketplace_types
- `granted_by`: User who granted the permission
- `granted_at`: Timestamp when permission was granted
- `expires_at`: Optional expiration date
- `is_active`: Boolean - for soft revocation
- `notes`: Optional notes about the permission

## API Endpoints

### For Users

#### Get My Permissions
```
GET /api/marketplace-permissions/my-permissions
```
Returns all marketplace types and indicates which ones the current user has access to.

#### Check Access to Specific Marketplace
```
GET /api/marketplace-permissions/check/:slug
```
Checks if the current user has access to a specific marketplace.

### For Admins

#### Grant Permission
```
POST /api/marketplace-permissions/grant
Content-Type: application/json

{
  "user_id": 22,
  "marketplace_slug": "birds",
  "expires_at": "2026-12-31T23:59:59Z", // optional
  "notes": "Verified breeder" // optional
}
```

#### Revoke Permission
```
DELETE /api/marketplace-permissions/revoke
Content-Type: application/json

{
  "user_id": 22,
  "marketplace_slug": "birds"
}
```

#### Get User's Permissions
```
GET /api/marketplace-permissions/users/:userId
```

#### Get All Marketplace Types
```
GET /api/marketplace-permissions/marketplace-types
```

## Frontend Integration

### Sidebar Navigation
The sidebar automatically shows/hides marketplace links based on user permissions:

```tsx
import { useQuery } from '@tanstack/react-query';
import { marketplacePermissionsApi } from '../services/marketplacePermissionsApi';

// In your component:
const { data: permissionsData } = useQuery({
  queryKey: ['marketplace-permissions'],
  queryFn: marketplacePermissionsApi.getMyPermissions,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

const accessibleMarketplaces = permissionsData?.accessible_marketplaces || [];

// Check if user has access:
const hasBirdAccess = accessibleMarketplaces.some(m => m.slug === 'birds');
```

### Route Protection
To protect routes, you can check permissions in your route components:

```tsx
import { useNavigate } from 'react-router-dom';
import { marketplacePermissionsApi } from '../services/marketplacePermissionsApi';

const BirdMarketplace = () => {
  const navigate = useNavigate();
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    marketplacePermissionsApi.checkAccess('birds').then(access => {
      if (!access) {
        navigate('/marketplace');
      } else {
        setHasAccess(true);
      }
    });
  }, []);

  if (!hasAccess) return <LoadingSpinner />;

  return <div>Bird Marketplace Content</div>;
};
```

## Admin Tools

### Grant Permission via Script
```bash
cd backend
node src/scripts/grant_marketplace_permission.js <user_id> <marketplace_slug>

# Example:
node src/scripts/grant_marketplace_permission.js 22 birds
node src/scripts/grant_marketplace_permission.js 22 bird-supplies
```

### Grant Permission via SQL
```sql
-- Grant access to bird marketplace for user 22
INSERT INTO user_marketplace_permissions (user_id, marketplace_type_id, granted_by, is_active)
SELECT 22, id, 22, TRUE
FROM marketplace_types
WHERE slug = 'birds'
ON CONFLICT (user_id, marketplace_type_id) DO UPDATE
SET is_active = TRUE, granted_at = CURRENT_TIMESTAMP;
```

### Revoke Permission via SQL
```sql
-- Revoke access
UPDATE user_marketplace_permissions
SET is_active = FALSE
WHERE user_id = 22
  AND marketplace_type_id = (SELECT id FROM marketplace_types WHERE slug = 'birds');
```

### List User's Permissions
```sql
SELECT
  u.username,
  mt.name as marketplace,
  mt.slug,
  ump.granted_at,
  ump.expires_at,
  ump.is_active
FROM user_marketplace_permissions ump
JOIN users u ON ump.user_id = u.id
JOIN marketplace_types mt ON ump.marketplace_type_id = mt.id
WHERE u.id = 22;
```

## Adding New Marketplace Types

1. Insert into `marketplace_types`:
```sql
INSERT INTO marketplace_types (name, slug, description, icon, requires_permission, is_active)
VALUES ('Pet Supplies', 'pet-supplies', 'General pet supplies marketplace', '🐾', TRUE, TRUE);
```

2. Add navigation link in `Sidebar.tsx`:
```tsx
{hasMarketplaceAccess('pet-supplies') && (
  <li>
    <SubNavLink to="/marketplace/pet-supplies" $isActive={isActive('/marketplace/pet-supplies')}>
      🐾 Pet Supplies
    </SubNavLink>
  </li>
)}
```

3. Add route in `App.tsx`:
```tsx
<Route path="/marketplace/pet-supplies" element={<PetSuppliesMarketplace />} />
```

## Security Notes

- Currently, admin check is basic (user_id === 1 or admin table)
- Consider implementing proper role-based access control (RBAC)
- Always verify permissions on both frontend AND backend
- Frontend permission checks are for UX only - backend must enforce security
- Use the `has_marketplace_access()` function in database queries for consistency

## Database Function

The system includes a PostgreSQL function for checking access:

```sql
SELECT has_marketplace_access(user_id, 'birds');
```

This function:
- Returns FALSE if marketplace doesn't exist or is inactive
- Returns TRUE if marketplace doesn't require permissions
- Returns TRUE if user has active, non-expired permission
- Returns FALSE otherwise

## Future Enhancements

- Add role-based admin system
- Add permission expiration notifications
- Add audit logging for permission changes
- Add bulk permission management UI
- Add permission request workflow
- Add marketplace-specific settings per user

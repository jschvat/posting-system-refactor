-- Migration: Marketplace Permissions System
-- Description: Adds support for admin-controlled access to different marketplaces
-- Created: 2025-11-26

-- Create marketplace_types table to define available marketplaces
CREATE TABLE IF NOT EXISTS marketplace_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  requires_permission BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_marketplace_permissions table for granting access
CREATE TABLE IF NOT EXISTS user_marketplace_permissions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  marketplace_type_id INTEGER NOT NULL REFERENCES marketplace_types(id) ON DELETE CASCADE,
  granted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  UNIQUE(user_id, marketplace_type_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_marketplace_permissions_user_id ON user_marketplace_permissions(user_id);
CREATE INDEX idx_user_marketplace_permissions_marketplace_type_id ON user_marketplace_permissions(marketplace_type_id);
CREATE INDEX idx_user_marketplace_permissions_active ON user_marketplace_permissions(is_active);
CREATE INDEX idx_marketplace_types_slug ON marketplace_types(slug);
CREATE INDEX idx_marketplace_types_active ON marketplace_types(is_active);

-- Insert default marketplace types
INSERT INTO marketplace_types (name, slug, description, icon, requires_permission, is_active) VALUES
  ('General Marketplace', 'general', 'Buy and sell general items', '🛍️', FALSE, TRUE),
  ('Bird Breeders', 'birds', 'Marketplace for bird breeders and enthusiasts', '🦜', TRUE, TRUE),
  ('Bird Supplies', 'bird-supplies', 'Bird food, cages, toys, and accessories', '🪶', TRUE, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Create function to check if user has marketplace access
CREATE OR REPLACE FUNCTION has_marketplace_access(p_user_id INTEGER, p_marketplace_slug VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  v_requires_permission BOOLEAN;
  v_has_permission BOOLEAN;
  v_marketplace_id INTEGER;
BEGIN
  -- Get marketplace type info
  SELECT id, requires_permission INTO v_marketplace_id, v_requires_permission
  FROM marketplace_types
  WHERE slug = p_marketplace_slug AND is_active = TRUE;

  -- If marketplace doesn't exist or is inactive, return false
  IF v_marketplace_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- If marketplace doesn't require permission, allow access
  IF v_requires_permission = FALSE THEN
    RETURN TRUE;
  END IF;

  -- Check if user has active permission
  SELECT EXISTS(
    SELECT 1 FROM user_marketplace_permissions
    WHERE user_id = p_user_id
      AND marketplace_type_id = v_marketplace_id
      AND is_active = TRUE
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_has_permission;

  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_marketplace_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for marketplace_types
CREATE TRIGGER trigger_marketplace_types_updated_at
  BEFORE UPDATE ON marketplace_types
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_types_updated_at();

-- Add comments
COMMENT ON TABLE marketplace_types IS 'Defines available marketplace categories with permission requirements';
COMMENT ON TABLE user_marketplace_permissions IS 'Grants users access to specific marketplace types';
COMMENT ON FUNCTION has_marketplace_access IS 'Checks if a user has access to a specific marketplace';

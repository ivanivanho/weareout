-- WeAreOut Database Schema
-- PostgreSQL 12+ compatible
-- Personal inventory concierge application

-- Enable UUID extension for generating unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable timestamp extension for better time handling
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- =============================================================================
-- TABLES
-- =============================================================================

-- Users table: Stores user account information
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone_number VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Comment on users table
COMMENT ON TABLE users IS 'Stores user authentication and profile information';
COMMENT ON COLUMN users.email IS 'User email address (unique identifier)';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.is_verified IS 'Email verification status';
COMMENT ON COLUMN users.is_active IS 'Account active status (soft delete)';

-- Items table: Stores inventory items
-- =============================================================================
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'units',
    location VARCHAR(255),
    category VARCHAR(100),
    status VARCHAR(50) DEFAULT 'in_stock',
    low_stock_threshold DECIMAL(10, 2),
    barcode VARCHAR(100),
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT quantity_positive CHECK (quantity >= 0),
    CONSTRAINT low_stock_threshold_positive CHECK (low_stock_threshold IS NULL OR low_stock_threshold >= 0),
    CONSTRAINT status_valid CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock', 'discontinued'))
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_updated_at ON items(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_barcode ON items(barcode) WHERE barcode IS NOT NULL;

-- Full-text search index on name and description
CREATE INDEX IF NOT EXISTS idx_items_search ON items USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Composite index for user's items ordered by creation date
CREATE INDEX IF NOT EXISTS idx_items_user_created ON items(user_id, created_at DESC);

-- Comment on items table
COMMENT ON TABLE items IS 'Stores user inventory items';
COMMENT ON COLUMN items.quantity IS 'Current quantity of item';
COMMENT ON COLUMN items.unit IS 'Unit of measurement (e.g., kg, liters, units)';
COMMENT ON COLUMN items.status IS 'Current stock status of the item';
COMMENT ON COLUMN items.low_stock_threshold IS 'Alert when quantity falls below this value';

-- Consumption Logs table: Tracks item quantity changes
-- =============================================================================
CREATE TABLE IF NOT EXISTS consumption_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quantity_change DECIMAL(10, 2) NOT NULL,
    quantity_before DECIMAL(10, 2) NOT NULL,
    quantity_after DECIMAL(10, 2) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    notes TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT action_type_valid CHECK (action_type IN ('add', 'consume', 'adjust', 'restock', 'expire', 'remove'))
);

-- Create indexes for analytics and queries
CREATE INDEX IF NOT EXISTS idx_consumption_logs_item_id ON consumption_logs(item_id);
CREATE INDEX IF NOT EXISTS idx_consumption_logs_user_id ON consumption_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consumption_logs_timestamp ON consumption_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_consumption_logs_action_type ON consumption_logs(action_type);

-- Composite index for item consumption history
CREATE INDEX IF NOT EXISTS idx_consumption_logs_item_timestamp ON consumption_logs(item_id, timestamp DESC);

-- Comment on consumption_logs table
COMMENT ON TABLE consumption_logs IS 'Tracks all quantity changes for inventory items';
COMMENT ON COLUMN consumption_logs.quantity_change IS 'Change in quantity (positive or negative)';
COMMENT ON COLUMN consumption_logs.quantity_before IS 'Quantity before the change';
COMMENT ON COLUMN consumption_logs.quantity_after IS 'Quantity after the change';
COMMENT ON COLUMN consumption_logs.action_type IS 'Type of action that caused the change';

-- Refresh Tokens table: Stores JWT refresh tokens
-- =============================================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_info TEXT,
    ip_address INET,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT expires_at_future CHECK (expires_at > created_at)
);

-- Create indexes for token validation and cleanup
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked ON refresh_tokens(revoked) WHERE revoked = FALSE;

-- Comment on refresh_tokens table
COMMENT ON TABLE refresh_tokens IS 'Stores refresh tokens for JWT authentication';
COMMENT ON COLUMN refresh_tokens.token_hash IS 'SHA256 hash of the refresh token';
COMMENT ON COLUMN refresh_tokens.revoked IS 'Whether the token has been revoked';

-- Token Blacklist table: Stores revoked access tokens
-- =============================================================================
CREATE TABLE IF NOT EXISTS token_blacklist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_jti VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    blacklisted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reason VARCHAR(255)
);

-- Create indexes for token validation
CREATE INDEX IF NOT EXISTS idx_token_blacklist_jti ON token_blacklist(token_jti);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON token_blacklist(expires_at);

-- Comment on token_blacklist table
COMMENT ON TABLE token_blacklist IS 'Stores blacklisted JWT tokens (for logout)';
COMMENT ON COLUMN token_blacklist.token_jti IS 'JWT ID (jti claim) of the blacklisted token';

-- =============================================================================
-- FUNCTIONS AND TRIGGERS
-- =============================================================================

-- Function to update updated_at timestamp
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to automatically update updated_at on items table
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically update item status based on quantity
-- =============================================================================
CREATE OR REPLACE FUNCTION update_item_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.quantity = 0 THEN
        NEW.status = 'out_of_stock';
    ELSIF NEW.low_stock_threshold IS NOT NULL AND NEW.quantity <= NEW.low_stock_threshold THEN
        NEW.status = 'low_stock';
    ELSIF NEW.status != 'discontinued' THEN
        NEW.status = 'in_stock';
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update item status when quantity changes
CREATE TRIGGER update_items_status BEFORE INSERT OR UPDATE OF quantity, low_stock_threshold ON items
    FOR EACH ROW EXECUTE FUNCTION update_item_status();

-- Function to log consumption changes
-- =============================================================================
CREATE OR REPLACE FUNCTION log_item_consumption()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if quantity has changed
    IF (TG_OP = 'INSERT') OR (OLD.quantity != NEW.quantity) THEN
        INSERT INTO consumption_logs (
            item_id,
            user_id,
            quantity_change,
            quantity_before,
            quantity_after,
            action_type
        ) VALUES (
            NEW.id,
            NEW.user_id,
            CASE
                WHEN TG_OP = 'INSERT' THEN NEW.quantity
                ELSE NEW.quantity - OLD.quantity
            END,
            CASE
                WHEN TG_OP = 'INSERT' THEN 0
                ELSE OLD.quantity
            END,
            NEW.quantity,
            CASE
                WHEN TG_OP = 'INSERT' THEN 'add'
                WHEN NEW.quantity > OLD.quantity THEN 'restock'
                WHEN NEW.quantity < OLD.quantity THEN 'consume'
                ELSE 'adjust'
            END
        );
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically log consumption when quantity changes
CREATE TRIGGER log_items_consumption AFTER INSERT OR UPDATE OF quantity ON items
    FOR EACH ROW EXECUTE FUNCTION log_item_consumption();

-- Function to clean up expired tokens
-- =============================================================================
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired refresh tokens
    DELETE FROM refresh_tokens
    WHERE expires_at < CURRENT_TIMESTAMP AND revoked = TRUE;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    -- Delete expired blacklisted tokens
    DELETE FROM token_blacklist
    WHERE expires_at < CURRENT_TIMESTAMP;

    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- =============================================================================
-- VIEWS
-- =============================================================================

-- View for item statistics
CREATE OR REPLACE VIEW item_statistics AS
SELECT
    i.id,
    i.user_id,
    i.name,
    i.quantity,
    i.status,
    COUNT(cl.id) as total_changes,
    SUM(CASE WHEN cl.action_type = 'consume' THEN ABS(cl.quantity_change) ELSE 0 END) as total_consumed,
    SUM(CASE WHEN cl.action_type = 'restock' THEN cl.quantity_change ELSE 0 END) as total_restocked,
    MAX(cl.timestamp) as last_activity
FROM items i
LEFT JOIN consumption_logs cl ON i.id = cl.item_id
GROUP BY i.id, i.user_id, i.name, i.quantity, i.status;

-- Comment on view
COMMENT ON VIEW item_statistics IS 'Aggregated statistics for each inventory item';

-- =============================================================================
-- INITIAL DATA (Optional - for development)
-- =============================================================================

-- Note: In production, this section should be removed or commented out
-- Example user (password: 'password123' - bcrypt hashed)
-- INSERT INTO users (email, password_hash, full_name, is_verified)
-- VALUES ('demo@weareout.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyAHNJ7lnGVa', 'Demo User', TRUE);

-- =============================================================================
-- PERMISSIONS (Adjust based on your user roles)
-- =============================================================================

-- Grant permissions to application user (create this user separately)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO weareout_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO weareout_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO weareout_app;

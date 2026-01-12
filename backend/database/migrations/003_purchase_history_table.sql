-- =============================================================================
-- Migration: Create Purchase History Table
-- Description: Track purchase history for inventory items
-- Date: 2026-01-09
-- =============================================================================

-- Create purchase_history table
CREATE TABLE IF NOT EXISTS purchase_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2),
    store VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT quantity_positive CHECK (quantity > 0)
);

-- Create indexes for purchase_history table
CREATE INDEX IF NOT EXISTS idx_purchase_history_item_id ON purchase_history(item_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_user_id ON purchase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_purchase_date ON purchase_history(purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_history_item_date ON purchase_history(item_id, purchase_date DESC);

-- Comments for purchase_history table
COMMENT ON TABLE purchase_history IS 'Purchase history for inventory items';
COMMENT ON COLUMN purchase_history.purchase_date IS 'Date when item was purchased';
COMMENT ON COLUMN purchase_history.quantity IS 'Quantity purchased';
COMMENT ON COLUMN purchase_history.price IS 'Total price paid (optional)';
COMMENT ON COLUMN purchase_history.store IS 'Store where purchased (optional)';

-- Trigger to automatically update updated_at on purchase_history table
CREATE TRIGGER update_purchase_history_updated_at BEFORE UPDATE ON purchase_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Purchase history table created successfully!';
END $$;

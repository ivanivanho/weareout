-- =============================================================================
-- Migration: Phase 2.5 Foundation Features
-- Description: Add missing columns for consumption intelligence and shopping list
-- Date: 2026-01-09
-- =============================================================================

-- Add missing columns to items table for consumption intelligence
-- =============================================================================

-- Add burn_rate column (items consumed per day)
ALTER TABLE items
ADD COLUMN IF NOT EXISTS burn_rate DECIMAL(10, 4) DEFAULT 0;

COMMENT ON COLUMN items.burn_rate IS 'Average consumption rate (units per day)';

-- Add days_remaining column (estimated days until item runs out)
ALTER TABLE items
ADD COLUMN IF NOT EXISTS days_remaining INTEGER;

COMMENT ON COLUMN items.days_remaining IS 'Estimated days until item quantity reaches zero';

-- Add deleted_at column for soft deletes
ALTER TABLE items
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN items.deleted_at IS 'Timestamp when item was soft deleted';

-- Add confidence_score column for burn rate prediction accuracy
ALTER TABLE items
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3, 2) DEFAULT 0.5;

COMMENT ON COLUMN items.confidence_score IS 'Confidence in burn rate prediction (0.0-1.0)';

-- Add last_purchase_date to track purchase history
ALTER TABLE items
ADD COLUMN IF NOT EXISTS last_purchase_date TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN items.last_purchase_date IS 'Date of last purchase/restock';

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_items_deleted_at ON items(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_items_days_remaining ON items(days_remaining) WHERE days_remaining IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_items_burn_rate ON items(burn_rate) WHERE burn_rate > 0;

-- =============================================================================
-- Shopping List Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS shopping_list (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity DECIMAL(10, 2) DEFAULT 1,
    unit VARCHAR(50) DEFAULT 'units',
    priority VARCHAR(20) DEFAULT 'medium',
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Optional: link to inventory item if this was auto-generated
    inventory_item_id UUID REFERENCES items(id) ON DELETE SET NULL,

    -- Constraints
    CONSTRAINT priority_valid CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical'))
);

-- Create indexes for shopping_list table
CREATE INDEX IF NOT EXISTS idx_shopping_list_user_id ON shopping_list(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_completed ON shopping_list(completed);
CREATE INDEX IF NOT EXISTS idx_shopping_list_priority ON shopping_list(priority);
CREATE INDEX IF NOT EXISTS idx_shopping_list_deleted_at ON shopping_list(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_shopping_list_inventory_item_id ON shopping_list(inventory_item_id) WHERE inventory_item_id IS NOT NULL;

-- Composite index for user's active shopping list items
CREATE INDEX IF NOT EXISTS idx_shopping_list_user_active ON shopping_list(user_id, deleted_at, completed) WHERE deleted_at IS NULL;

-- Comments for shopping_list table
COMMENT ON TABLE shopping_list IS 'User shopping list items';
COMMENT ON COLUMN shopping_list.item_name IS 'Name of item to purchase';
COMMENT ON COLUMN shopping_list.priority IS 'Purchase priority (low, medium, high, urgent, critical)';
COMMENT ON COLUMN shopping_list.completed IS 'Whether item has been purchased';
COMMENT ON COLUMN shopping_list.inventory_item_id IS 'Reference to inventory item if auto-generated';

-- =============================================================================
-- Update trigger for shopping_list
-- =============================================================================

-- Trigger to automatically update updated_at on shopping_list table
CREATE TRIGGER update_shopping_list_updated_at BEFORE UPDATE ON shopping_list
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Function to calculate burn rate
-- =============================================================================

CREATE OR REPLACE FUNCTION calculate_burn_rate(item_uuid UUID)
RETURNS TABLE(burn_rate DECIMAL, confidence DECIMAL, days_remaining INTEGER) AS $$
DECLARE
    consumption_count INTEGER;
    avg_daily_consumption DECIMAL;
    current_quantity DECIMAL;
    prediction_confidence DECIMAL;
    estimated_days INTEGER;
    time_span_days DECIMAL;
BEGIN
    -- Get current quantity
    SELECT quantity INTO current_quantity
    FROM items
    WHERE id = item_uuid;

    -- If no quantity, return zeros
    IF current_quantity IS NULL OR current_quantity = 0 THEN
        RETURN QUERY SELECT 0::DECIMAL, 0::DECIMAL, 0::INTEGER;
        RETURN;
    END IF;

    -- Count consumption events in the last 90 days
    SELECT COUNT(*),
           COALESCE(EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) / 86400, 0)
    INTO consumption_count, time_span_days
    FROM consumption_logs
    WHERE item_id = item_uuid
      AND action_type = 'consume'
      AND timestamp > NOW() - INTERVAL '90 days';

    -- If less than 2 data points, low confidence
    IF consumption_count < 2 OR time_span_days < 1 THEN
        prediction_confidence := 0.3;
        avg_daily_consumption := 0;
        estimated_days := NULL;
    ELSE
        -- Calculate average daily consumption
        SELECT COALESCE(ABS(SUM(quantity_change)) / NULLIF(time_span_days, 0), 0)
        INTO avg_daily_consumption
        FROM consumption_logs
        WHERE item_id = item_uuid
          AND action_type = 'consume'
          AND timestamp > NOW() - INTERVAL '90 days';

        -- Calculate confidence based on data points (more data = higher confidence)
        prediction_confidence := LEAST(1.0, consumption_count / 10.0);

        -- Calculate estimated days remaining
        IF avg_daily_consumption > 0 THEN
            estimated_days := CEIL(current_quantity / avg_daily_consumption);
        ELSE
            estimated_days := NULL;
        END IF;
    END IF;

    RETURN QUERY SELECT
        COALESCE(avg_daily_consumption, 0)::DECIMAL as burn_rate,
        COALESCE(prediction_confidence, 0.3)::DECIMAL as confidence,
        estimated_days::INTEGER as days_remaining;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_burn_rate IS 'Calculate burn rate, confidence, and days remaining for an item';

-- =============================================================================
-- Function to update all item burn rates
-- =============================================================================

CREATE OR REPLACE FUNCTION update_all_burn_rates()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER := 0;
    item_record RECORD;
    calc_result RECORD;
BEGIN
    FOR item_record IN
        SELECT id FROM items WHERE deleted_at IS NULL
    LOOP
        -- Calculate burn rate for this item
        SELECT * INTO calc_result FROM calculate_burn_rate(item_record.id);

        -- Update the item
        UPDATE items
        SET burn_rate = calc_result.burn_rate,
            confidence_score = calc_result.confidence,
            days_remaining = calc_result.days_remaining,
            updated_at = NOW()
        WHERE id = item_record.id;

        updated_count := updated_count + 1;
    END LOOP;

    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_all_burn_rates IS 'Update burn rates for all active items';

-- =============================================================================
-- Trigger to update burn rate on consumption
-- =============================================================================

CREATE OR REPLACE FUNCTION update_item_burn_rate_on_consumption()
RETURNS TRIGGER AS $$
DECLARE
    calc_result RECORD;
BEGIN
    -- Only recalculate on consume or restock actions
    IF NEW.action_type IN ('consume', 'restock') THEN
        SELECT * INTO calc_result FROM calculate_burn_rate(NEW.item_id);

        UPDATE items
        SET burn_rate = calc_result.burn_rate,
            confidence_score = calc_result.confidence,
            days_remaining = calc_result.days_remaining,
            last_purchase_date = CASE
                WHEN NEW.action_type = 'restock' THEN NOW()
                ELSE last_purchase_date
            END
        WHERE id = NEW.item_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic burn rate updates
DROP TRIGGER IF EXISTS update_burn_rate_on_consumption ON consumption_logs;
CREATE TRIGGER update_burn_rate_on_consumption
    AFTER INSERT ON consumption_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_item_burn_rate_on_consumption();

COMMENT ON TRIGGER update_burn_rate_on_consumption ON consumption_logs IS 'Automatically update item burn rate when consumption is logged';

-- =============================================================================
-- View for shopping list with enriched data
-- =============================================================================

CREATE OR REPLACE VIEW shopping_list_enriched AS
SELECT
    sl.id,
    sl.user_id,
    sl.item_name,
    sl.category,
    sl.quantity,
    sl.unit,
    sl.priority,
    sl.notes,
    sl.completed,
    sl.completed_at,
    sl.created_at,
    sl.updated_at,
    -- Enriched data from linked inventory item
    i.quantity as current_stock,
    i.burn_rate,
    i.days_remaining,
    i.location,
    i.status
FROM shopping_list sl
LEFT JOIN items i ON sl.inventory_item_id = i.id
WHERE sl.deleted_at IS NULL;

COMMENT ON VIEW shopping_list_enriched IS 'Shopping list with enriched data from inventory';

-- =============================================================================
-- Grant permissions
-- =============================================================================

-- Grant access to new tables and functions (adjust username as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON shopping_list TO weareout_app;
-- GRANT EXECUTE ON FUNCTION calculate_burn_rate(UUID) TO weareout_app;
-- GRANT EXECUTE ON FUNCTION update_all_burn_rates() TO weareout_app;

-- =============================================================================
-- Migration Complete
-- =============================================================================

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Phase 2.5 Foundation migration completed successfully!';
    RAISE NOTICE '- Added consumption intelligence columns to items table';
    RAISE NOTICE '- Created shopping_list table';
    RAISE NOTICE '- Added burn rate calculation functions';
    RAISE NOTICE '- Created automatic update triggers';
END $$;

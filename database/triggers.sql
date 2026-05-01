-- =============================================================================
-- FILE: database/triggers.sql
-- PROJECT: NexusEstate — PropTech Lease Swap Engine
-- DESCRIPTION: Trigger functions and trigger definitions.
-- =============================================================================

DROP TABLE IF EXISTS Fraud_Audit_Log CASCADE;
DROP TABLE IF EXISTS Fraud_City_Thresholds CASCADE;

-- =============================================================================
-- BONUS: Fraud_Audit_Log
-- -----------------------------------------------------------------------------
-- Append-only audit log.
-- =============================================================================

CREATE TABLE Fraud_Audit_Log (
    id              SERIAL          PRIMARY KEY,
    property_id     INT             NOT NULL REFERENCES properties(property_id) ON DELETE CASCADE,
    old_flag        BOOLEAN,
    new_flag        BOOLEAN         NOT NULL,
    old_price       NUMERIC(12,2),
    new_price       NUMERIC(12,2)   NOT NULL,
    flagged_by      TEXT            NOT NULL DEFAULT 'SYSTEM_TRIGGER',
    flagged_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note            TEXT
);

CREATE INDEX idx_fraud_audit_property ON Fraud_Audit_Log (property_id, flagged_at DESC);

-- =============================================================================
-- TRIGGER 1: Auto-flag fraud on low price (rent)
-- =============================================================================

CREATE TABLE Fraud_City_Thresholds (
    city                VARCHAR(100)    PRIMARY KEY,
    min_price_threshold NUMERIC(12,2)   NOT NULL,
    updated_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Fraud_City_Thresholds (city, min_price_threshold) VALUES
    ('Mumbai',    5000.00),
    ('Delhi',     5000.00),
    ('Bangalore', 5000.00),
    ('Chennai',   5000.00),
    ('Hyderabad', 5000.00),
    ('Pune',      5000.00)
ON CONFLICT (city) DO NOTHING;

CREATE OR REPLACE FUNCTION fn_auto_flag_fraud_price()
RETURNS TRIGGER
LANGUAGE plpgsql AS
$$
DECLARE
    v_threshold     NUMERIC(12,2);
    v_city_upper    VARCHAR(100);
BEGIN
    v_city_upper := INITCAP(TRIM(NEW.city));

    SELECT min_price_threshold
    INTO   v_threshold
    FROM   Fraud_City_Thresholds
    WHERE  city = v_city_upper;

    IF FOUND THEN
        IF NEW.price < v_threshold THEN
            NEW.is_fraud_flagged := TRUE;
            RAISE WARNING
                'NexusEstate Fraud Alert: Property % in % has price ₹% which is below threshold. Auto-flagged.',
                COALESCE(NEW.property_id::TEXT, '[new]'), v_city_upper, NEW.price;
        ELSE
            IF TG_OP = 'UPDATE' AND OLD.price < v_threshold THEN
                NEW.is_fraud_flagged := FALSE;
                RAISE NOTICE 'NexusEstate: Property % price raised above threshold — fraud flag cleared.', NEW.property_id;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_flag_fraud_price ON properties;

CREATE TRIGGER trg_auto_flag_fraud_price
    BEFORE INSERT OR UPDATE OF price, city, is_fraud_flagged
    ON properties
    FOR EACH ROW
    EXECUTE FUNCTION fn_auto_flag_fraud_price();

-- =============================================================================
-- TRIGGER 2: Block swap requests on fraud-flagged properties
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_prevent_fraud_swap()
RETURNS TRIGGER
LANGUAGE plpgsql AS
$$
DECLARE
    v_is_flagged    BOOLEAN;
    v_city          VARCHAR(100);
    v_price         NUMERIC(12,2);
BEGIN
    SELECT is_fraud_flagged, city, price
    INTO   v_is_flagged, v_city, v_price
    FROM   properties
    WHERE  property_id = NEW.current_property_id;

    IF v_is_flagged THEN
        RAISE EXCEPTION
            'Swap request blocked: Property % (%, ₹%) is fraud-flagged.',
            NEW.current_property_id, v_city, v_price
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_fraud_swap ON swap_requests;

CREATE TRIGGER trg_prevent_fraud_swap
    BEFORE INSERT
    ON swap_requests
    FOR EACH ROW
    EXECUTE FUNCTION fn_prevent_fraud_swap();

-- =============================================================================
-- TRIGGER 3: Audit log for fraud flag changes
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_log_fraud_flag_change()
RETURNS TRIGGER
LANGUAGE plpgsql AS
$$
BEGIN
    IF (OLD.is_fraud_flagged IS DISTINCT FROM NEW.is_fraud_flagged) OR
       (TG_OP = 'INSERT' AND NEW.is_fraud_flagged = TRUE) THEN

        INSERT INTO Fraud_Audit_Log
            (property_id, old_flag, new_flag, old_price, new_price, note)
        VALUES (
            NEW.property_id,
            CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.is_fraud_flagged END,
            NEW.is_fraud_flagged,
            CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.price END,
            NEW.price,
            CASE
                WHEN TG_OP = 'INSERT' AND NEW.is_fraud_flagged THEN 'Auto-flagged on INSERT.'
                WHEN TG_OP = 'UPDATE' AND NEW.is_fraud_flagged THEN 'Flag set TRUE on UPDATE.'
                ELSE 'Flag cleared.'
            END
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_log_fraud_flag_change ON properties;

CREATE TRIGGER trg_log_fraud_flag_change
    AFTER INSERT OR UPDATE OF is_fraud_flagged
    ON properties
    FOR EACH ROW
    EXECUTE FUNCTION fn_log_fraud_flag_change();

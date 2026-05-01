-- =============================================================================
-- FILE: database/transactions.sql
-- PROJECT: NexusEstate — PropTech Lease Swap Engine
-- DESCRIPTION: ACID-safe transaction scripts for executing multi-party swaps.
-- =============================================================================

DROP TABLE IF EXISTS swap_log_entries CASCADE;

CREATE TABLE swap_log_entries (
    log_id          SERIAL PRIMARY KEY,
    transaction_id  INT NOT NULL REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    user_id         INT NOT NULL REFERENCES users(user_id),
    property_id     INT NOT NULL REFERENCES properties(property_id),
    logged_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- SECTION 1: STORED PROCEDURE — execute_swap_group()
-- =============================================================================

CREATE OR REPLACE PROCEDURE execute_swap_group(
    p_assignments JSONB,
    OUT p_transaction_id INT
)
LANGUAGE plpgsql AS
$$
DECLARE
    v_assignment        JSONB;
    v_user_id           INT;
    v_from_prop_id      INT;
    v_to_prop_id        INT;
    v_participant_count INT;
    v_locked_prop_ids   INT[];
    v_from_fraud        BOOLEAN;
    v_to_fraud          BOOLEAN;
BEGIN
    v_participant_count := jsonb_array_length(p_assignments);

    IF v_participant_count NOT BETWEEN 2 AND 4 THEN
        RAISE EXCEPTION 'Swap group must have 2–4 participants.' USING ERRCODE = 'invalid_parameter_value';
    END IF;

    -- 1. Acquire pessimistic row locks on ALL properties in one shot
    SELECT ARRAY_AGG(prop_id ORDER BY prop_id)
    INTO   v_locked_prop_ids
    FROM (
        SELECT DISTINCT (elem->>'from_property_id')::INT AS prop_id FROM jsonb_array_elements(p_assignments) AS elem
        UNION
        SELECT DISTINCT (elem->>'to_property_id')::INT FROM jsonb_array_elements(p_assignments) AS elem
    ) all_ids;

    PERFORM property_id FROM properties WHERE property_id = ANY(v_locked_prop_ids) ORDER BY property_id FOR UPDATE NOWAIT;

    -- 2. Lock matching Swap_Requests
    PERFORM id FROM swap_requests WHERE current_property_id = ANY(v_locked_prop_ids) AND is_active = TRUE ORDER BY id FOR UPDATE NOWAIT;

    -- 3. Validate
    FOR v_assignment IN SELECT * FROM jsonb_array_elements(p_assignments)
    LOOP
        v_user_id      := (v_assignment->>'user_id')::INT;
        v_from_prop_id := (v_assignment->>'from_property_id')::INT;
        v_to_prop_id   := (v_assignment->>'to_property_id')::INT;

        IF NOT EXISTS (SELECT 1 FROM properties WHERE property_id = v_from_prop_id AND owner_id = v_user_id) THEN
            RAISE EXCEPTION 'User % does not own property %.', v_user_id, v_from_prop_id USING ERRCODE = 'foreign_key_violation';
        END IF;

        SELECT is_fraud_flagged INTO v_from_fraud FROM properties WHERE property_id = v_from_prop_id;
        SELECT is_fraud_flagged INTO v_to_fraud FROM properties WHERE property_id = v_to_prop_id;

        IF v_from_fraud OR v_to_fraud THEN
            RAISE EXCEPTION 'Swap aborted: property % or % is fraud-flagged.', v_from_prop_id, v_to_prop_id USING ERRCODE = 'check_violation';
        END IF;
    END LOOP;

    -- 4. Write header record
    INSERT INTO transactions (details, status) VALUES ('Automated ' || v_participant_count || '-way swap', 'PENDING') RETURNING transaction_id INTO p_transaction_id;

    -- 5. Execute ownership transfers
    FOR v_assignment IN SELECT * FROM jsonb_array_elements(p_assignments)
    LOOP
        v_user_id      := (v_assignment->>'user_id')::INT;
        v_to_prop_id   := (v_assignment->>'to_property_id')::INT;

        UPDATE properties SET owner_id = v_user_id WHERE property_id = v_to_prop_id;
        INSERT INTO swap_log_entries (transaction_id, user_id, property_id) VALUES (p_transaction_id, v_user_id, v_to_prop_id);
    END LOOP;

    -- 6. Deactivate requests
    UPDATE swap_requests SET is_active = FALSE WHERE current_property_id = ANY(v_locked_prop_ids) AND is_active = TRUE;

    -- 7. Complete
    UPDATE transactions SET status = 'COMPLETED' WHERE transaction_id = p_transaction_id;

    RAISE NOTICE 'Swap group % committed successfully.', p_transaction_id;

EXCEPTION
    WHEN lock_not_available THEN
        RAISE EXCEPTION 'Could not acquire locks for swap group. Retry later. (ERRCODE 55P03)' USING ERRCODE = 'lock_not_available';
    WHEN OTHERS THEN
        BEGIN
            UPDATE transactions SET status = 'ROLLED_BACK' WHERE transaction_id = p_transaction_id;
        EXCEPTION WHEN OTHERS THEN NULL; END;
        RAISE;
END;
$$;

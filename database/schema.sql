-- ============================================================
--   NexusEstate: AI-Driven PropTech with Multi-Node Lease Swap Engine
--   PostgreSQL Implementation  |  DBMS Project
--   SCHEMA DEFINITION
-- ============================================================

DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS swap_requests CASCADE;
DROP TABLE IF EXISTS leases CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    user_id       SERIAL        PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role          VARCHAR(50)   DEFAULT 'Nomad'
);

CREATE TABLE properties (
    property_id     SERIAL          PRIMARY KEY,
    owner_id        INT             NOT NULL,
    city            VARCHAR(100)    NOT NULL,
    price           NUMERIC(12, 2)  NOT NULL CHECK (price >= 0),
    title           VARCHAR(255),
    locality        VARCHAR(150),
    street_address  VARCHAR(255),
    state           VARCHAR(100),
    zip_code        VARCHAR(20),
    description     TEXT,
    type            VARCHAR(50)     DEFAULT 'apartment',
    status          VARCHAR(50)     DEFAULT 'ready-to-move',
    furnishing_status VARCHAR(50)   DEFAULT 'unfurnished',
    bedrooms        INT             DEFAULT 2,
    bathrooms       INT             DEFAULT 2,
    area            INT             DEFAULT 1000,
    image           VARCHAR(500),
    images          JSONB           DEFAULT '[]'::JSONB,
    tag             VARCHAR(50),
    is_rera         BOOLEAN         DEFAULT FALSE,
    dist_metro_km   NUMERIC(5,2)    DEFAULT 5.0,
    dist_highway_km NUMERIC(5,2)    DEFAULT 10.0,
    has_pool        BOOLEAN         DEFAULT FALSE,
    has_gym         BOOLEAN         DEFAULT FALSE,
    has_parking     BOOLEAN         DEFAULT FALSE,
    has_power_backup BOOLEAN        DEFAULT FALSE,
    has_elevator    BOOLEAN         DEFAULT FALSE,
    open_to_swap    BOOLEAN         DEFAULT TRUE,
    is_fraud_flagged BOOLEAN        DEFAULT FALSE,
    listing_type    VARCHAR(50)     DEFAULT 'sale',
    CONSTRAINT fk_property_owner FOREIGN KEY (owner_id) REFERENCES users (user_id)
);

CREATE TABLE leases (
    lease_id     SERIAL  PRIMARY KEY,
    user_id      INT     NOT NULL,
    property_id  INT     NOT NULL,
    start_date   DATE    NOT NULL,
    end_date     DATE    NOT NULL,
    CONSTRAINT fk_lease_user     FOREIGN KEY (user_id)     REFERENCES users      (user_id),
    CONSTRAINT fk_lease_property FOREIGN KEY (property_id) REFERENCES properties (property_id),
    CONSTRAINT chk_lease_dates   CHECK (end_date > start_date)
);

CREATE TABLE swap_requests (
    id                    SERIAL        PRIMARY KEY,
    user_id               INT           NOT NULL,
    current_property_id   INT           NOT NULL,
    desired_city          VARCHAR(100)  NOT NULL,
    desired_window        DATE,
    is_active             BOOLEAN       DEFAULT TRUE,
    created_at            TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_swap_user FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT fk_swap_prop FOREIGN KEY (current_property_id) REFERENCES properties (property_id)
);

CREATE TABLE transactions (
    transaction_id  SERIAL        PRIMARY KEY,
    details         TEXT          NOT NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'ROLLED_BACK'))
);

CREATE INDEX idx_properties_city      ON properties    (city);
CREATE INDEX idx_properties_owner_id  ON properties    (owner_id);
CREATE INDEX idx_leases_user_id       ON leases        (user_id);
CREATE INDEX idx_leases_property_id   ON leases        (property_id);
CREATE INDEX idx_leases_dates         ON leases        (start_date, end_date);
CREATE INDEX idx_swap_desired_city    ON swap_requests (desired_city);
CREATE INDEX idx_swap_user_id         ON swap_requests (user_id);

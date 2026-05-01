const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'nexusestate',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function runDemo() {
  console.log("=========================================");
  console.log("   NEXUS ESTATE - TRIGGERS DEMO");
  console.log("=========================================\n");

  try {
    // ---------------------------------------------------------
    // TEST 1: Insert a Fraudulent Property (Rent < 5000 in Mumbai)
    // ---------------------------------------------------------
    console.log("[TEST 1] Inserting a suspicious property in Mumbai for ₹2,000...");
    
    // We intentionally don't set is_fraud_flagged. The trigger will do it.
    const propQuery = `
      INSERT INTO properties (owner_id, city, price, title, locality) 
      VALUES (1, 'Mumbai', 2000, 'Suspicious Room', 'Dharavi') 
      RETURNING property_id, price, is_fraud_flagged
    `;
    const propResult = await pool.query(propQuery);
    const newProp = propResult.rows[0];
    
    console.log(`✅ Property Inserted! ID: ${newProp.property_id}`);
    console.log(`🚨 Fraud Flag Auto-Set By Trigger: ${newProp.is_fraud_flagged}`);

    // Check Audit Log
    console.log("\n[TEST 2] Checking the Fraud_Audit_Log...");
    const auditQuery = `SELECT * FROM Fraud_Audit_Log WHERE property_id = $1`;
    const auditResult = await pool.query(auditQuery, [newProp.property_id]);
    console.log(auditResult.rows[0]);

    // ---------------------------------------------------------
    // TEST 3: Try to create a Swap Request for this Fraud Property
    // ---------------------------------------------------------
    console.log("\n[TEST 3] Attempting to create a Swap Request using this fraud property...");
    try {
      const swapQuery = `
        INSERT INTO swap_requests (user_id, current_property_id, desired_city, desired_window)
        VALUES (1, $1, 'Delhi', '2026-06-01')
      `;
      await pool.query(swapQuery, [newProp.property_id]);
      console.log("❌ ERROR: Swap Request was successfully created. This should have failed!");
    } catch (err) {
      console.log(`✅ SUCCESS: Trigger blocked the swap request!`);
      console.log(`   Database Error Message: "${err.message}"`);
    }

    console.log("\n=========================================");
    console.log("          DEMO COMPLETED");
    console.log("=========================================\n");

  } catch (error) {
    console.error("Demo Failed:", error);
  } finally {
    await pool.end();
  }
}

runDemo();

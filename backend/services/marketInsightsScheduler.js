const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

/**
 * Executes the Python ML pipeline script to recalculate Market Insights.
 */
function runMarketInsightsPipeline() {
  console.log('[Market Insights] Starting automated ML pipeline execution...');
  
  // Resolve path to the Python script in the newly renamed folder
  const scriptPath = path.resolve(__dirname, '../../market_insights_ai_model/model.py');
  
  // Note: Depending on the server environment, 'python' might need to be 'python3'
  exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`[Market Insights Error] Failed to execute pipeline: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`[Market Insights Stderr] ${stderr}`);
    }
    console.log(`[Market Insights Success] Pipeline executed successfully.`);
    console.log(stdout);
  });
}

/**
 * Initializes the cron jobs for Market Insights.
 * Schedules: 
 * - 0 0 * * * (12:00 AM)
 * - 0 12 * * * (12:00 PM)
 * Timezone: Asia/Kolkata (IST)
 */
function initMarketInsightsScheduler() {
  console.log('[Scheduler] Initializing Market Insights Cron Jobs (12 AM & 12 PM IST)...');

  // Run at 12:00 AM IST
  cron.schedule('0 0 * * *', () => {
    console.log('[Scheduler] Triggering 12:00 AM IST Market Insights update');
    runMarketInsightsPipeline();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });

  // Run at 12:00 PM IST
  cron.schedule('0 12 * * *', () => {
    console.log('[Scheduler] Triggering 12:00 PM IST Market Insights update');
    runMarketInsightsPipeline();
  }, {
    scheduled: true,
    timezone: "Asia/Kolkata"
  });
}

module.exports = {
  initMarketInsightsScheduler,
  runMarketInsightsPipeline
};

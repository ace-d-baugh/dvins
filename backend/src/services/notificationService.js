const { evaluateNotifications } = require('./notificationEngine');
const cron = require('node-cron');

// Run notification evaluation every 5 minutes
const startNotificationService = () => {
  console.log('Starting Notification Service...');
  console.log('Notification evaluation interval: every 5 minutes');
  
  // Run immediately on startup
  evaluateNotifications().catch(console.error);
  
  // Schedule to run every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    evaluateNotifications().catch(console.error);
  });
};

// Run if called directly
if (require.main === module) {
  startNotificationService();
}

module.exports = {
  startNotificationService,
  evaluateNotifications
};
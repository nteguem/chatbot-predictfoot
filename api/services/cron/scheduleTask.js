const cron = require('node-cron');

const scheduleTask = (period, jobFunction) => {
  const executeJob = () => {
    console.log('Executing the scheduled job...');
    try {
      jobFunction();
    } catch (error) {
      console.error('Error occurred during job execution:', error);
    }
  };
  try {
    cron.schedule(period, executeJob);
    console.log(`Scheduled job started. It runs according to the specified period: ${period}`);
  } catch (error) {
    console.error('Error occurred during job scheduling:', error);
  }
};

module.exports = scheduleTask;

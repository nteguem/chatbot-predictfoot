const cron = require('node-cron');
const notificationService = require('../notification.service'); // Assurez-vous d'importer correctement le service de notification

let sendWarningNotification = () => {
  cron.schedule('0 9 * * 1-3', async () => {
    console.log('Executing sendWarningNotification cron job...');
    await notificationService.sendWarningNotification();
  });
};

let sendConfirmationNotification = () => {
  cron.schedule('0 9 * * 4', async () => {
    console.log('Executing sendConfirmationNotification cron job...');
    await notificationService.sendConfirmationNotification();
  });
};

module.exports = {
  sendWarningNotification,
  sendConfirmationNotification
};

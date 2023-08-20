const cron = require('node-cron');
const notificationService = require('../notification.service'); // Assurez-vous d'importer correctement le service de notification

const ValidateWarningNotification = () => {
  cron.schedule('0 9 * * 1-3', async () => {
    await notificationService.sendWarningNotification(3);
  });
};

const ValidateConfirmationNotification = () => {
  cron.schedule('0 9 * * 4', async () => {
    await notificationService.sendConfirmationNotification();
  });
};

module.exports = {
  ValidateWarningNotification, 
  ValidateConfirmationNotification
};
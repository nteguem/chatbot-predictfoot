const cron = require('node-cron');
const notificationService = require('../notification.service'); // Assurez-vous d'importer correctement le service de notification

const ValidateWarningNotification = () => {
  cron.schedule('30 9 * * *', async () => {
    await notificationService.sendWarningNotification(3, client);
  });
};

const ValidateConfirmationNotification = () => {
  cron.schedule('30 9 * * *', async () => {
    await notificationService.sendConfirmationNotification(client);
  });
};

module.exports = {
  ValidateWarningNotification, 
  ValidateConfirmationNotification
};

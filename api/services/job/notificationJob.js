const cron = require('node-cron');
const User = require('../../models/user.model'); 
const sendMessageToNumber = require('../../helpers/whatappsHandler'); 


let sendWarningNotification = () => {
  cron.schedule('0 9 * * 1-3', async () => {
    const today = new Date();
    const threeDaysLater = new Date(today);
    threeDaysLater.setDate(today.getDate() + 3);

    const usersWithActiveSubscriptions = await User.find({
      'subscriptions.expirationDate': { $gt: today, $lte: threeDaysLater },
    });

    usersWithActiveSubscriptions.forEach(async (user) => {
      const phoneNumber = user.phoneNumber;
      const message = 'Votre abonnement expire dans trois jours. \nRenouvelez dès maintenant.';
      await sendMessageToNumber(phoneNumber, message); 
    });
  });
};

let sendConfirmationNotification = () => {
  cron.schedule('0 9 * * 4', async () => {
    const today = new Date();

    const usersWithExpiredSubscriptions = await User.find({
      'subscriptions.expirationDate': { $lte: today },
    });

    usersWithExpiredSubscriptions.forEach(async (user) => {
      const phoneNumber = user.phoneNumber;
      const message = 'Votre abonnement a expiré. \nRenouvelez-le pour continuer à profiter de nos prédictions.';
      await sendMessageToNumber(phoneNumber, message); 
    });
  });
};

module.exports = {
  sendWarningNotification,
  sendConfirmationNotification
};

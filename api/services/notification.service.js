const User = require('../models/user.model'); 
const {sendMessageToNumber} = require('../helpers/whatappsHandler');  
const moment = require('moment');
const { initializeWhatsAppClient } = require('../helpers/whatappsHandler');

const client = initializeWhatsAppClient();

async function sendWarningNotification() {
    const today = moment();
    const threeDaysLater = moment(today).add(3, 'days');
  
    const usersWithActiveSubscriptions = await User.find({
      'subscriptions.expirationDate': { $gt: today.toDate(), $lte: threeDaysLater.toDate() },
    });
  
    usersWithActiveSubscriptions.forEach(async (user) => {
      const phoneNumber = user.phoneNumber;
      console.log(phoneNumber)
      const message = 'Votre abonnement expire dans trois jours. \nRenouvelez dès maintenant.';
      await sendMessageToNumber(client, phoneNumber, message);
    });
  }
  
  async function sendConfirmationNotification() {
    const today = moment();
  
    const usersWithExpiredSubscriptions = await User.find({
      'subscriptions.expirationDate': { $lte: today.toDate() },
    });
  
    usersWithExpiredSubscriptions.forEach(async (user) => {
      const phoneNumber = user.phoneNumber;
      const message = 'Votre abonnement a expiré. \nRenouvelez-le pour continuer à profiter de nos prédictions.';
      await sendMessageToNumber(client, phoneNumber, message);
    });
  }  

module.exports = {
  sendWarningNotification,
  sendConfirmationNotification
};

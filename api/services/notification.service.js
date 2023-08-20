
const User = require('../models/user.model'); 
const {initializeWhatsAppClient, sendMessageToNumber} = require('../helpers/whatappsHandler');  
const moment = require('moment');

async function sendWarningNotification(periodInDays) {
    const today = moment();
    const targetDate = moment(today).add(periodInDays, 'days');
    const client = initializeWhatsAppClient();
  
    const usersWithActiveSubscriptions = await User.find({
      'subscriptions.expirationDate': { $gt: today.toDate(), $lte: targetDate.toDate() },
    });
  
    for (const user of usersWithActiveSubscriptions) {
      const phoneNumber = user.phoneNumber;
      console.log(phoneNumber)
      const message = 'Votre abonnement expire dans ' + periodInDays + ' jours. \nRenouvelez dès maintenant.';
      console.log(message)
      await sendMessageToNumber(client, phoneNumber, message);
    }
  }
  
  async function sendConfirmationNotification() {
    const today = moment();
    const client = initializeWhatsAppClient();
  
    const usersWithExpiredSubscriptions = await User.find({
      'subscriptions.expirationDate': { $lte: today.toDate() },
    });
  
    for (const user of usersWithExpiredSubscriptions) {
      const phoneNumber = user.phoneNumber;
      const message = 'Votre abonnement a expiré. \nRenouvelez-le pour continuer à profiter de nos prédictions.';
      await sendMessageToNumber(client, phoneNumber, message);
    }
  }
  
  module.exports = {
    sendWarningNotification,
    sendConfirmationNotification
  };
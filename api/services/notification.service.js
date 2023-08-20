const User = require('../models/user.model'); 
const {initializeWhatsAppClient, sendMessageToNumber} = require('../helpers/whatappsHandler');  
const moment = require('moment');
const {hasActiveSubscription} = require('./subscription.service')

// const client = initializeWhatsAppClient();
// console.log(client)

async function sendWarningNotification(daysBeforeExpiration, client) {
    const today = moment();
    console.log(today)
    const targetDate = moment(today).add(daysBeforeExpiration, 'days');
    console.log(targetDate)
  
    const usersWithActiveSubscriptions = await User.find({
        'subscriptions.expirationDate': {
          $gt: today.toDate(),
          $lte: targetDate.toDate()
        },
      });
      
    console.log('Number of users with active subscriptions:', usersWithActiveSubscriptions.length);

    for (const user of usersWithActiveSubscriptions) {
      const phoneNumber = user.phoneNumber;
      console.log('phone number:', phoneNumber)
  
      // Utilisez la fonction hasActiveSubscription pour vérifier si l'abonnement est actif
      const subscriptionResult = await hasActiveSubscription(phoneNumber);

    if (subscriptionResult.success) {
      if (subscriptionResult.hasActiveSubscription) {
          // L'utilisateur a un abonnement actif, envoyez la notification appropriée
          const message = `Votre abonnement expire dans ${daysBeforeExpiration} jours. \nRenouvelez dès maintenant.`;
          console.log(message)
          await sendMessageToNumber(client, phoneNumber, message);
        } 
      } else {
        // Une erreur s'est produite lors de la vérification de l'abonnement, vous pouvez la gérer ici
        console.error('Error checking subscription for user', phoneNumber, error);
      }
    }
  }
  
  
async function sendConfirmationNotification(client) {

    // Récupérez tous les utilisateurs
    const allUsers = await User.find();
  
    for (const user of allUsers) {
      const phoneNumber = user.phoneNumber;
  
      // Utilisez la fonction hasActiveSubscription pour vérifier si l'abonnement est actif
      const subscriptionResult = await hasActiveSubscription(phoneNumber);

    if (subscriptionResult.success) {
      if (!subscriptionResult.hasActiveSubscription) {
          // L'utilisateur n'a pas d'abonnement actif, envoyez la notification appropriée
          const message = 'Votre abonnement a expiré. \nRenouvelez-le pour continuer à profiter de nos prédictions.';
          await sendMessageToNumber(client, phoneNumber, message);
        } 
      } else {
        // Une erreur s'est produite lors de la vérification de l'abonnement, vous pouvez la gérer ici
        console.error('Error checking subscription for user', phoneNumber, error);
      }
    }
  }
  

module.exports = {
  sendWarningNotification,
  sendConfirmationNotification
};

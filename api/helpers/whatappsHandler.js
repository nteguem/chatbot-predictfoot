require('dotenv').config(); // Load environment variables from the .env file
const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const { getAllSubscriptions } = require('../services/subscription.service');
// const { getAllSubscriptions } = require('./votre-chemin-vers-le-service');

const initializeWhatsAppClient = () => {
  const client = new Client({
    // Configurations du client WhatsApp
  });

  client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on('authenticated', () => {
    console.log('Client is authenticated');
  });

  client.on('ready', () => {
    console.log('Client is ready');
  });

  return client;
};

const handleIncomingMessages = (client) => {
  // Utiliser un objet pour stocker les étapes de transaction en cours pour chaque utilisateur
  const transactionSteps = {};
  // Utiliser un objet pour enregistrer l'état de bienvenue pour chaque utilisateur
  const welcomeStatus = {};

  client.on('message', async (msg) => {
    const subscribeKeyword = process.env.SUBSCRIBE_KEYWORD || 'subscribe';

    if (!welcomeStatus[msg.from]) {
      // Envoyer le message de bienvenue la première fois
      const welcomeMessage = `🏆 Bienvenue sur PredictFoot ! 🌟\n\nPrêt à prédire les événements footballistiques passionnants ? Abonnez-vous dès maintenant en tapant *${subscribeKeyword}* pour accéder à nos prédictions premium. Ne manquez plus jamais un moment clé du jeu !\n\n⚽️ Rejoignez-nous et vivez le football autrement. Tapez simplement *${subscribeKeyword}* pour commencer.`;
      msg.reply(welcomeMessage);

      // Enregistrer l'état de bienvenue pour cet utilisateur
      welcomeStatus[msg.from] = true;
    } else if (msg.body.toLowerCase() === subscribeKeyword && !msg.isGroupMsg) {

      if (msg.body.toLowerCase() === subscribeKeyword && !msg.isGroupMsg) { 
        const allSubscriptionsResponse = await getAllSubscriptions();
        if (allSubscriptionsResponse.success) {
          const subscriptions = allSubscriptionsResponse.subscriptions;
          const replyMessage = 'Choisissez un forfait en répondant avec son numéro :\n' +
            subscriptions.map((subscription, index) => {
              return `${index + 1}. ${subscription.description}`;
            }).join('\n');
          msg.reply(replyMessage);
        } else {
          const replyMessage = 'Erreur lors de la récupération des forfaits.';
          msg.reply(replyMessage);
        }
      }
    } else if (/^\d+$/.test(msg.body) && transactionSteps[msg.from]?.step !== 'ask_phone_number') {
      const allSubscriptionsResponse = await getAllSubscriptions();
      if (allSubscriptionsResponse.success) {
        const subscriptions = allSubscriptionsResponse.subscriptions;
        const forfaits = subscriptions.map(subscription => subscription.price.toString());

        const selectedForfaitIndex = parseInt(msg.body) - 1;

        if (selectedForfaitIndex >= 0 && selectedForfaitIndex < forfaits.length) {
          const selectedForfait = forfaits[selectedForfaitIndex];

          // Enregistrer l'étape de la transaction pour cet utilisateur
          transactionSteps[msg.from] = { step: 'ask_phone_number', selectedForfait };

          const phoneNumberMessage = 'Veuillez entrer votre numéro de téléphone pour la transaction Mobile Money (ex: 6xxxxxxxx):';
          msg.reply(phoneNumberMessage);
        } else {
          const invalidForfaitMessage = 'Le numéro de forfait sélectionné est invalide. Réessayez en fournissant un numéro valide.';
          msg.reply(invalidForfaitMessage);
        }
      } else {
        const errorMessage = 'Erreur lors de la récupération des forfaits.';
        msg.reply(errorMessage);
      }
    } else if (transactionSteps[msg.from]?.step === 'ask_phone_number') {
      let phoneNumber = msg.body.replace(/\s+/g, ''); // Supprimer les espaces

      // Ajouter le préfixe +237 si nécessaire
      if (!phoneNumber.startsWith('+237')) {
        phoneNumber = '+237' + phoneNumber;
      }

      // Vérifier le format du numéro de téléphone
      if (/^(?:\+237)?6(?:9|8|7|5)\d{7}$/.test(phoneNumber)) {
        // Si l'utilisateur a fourni un numéro de téléphone pour la transaction, déclencher l'API de paiement
        const paymentData = {
          service: process.env.PAYMENT_SERVICE_ID,
          phonenumber: msg.body.replace(/^\+/, '').replace(/\s/g, ''),
          amount: transactionSteps[msg.from]?.selectedForfait,
          user: msg.from, // Le numéro de téléphone WhatsApp de l'utilisateur
          first_name: transactionSteps[msg.from]?.selectedForfait == 2000 ? 7 : (transactionSteps[msg.from]?.selectedForfait == 5000 ? 30 : 90),
          item_ref: transactionSteps[msg.from]?.selectedForfait == 2000 ? "forfait vip hebdomadaire" : (transactionSteps[msg.from]?.selectedForfait == 5000 ? "forfait vip mensuel" : "forfait vip 3 mois"),
        };

        const apiEndpoint = process.env.PAYMENT_API_ENDPOINT;
        try {
          const response = await axios.post(apiEndpoint, paymentData);

          // Vérifier la réponse de l'API de paiement pour déterminer si la transaction est réussie
          if (response.data.status == "REQUEST_ACCEPTED") {
            // La transaction a réussi, envoyer un message de confirmation à l'utilisateur
            const confirmationMessage = `transaction ${response.data.channel_name} en cours de traitement veillez saisir ${response.data.channel_ussd}`;
            msg.reply(confirmationMessage);
          } else {
            // La transaction a échoué, envoyer un message d'échec à l'utilisateur
            const errorMessage = 'La transaction n\'a pas été effectuée. Veuillez réessayer plus tard.';
            msg.reply(errorMessage);
          }
        } catch (error) {
          console.error(error);
          const errorMessage = 'Une erreur s\'est produite lors du traitement de la transaction. Veuillez réessayer plus tard.';
          msg.reply(errorMessage);
        } finally {
          // Réinitialiser l'étape de la transaction une fois terminée
          delete transactionSteps[msg.from];
        }
      } else if (/^(?:\+237)?6(?:6|2)\d{7}$/.test(phoneNumber)) {
        const invalidPhoneNumberMessage = 'Veuillez entrer uniquement un numéro MTN ou Orange.';
        msg.reply(invalidPhoneNumberMessage);
      } else {
        const invalidPhoneNumberMessage = 'Le numéro de téléphone est invalide. Veuillez saisir un numéro de téléphone au format valide (ex: 6xxxxxxxx).';
        msg.reply(invalidPhoneNumberMessage);
      }
    } else {
      const invalidRequestMessage = `Je ne comprends pas votre requête. Abonnez-vous dès maintenant en tapant *${subscribeKeyword}* pour accéder à nos prédictions premium.`;
      msg.reply(invalidRequestMessage);
    }
  });
};





// Fonction pour envoyer un message à un numéro spécifique
const sendMessageToNumber = async (client, phoneNumber, message) => {
  try {
    await client.sendMessage(phoneNumber, message);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// Fonction pour envoyer un média (PDF, image, etc.) à un numéro spécifique
const sendMediaToNumber = async (client, phoneNumber, mediaType, mediaBase64, filename) => {
  try {
    const media = new MessageMedia(mediaType, mediaBase64, filename);
    await client.sendMessage(phoneNumber, media);
  } catch (error) {
    console.error('Error sending media:', error);
  }
};


module.exports = {
  initializeWhatsAppClient,
  handleIncomingMessages,
  sendMessageToNumber,
  sendMediaToNumber
};

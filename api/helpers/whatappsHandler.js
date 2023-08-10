require('dotenv').config(); // Load environment variables from the .env file
const { Client,MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

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

  client.on('message', async (msg) => {
    const subscribeKeyword = process.env.SUBSCRIBE_KEYWORD || 'subscribe';

    if (msg.body.toLowerCase() === subscribeKeyword && !msg.isGroupMsg) {
      // Répondre avec la liste des forfaits à souscrire
      const forfaits = [
        'Forfait 2000 FCFA / semaine',
        'Forfait 5000 FCFA / mois',
        'Forfait 10000 FCFA / 3 mois',
      ];

      const replyMessage = 'Choisissez un forfait en répondant avec son numéro :\n' +
        forfaits.map((forfait, index) => `${index + 1}. ${forfait}`).join('\n');

      msg.reply(replyMessage);
    } else if (/^\d+$/.test(msg.body)) {
      // Vérifier si le message de l'utilisateur contient un numéro de forfait valide
      const forfaits = ['2000', '5000', '10000'];
      const selectedForfait = forfaits[parseInt(msg.body) - 1];

      // Enregistrer l'étape de la transaction pour cet utilisateur
      transactionSteps[msg.from] = { step: 'ask_phone_number', selectedForfait };

      // Demander le numéro de téléphone de la transaction Mobile Money
      const phoneNumberMessage = 'Veuillez entrer votre numéro de téléphone pour la transaction Mobile Money:';
      msg.reply(phoneNumberMessage);
    } else if (transactionSteps[msg.from]?.step === 'ask_phone_number' && /^(?:\+237)?6(?:9|8|7|5)\d{7}$/.test(msg.body)) {
      // Si l'utilisateur a fourni un numéro de téléphone pour la transaction, déclencher l'API de paiement
      const paymentData = {
        service: process.env.PAYMENT_SERVICE_ID,
        phonenumber: msg.body.replace(/^\+/, ''),
        amount: transactionSteps[msg.from]?.selectedForfait,
        user: msg.from, // Le numéro de téléphone WhatsApp de l'utilisateur
        first_name:transactionSteps[msg.from]?.selectedForfait == 2000 ? 7 : (transactionSteps[msg.from]?.selectedForfait == 5000 ? 30 : 90),
        item_ref:transactionSteps[msg.from]?.selectedForfait == 2000 ? "forfait vip hebdomadaire" : (transactionSteps[msg.from]?.selectedForfait == 5000 ? "forfait vip mensuel" : "forfait vip 3 mois"),
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
    } else {
      msg.reply(`🏆 Bienvenue sur PredictFoot ! 🌟

      Prêt à prédire les événements footballistiques passionnants ? Abonnez-vous dès maintenant en tapant *${subscribeKeyword}* pour accéder à nos prédictions premium. Ne manquez plus jamais un moment clé du jeu !
      
      ⚽️ Rejoignez-nous et vivez le football autrement. Tapez simplement *${subscribeKeyword}* pour commencer.`);
    }
  });
};

// Fonction pour envoyer un message à un numéro spécifique
const sendMessageToNumber = async (client,phoneNumber, message) => {
  try {
    await client.sendMessage(phoneNumber, message);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

// Fonction pour envoyer un média (PDF, image, etc.) à un numéro spécifique
const sendMediaToNumber = async (client,phoneNumber, mediaType, mediaBase64, filename) => {
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

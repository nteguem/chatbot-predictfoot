require('dotenv').config(); // Load environment variables from the .env file
const { Client, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const { userExistAndSubscribe } = require('../../services/user.service')
const { findActiveSubscribers, getAllSubscriptions } = require('../../services/subscription.service');
const MonetBil = require('../MonetBil');
const { handleUser } = require('./users');
const { sendAdminPronostics } = require('./admin');
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
  const welcomeStatusUser = {};
  // Utiliser un objet pour enregistrer l'état de bienvenue pour chaque administrateur
  const welcomeStatusAdmin = {};
  // Utiliser un objet pour enregistrer les predictions
  const savedPredictions = {};

  client.on('message', async (msg) => { 
    const isSubscribe = await userExistAndSubscribe(msg.from); 
    console.log('ok::',msg.from)
    console.log('oki::', process.env.NUMBER_ADMIN) 
    if (isSubscribe.success && !msg.isGroupMsg && msg.from != process.env.NUMBER_ADMIN) {
      msg.reply("Étant déjà abonné à l'un de nos forfaits en cours, saisissez l'occasion de tirer parti de nos pronostics VIP pour remporter d'importants gains.");
    }
    else if (msg.from == process.env.NUMBER_ADMIN && !msg.isGroupMsg) {
      await sendAdminPronostics(msg, welcomeStatusAdmin, transactionSteps, savedPredictions, client);
    }
    else {
      const subscribeKeyword = process.env.SUBSCRIBE_KEYWORD || 'subscribe';
      handleUser(msg, subscribeKeyword, welcomeStatusUser, transactionSteps, client);
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

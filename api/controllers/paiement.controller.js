const moment = require('moment');
const {sendMessageToNumber,sendMediaToNumber} = require('../helpers/whatsApp/whatsappMessaging');
const { addSubscriptionToUser } = require('../services/subscription.service');
const { findActivePrediction } = require('../services/prediction.service');
const generatePDFBuffer = require('../helpers/pdfGenerator');

async function handlePaymentSuccess(req, res, client) {
  try {
    const {user,phone,operator_transaction_id,item_ref,amount,first_name,operator} = req.body;
    const dateSubscription = moment().format('YYYY-MM-DD');
    const expirationDate = moment(dateSubscription).add(first_name, 'days');
    const formattedExpirationDate = expirationDate.format('YYYY-MM-DD');
    const successMessage = `Félicitations ! Votre paiement pour le forfait ${item_ref} a été effectué avec succès. Profitez de nos services premium ! Ci-joint la facture de paiement du forfait.`;
    const pdfBuffer = await generatePDFBuffer(user,phone,operator_transaction_id,item_ref,operator,amount,first_name);
    const pdfBase64 = pdfBuffer.toString('base64');
    const pdfName = 'invoice.pdf';
    const documentType = 'application/pdf';

    await Promise.all([
      sendMediaToNumber(client, `${user}@c\.us`, documentType, pdfBase64, pdfName),
      addSubscriptionToUser(user, item_ref, dateSubscription, formattedExpirationDate),
    ]);

    const prediction = await findActivePrediction();
    const message = prediction ? prediction.predictions : successMessage;
    await sendMessageToNumber(client, `${user}@c\.us`, message);

    res.status(200).send('Success');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du traitement.');
  }
}

async function handlePaymentFailure(req, res, client, operatorMessage) {
  try {
    const failureMessage = operatorMessage || `Désolé, Votre paiement mobile pour le forfait ${req.body.item_ref} a échoué en raison d'un problème de transaction. Veuillez vérifier vos détails de paiement et réessayer. Si le problème persiste, contactez-nous pour de l'aide. Nous nous excusons pour tout désagrément.
    
    
    Cordialement, L'équipe de predictfoot`;
    await sendMessageToNumber(client, `${req.body.user}@c\.us`, failureMessage);
    res.status(200).send('Failure');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du traitement.');
  }
}

async function handlePaymentNotification(req, res, client) {
  try {
    if (req.body.message === 'FAILED') {
      await handlePaymentFailure(req, res, client);
    } else if (req.body.message === 'INTERNAL_PROCESSING_ERROR') {
      const operatorMessage = `Désolé, Votre paiement mobile a rencontré une erreur due à un problème technique avec le service ${req.body.operator}. Nous travaillons sur la résolution de ce problème. En attendant, nous vous recommandons d'essayer à nouveau plus tard. Désolé pour le dérangement. 
      
      
      Cordialement, L'équipe Predictfoot`;
      await handlePaymentFailure(req, res, client, operatorMessage);
    } else {
      await handlePaymentSuccess(req, res, client);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du traitement.');
  }
}

module.exports = {
  handlePaymentNotification,
};

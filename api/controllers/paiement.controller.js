const generatePDFBuffer = require('../helpers/pdfGenerator');
const { sendMessageToNumber, sendMediaToNumber } = require("../helpers/whatsApp/whatsappMessaging")
const { addSubscriptionToUser } = require("../services/subscription.service")
const moment = require('moment');


async function handlePaymentSuccess(req, res, client) {
  try {
    const { user, phone, operator, operator_transaction_id, item_ref, amount, first_name } = req.body
    const dateSubscription = moment().format('YYYY-MM-DD');
    const expirationDate = moment(dateSubscription).add(first_name, 'days');
    const formattedExpirationDate = expirationDate.format('YYYY-MM-DD');
    // Créez un message de succès
    const successMessage = `Félicitations ! Votre paiement pour le forfait ${item_ref} a été effectué avec succès. Profitez de nos services premium ! Ci-joint la facture de paiement du forfait.`;
    // Envoyez le message de succès au destinataire
    await sendMessageToNumber(client, req.body.user + "@c\.us", successMessage);

    // Générez le PDF
    const pdfBuffer = await generatePDFBuffer(user, phone, operator_transaction_id, item_ref, operator, amount, first_name);
    const pdfBase64 = pdfBuffer.toString('base64');
    const pdfName = 'invoice.pdf';
    const documentType = 'application/pdf'
    await sendMediaToNumber(client, req.body.user + "@c\.us", documentType, pdfBase64, pdfName);// Envoyez le PDF en tant que document
    await addSubscriptionToUser(req.body.user, req.body.item_ref, dateSubscription, formattedExpirationDate) // ajouter la souscription a l'utilisateur
    res.status(200).send('Success');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du traitement.');
  }
}

async function handlePaymentFailure(req, res, client) {
  try {
    if (req.body.message == 'FAILED') {
      const failureMessage = `Désolé,

Votre paiement mobile pour le forfait ${req.body.item_ref}  a échoué en raison d'un problème de transaction. Veuillez vérifier vos détails de paiement et réessayer. Si le problème persiste, contactez-nous pour de l'aide.

Nous nous excusons pour tout désagrément.

Cordialement,
L'équipe de predictfoot`

      await sendMessageToNumber(client, req.body.user + "@c\.us", failureMessage);
      res.status(200).send('Failure');

    }
    else if (req.body.message == 'INTERNAL_PROCESSING_ERROR') {
      const failureMessage = `Désolé,

Votre paiement mobile a rencontré une erreur due à un problème technique avec le service ${req.body.operator}. Nous travaillons sur la résolution de ce problème. En attendant, nous vous recommandons d'essayer à nouveau plus tard.

Désolé pour le dérangement.

Cordialement,
L'equipe Predictfoot`

      await sendMessageToNumber(client, req.body.user + "@c\.us", failureMessage);
      res.status(200).send('Failure');

    }
    else {
      await handlePaymentSuccess(req, res, client);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du traitement.');
  }
}

module.exports = {
  handlePaymentSuccess,
  handlePaymentFailure,
};

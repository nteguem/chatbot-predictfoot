const generatePDFBuffer = require('../helpers/pdfGenerator');
const {sendMessageToNumber,sendMediaToNumber} = require("../helpers/whatappsHandler")

async function handlePaymentSuccess(req, res , client) {
  try {
      const  {user,phone,operator,operator_transaction_id,item_ref,amount,first_name} = req.body
      // Créez un message de succès
      const successMessage = `Félicitations ! Votre paiement pour le forfait ${item_ref} a été effectué avec succès. Profitez de nos services premium ! Ci-joint la facture de paiement du forfait.`;
      // Envoyez le message de succès au destinataire
      await sendMessageToNumber(client ,req.body.user, successMessage);
    
      // Générez le PDF
    const pdfBuffer = await generatePDFBuffer(user,phone,operator_transaction_id,item_ref,operator,amount,first_name);
    const pdfBase64 = pdfBuffer.toString('base64');
    const pdfName = 'invoice.pdf';
    const documentType = 'application/pdf'

    // Envoyez le PDF en tant que document
    await sendMediaToNumber(client,req.body.user, documentType, pdfBase64, pdfName);

    res.status(200).send('Success');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du traitement.');
  }
}

async function handlePaymentFailure(req, res , client) {
  try {
    const failureMessage = `Désolé, mais votre paiement pour le forfait${req.body.item_ref} n'a pas été traité avec succès. Veuillez vérifier les détails de paiement et réessayer plus tard. Si vous avez des questions, n'hésitez pas à nous contacter. Merci.`;
    await sendMessageToNumber(client ,req.body.user, failureMessage);
    res.status(200).send('Failure');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erreur lors du traitement.');
  }
}

module.exports = {
  handlePaymentSuccess,
  handlePaymentFailure,
};

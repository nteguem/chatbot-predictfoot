const { findActiveSubscribers } = require("../../services/subscription.service");
// const { sendMessageToNumber, sendMediaToNumber } = require("./whatappsHandler");

const whatappsHandler = require("./whatappsHandler");

const sendAdminPronostics = async (msg, welcomeStatusAdmin, transactionSteps, savedPredictions, client) => {
    if (!welcomeStatusAdmin[msg.from]) {
        const welcomeMessage = `Bonjour ${msg.from}, comment puis-je vous aider aujourd'hui ? Vous pouvez saisir *predire* pour envoyer les pronostics aux utilisateurs VIP.`;
        msg.reply(welcomeMessage);
        welcomeStatusAdmin[msg.from] = true;
    } else if (msg.body.toLowerCase() === 'predire') {
        const replyMessage = "Entrez les pronostics du jour que vous souhaitez envoyer aux utilisateurs VIP.";
        msg.reply(replyMessage);
        // Enregistrer l'étape de saisie des pronostics
        transactionSteps[msg.from] = { step: 'enter_predictions' };
    } else if (transactionSteps[msg.from]?.step === 'enter_predictions') {
        const pronostics = msg.body;
        const confirmationMessage = `Voici les pronostics que vous souhaitez envoyer aux utilisateurs VIP :\n${pronostics}\nÊtes-vous sûr de vouloir les envoyer ? Répondez par 'Oui' pour confirmer.`;
        msg.reply(confirmationMessage);
        // Enregistrer l'étape de confirmation
        transactionSteps[msg.from] = { step: 'confirm_send' };
        // Enregistrer les pronostics pour un envoi ultérieur
        savedPredictions[msg.from] = pronostics;
    } else if (transactionSteps[msg.from]?.step === 'confirm_send' && msg.body.toLowerCase() === 'oui') {
        const utilisateursVIP = await findActiveSubscribers();
        const pronostics = savedPredictions[msg.from]; // Récupérer les pronostics enregistrés
        for (const utilisateur of utilisateursVIP.data) { 
            console.log('utilisateursVIP::', utilisateur)
            const message = `Cher utilisateur VIP, voici les pronostics pour aujourd'hui :\n${pronostics}\nBonne chance !`;
            const mediaType = 'image/jpeg'; // Type de média de l'image
            const mediaBase64 = 'base64_encoded_image_data_here'; // Données de l'image en base64
            const filename = 'pronostics.jpg'; // Nom du fichier de l'image 

            await whatappsHandler.sendMessageToNumber(client, utilisateur.phoneNumber + "@c.us", message);
            // await sendMediaToNumber(client, utilisateur.phoneNumber + "@c.us", mediaType, mediaBase64, filename); 
        }
        const confirmationMessage = "Les pronostics ont été envoyés à tous les utilisateurs VIP avec succès.";
        msg.reply(confirmationMessage);
        // Réinitialiser les étapes et les données enregistrées
        transactionSteps[msg.from] = {};
        savedPredictions[msg.from] = '';
    } else {
        const invalidRequestMessage = "Je ne comprends pas votre requête. Pour envoyer des pronostics VIP, saisissez *predire* pour commencer.";
        msg.reply(invalidRequestMessage);
    }
};

module.exports = {
    sendAdminPronostics
};

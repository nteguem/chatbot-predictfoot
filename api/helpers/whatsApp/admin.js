const { findActiveSubscribers } = require("../../services/subscription.service");
const { sendMessageToNumber } = require("./whatsappMessaging");
const {createPrediction} = require("../../services/prediction.service")
const WELCOME_MESSAGE = "Bonjour %s, comment puis-je vous aider aujourd'hui ? Vous pouvez saisir *predire* pour envoyer les pronostics aux utilisateurs VIP.";
const PREDICT_MESSAGE = "Entrez les pronostics du jour que vous souhaitez envoyer aux utilisateurs VIP.";
const CONFIRM_MESSAGE = "Voici les pronostics que vous souhaitez envoyer aux utilisateurs VIP :\n\n*%s*\n\nÊtes-vous sûr de vouloir les envoyer ? Répondez par 'Oui' pour confirmer.";
const SUCCESS_MESSAGE = "Les pronostics ont été envoyés à tous les utilisateurs VIP avec succès.";
const INVALID_REQUEST_MESSAGE = "Je ne comprends pas votre requête. Pour envoyer des pronostics VIP, saisissez *predire* pour commencer.";
const COMMAND_NAME =  { PREDIRE :'predire'};

const AdminCommander = async (client, msg, transactions) => {
    const sender = msg.from;
    if (!transactions[sender]) {
        msg.reply(WELCOME_MESSAGE.replace('%s', sender));
        transactions[sender] = {};
    } else {
        const userMessage = msg.body.toLowerCase();
        if (userMessage === COMMAND_NAME.PREDIRE) {
            msg.reply(PREDICT_MESSAGE);
            transactions[sender].step = "enter_predictions";
        } else if (transactions[sender].step === "enter_predictions") {
            const predictions = msg.body;
            msg.reply(CONFIRM_MESSAGE.replace('%s', predictions));
            transactions[sender].step = "confirm_send";
            transactions[sender].predictions = predictions;
        } else if (transactions[sender].step === "confirm_send" && userMessage === "oui") {
            try {
                const activeSubscribers = await findActiveSubscribers();
                const predictions = `Cher utilisateur VIP, voici les pronostics pour aujourd'hui :\n\n*${transactions[sender].predictions}* \n\n Bonne chance !`;
                await createPrediction({sender:sender,predictions:predictions});
                for (const subscriber of activeSubscribers.data) {
                    await sendMessageToNumber(
                        client,
                        `${subscriber.phoneNumber}@c.us`,
                        predictions
                    );
                }
                
                msg.reply(SUCCESS_MESSAGE);
            } catch (error) {
                console.error("Error sending messages:", error);
                msg.reply("Une erreur s'est produite lors de l'envoi des messages.");
            } finally {
                delete transactions[sender];
            }
        } else {
            msg.reply(INVALID_REQUEST_MESSAGE);
        }
    }
};

module.exports = {
    AdminCommander,
};

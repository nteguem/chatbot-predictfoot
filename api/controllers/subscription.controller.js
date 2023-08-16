const subscriptionService = require('../services/subscription.service');

const getActiveSubscribers = async (req, res) => {
    const response = await subscriptionService.findActiveSubscribers();
    if (response.success) {
        res.json(response.data);
    } else {
        res.status(500).json({ message: 'Erreur lors de la récupération des abonnés actifs', error: response.error });
    }
};

const checkActiveSubscription = async (req, res) => {
    const phoneNumber = req.params.phoneNumber;
    const response = await subscriptionService.hasActiveSubscription(phoneNumber);

    if (response.success) {
        res.json({ hasActiveSubscription: response.hasActiveSubscription });
    } else {
        res.status(500).json({ message: 'Erreur lors de la vérification de l\'abonnement actif', error: response.error });
    }
};

const getAllSubscriptions = async (req, res) => {
    const phoneNumber = req.params.phoneNumber;
    const response = await subscriptionService.getAllSubscriptions(phoneNumber);

    if (response.success) {
        res.json(response.subscriptions);
    } else {
        res.status(500).json({ message: 'Erreur lors de la récupération des souscriptions de l\'utilisateur', error: response.error });
    }
};

const addSubscription = async (req, res) => {
    const { userId, subscriptionId, subscriptionDate, expirationDate } = req.body;
    const response = await subscriptionService.addSubscription(userId, subscriptionId, subscriptionDate, expirationDate);
    
    if (response.success) {
      res.json({ message: response.message });
    } else {
      res.status(500).json({ message: 'Erreur lors de l\'ajout de la souscription', error: response.error });
    }
  };

module.exports = {
    getActiveSubscribers,
    getAllSubscriptions,
    checkActiveSubscription,
    addSubscription
};

// services/subscription.service.js
const User = require('../models/user.model');

async function findActiveSubscribers() {
  try {
    const activeSubscribers = await User.find({ 'subscriptions.expirationDate': { $gt: new Date() } }).populate('subscriptions.subscription');
    return { success: true, data: activeSubscribers };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function hasActiveSubscription(phoneNumber) {
    try {
      const user = await User.findOne({ phoneNumber, 'subscriptions.expirationDate': { $gt: new Date() } });
      return { success: true, hasActiveSubscription: !!user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async function getAllSubscriptions(phoneNumber) {
    try {
      const user = await User.findOne({ phoneNumber }).populate('subscriptions.subscription');
      
      if (!user) {
        return { success: false, message: 'Utilisateur non trouvé' };
      }
  
      return { success: true, subscriptions: user.subscriptions };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function addSubscriptionToUser(userId, subscriptionId, subscriptionDate, expirationDate) {
    try {
      const user = await User.findById(userId);
      const subscription = await Subscription.findById(subscriptionId);
  
      if (!user || !subscription) {
        return { success: false, message: 'Utilisateur ou forfait non trouvé' };
      }
  
      user.subscriptions.push({
        subscription: subscriptionId,
        subscriptionDate,
        expirationDate,
      });
  
      await user.save();
      return { success: true, message: 'Souscription ajoutée avec succès' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

module.exports = {
  findActiveSubscribers,
  getAllSubscriptions,
  hasActiveSubscription,
  addSubscriptionToUser
};

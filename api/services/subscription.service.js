// services/subscription.service.js
const Subscription = require('../models/subscription.model')
const User = require('../models/user.model');


async function createSubscription(subscriptionData) {
  try {
    const newSubscription = new Subscription(subscriptionData);
    await newSubscription.save();
    return { success: true, message: 'Forfait créé avec succès' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getAllSubscriptions() {
  try {
    const subscriptions = await Subscription.find();
    return { success: true, subscriptions };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function updateSubscription(subscriptionId, updatedData) {
  try {
    const updatedSubscription = await Subscription.findByIdAndUpdate(subscriptionId, updatedData, { new: true });
    
    if (!updatedSubscription) {
      return { success: false, message: 'Forfait non trouvé' };
    }

    return { success: true, subscription: updatedSubscription };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function deleteSubscription(subscriptionId) {
  try {
    const deletedSubscription = await Subscription.findByIdAndDelete(subscriptionId);
    
    if (!deletedSubscription) {
      return { success: false, message: 'Forfait non trouvé' };
    }

    return { success: true, message: 'Forfait supprimé avec succès' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


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
  
  async function getAllSubscriptionsUser(phoneNumber) {
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
  createSubscription,
  getAllSubscriptions,
  updateSubscription,
  deleteSubscription,
  findActiveSubscribers,
  getAllSubscriptionsUser,
  hasActiveSubscription,
  addSubscriptionToUser,
};

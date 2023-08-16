const express = require('express');
const router = express.Router();
const subscriptionHandler = require('../controllers/subscription.controller');

/**
 * Set up the subscription routes and link them to the corresponding controller functions.
 * @param {express.Application} app - The Express application.
 */
const setupSubscriptionRoutes = (app) => {
    // Mount the 'router' to handle routes with the base path '/subscription'.
    app.use("/subscription", router);
    router.get('/active-subscribers', subscriptionHandler.getActiveSubscribers);
    router.get('/has-active-subscription/:phoneNumber', subscriptionHandler.checkActiveSubscription);
    router.get('/all-subscriptions/:phoneNumber', subscriptionHandler.getAllSubscriptions);
    router.post('/add-subscription', subscriptionHandler.addSubscription);
  };
  
  module.exports = { setupSubscriptionRoutes };

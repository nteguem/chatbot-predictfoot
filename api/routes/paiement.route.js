const express = require('express');
const router = express.Router();
const paymentHandler = require('../controllers/paiement.controllers');

/**
 * Set up the paiement routes and link them to the corresponding controller functions.
 * @param {express.Application} app - The Express application.
 */
const setupPaiementRoutes = (app, client) => {
    // Mount the 'router' to handle routes with the base path '/paiement'.
    app.use("/paiement", router);
  
    router.post("/success", (req, res) => {
      paymentHandler.handlePaymentSuccess(req, res, client); 
     });
  
     router.post("/failure", (req, res) => {
      paymentHandler.handlePaymentFailure(req, res, client); 
     });

  };
  
  // Export the 'setupPaiementRoutes' function to be used in other files.
  module.exports = { setupPaiementRoutes };

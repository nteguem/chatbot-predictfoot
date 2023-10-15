const Prediction = require('../models/prediction.model');
const moment = require('moment'); 


async function createPrediction(predictionData) {
  try {
    const newPrediction = new Prediction(predictionData);
    await newPrediction.save();
    return { success: true, message: 'Prediction créé avec succès' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


async function findActivePrediction() {
    try {
      const today = moment().startOf('day'); 
      const prediction = await Prediction.findOne({
        date: { $gte: today.toDate(), $lt: moment(today).endOf('day').toDate() }
      }).exec();
      return prediction || null;
    } catch (error) {
      console.error('Erreur lors de la recherche de la prédiction :', error);
      throw error;
    }
  }
  

  

module.exports = {
  createPrediction,
  findActivePrediction,
};

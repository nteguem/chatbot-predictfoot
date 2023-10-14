const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  sender: String,
  predictions: String,
  date: { type: Date, default: Date.now }
});

const Prediction = mongoose.model('predictWhatapp', predictionSchema);

module.exports = Prediction;

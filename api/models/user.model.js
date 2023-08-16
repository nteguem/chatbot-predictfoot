const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true},
  subscriptions: [{
    subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' },
    subscriptionDate: { type: Date, default: Date.now },
    expirationDate: { type: Date, required: true },
  }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;

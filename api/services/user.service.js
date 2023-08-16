require('dotenv').config(); // Load environment variables from the .env file
const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET; // Remplacez ceci par une clé secrète sécurisée

async function createUser(userData) {
    try {
        const newUser = new User(userData);
        await newUser.save();
        return { success: true, message: 'Utilisateur créé avec succès' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function login(phoneNumber, password) {
    try {
        const user = await User.findOne({ phoneNumber });

        if (!user) {
            return { success: false, message: 'Utilisateur non trouvé' };
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return { success: false, message: 'Mot de passe incorrect' };
        }

        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function getUser(userId) {
    try {
        const user = await User.findById(userId);

        if (!user) {
            return { success: false, message: 'Utilisateur non trouvé' };
        }

        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function updateUser(userId, updatedData) {
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

        if (!updatedUser) {
            return { success: false, message: 'Utilisateur non trouvé' };
        }

        return { success: true, user: updatedUser };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function generateAccessToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
}



module.exports = {
    createUser,
    login,
    generateAccessToken,
    getUser,
    updateUser,
};

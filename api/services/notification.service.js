async function sendWarningNotification(phoneNumber, message) {
    try {
      // Code pour envoyer une notification d'avertissement à l'utilisateur
      console.log(`Sending warning notification to ${phoneNumber}: ${message}`);
      return { success: true, message: 'Notification d\'avertissement envoyée avec succès' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  async function sendConfirmationNotification(phoneNumber, message) {
    try {
      // Code pour envoyer une notification de confirmation à l'utilisateur
      console.log(`Sending confirmation notification to ${phoneNumber}: ${message}`);
      return { success: true, message: 'Notification de confirmation envoyée avec succès' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  module.exports = {
    sendWarningNotification,
    sendConfirmationNotification
  };
  
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.sendNewMessageNotification = functions.firestore
  .document('conversations/{conversationId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const messageData = snapshot.data();
    const conversationId = context.params.conversationId;

    // Get the conversation document
    const conversationDoc = await admin
      .firestore()
      .collection('conversations')
      .doc(conversationId)
      .get();
    const conversationData = conversationDoc.data();

    // Get the recipient's user ID
    const recipientId = conversationData.participants.find(
      (participantId) => participantId !== messageData.user._id
    );

    // Get the recipient's user document to get their FCM token
    const recipientDoc = await admin
      .firestore()
      .collection('utilisateurs')
      .doc(recipientId)
      .get();
    const recipientData = recipientDoc.data();
    const fcmToken = recipientData.fcmToken;

    if (fcmToken) {
      // Construct the notification message
      const payload = {
        notification: {
          title: `Nouveau message de ${messageData.user.name}`,
          body: messageData.text,
          sound: 'default',
        },
        data: {
          conversationId: conversationId,
        },
      };

      try {
        // Send the notification
        await admin.messaging().sendToDevice(fcmToken, payload);
        console.log('Notification sent successfully');
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  });

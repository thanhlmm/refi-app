import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();
const db = admin.firestore();

export const generateGoogleAuthFlow = functions.https.onCall(async () => {
  const doc = await db.collection("googleAuth").add({
    login: true,
  });

  return doc.id;
});

export const googleAuthSuccess = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", { structuredData: true });
  functions.logger.info(request.headers, { structuredData: true });
  response.send("Hello from Firebase!");
});

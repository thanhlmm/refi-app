const { setLogFunction } = require("@google-cloud/firestore");
const admin = require("firebase-admin");
const credentials = require("./credentials.json");

const app = admin.initializeApp({
  credential: admin.credential.cert({
    projectId: credentials.project_id,
    clientEmail: credentials.client_email,
    privateKey: credentials.private_key,
  }),
}); // TODO: Map to config here
const db = app.firestore();

// Log function
setLogFunction(console.log);

module.exports = db;

import { setLogFunction } from "@google-cloud/firestore";
import admin from 'firebase-admin';
import credentials from "./credentials.json";

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

export default db;

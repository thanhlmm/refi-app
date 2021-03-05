import firebase from "firebase/app";
// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/analytics";
import "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqxdJ-rBGbcpGIdO9pDaBkxlJFSkAcE6s",
  authDomain: "reficlient.firebaseapp.com",
  projectId: "reficlient",
  storageBucket: "reficlient.appspot.com",
  messagingSenderId: "53485597051",
  appId: "1:53485597051:web:23df99564b958640198dde",
  measurementId: "G-JXDDPXWWE0",
};

firebase.initializeApp(firebaseConfig);

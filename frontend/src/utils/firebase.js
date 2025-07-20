// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCYEQNdnnhuXf7GWM2VVge-S8-2aMYQUHA",
  authDomain: "authentication-singup.firebaseapp.com",
  projectId: "authentication-singup",
  storageBucket: "authentication-singup.firebasestorage.app",
  messagingSenderId: "759625911103",
  appId: "1:759625911103:web:e234a23d41f8dec765218a",
  measurementId: "G-3WL6TPEVW9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
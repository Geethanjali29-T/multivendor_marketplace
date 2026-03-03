import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAMoDzR6LBryh_5Y0egjpn8L-juhis5pic",
    authDomain: "multivendors-fb846.firebaseapp.com",
    projectId: "multivendors-fb846",
    storageBucket: "multivendors-fb846.firebasestorage.app",
    messagingSenderId: "1009655707731",
    appId: "1:1009655707731:web:6b9f9107ab17cc088b2ea6",
    measurementId: "G-453W8LD53X"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

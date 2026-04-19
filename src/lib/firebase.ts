import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBzzZfjj-LlXV3zg0paa6s52Az32ncNAN8",
    authDomain: "quemsoueu-24613.firebaseapp.com",
    projectId: "quemsoueu-24613",
    storageBucket: "quemsoueu-24613.firebasestorage.app",
    messagingSenderId: "8719786055",
    appId: "1:8719786055:web:9ac0bc102dd892186ed162",
    measurementId: "G-84DVC9ZD03"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
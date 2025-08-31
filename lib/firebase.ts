// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvL-fpePt9h21U_EJ-FLE-9PWw_b0MEy4",
  authDomain: "appagiota.firebaseapp.com",
  projectId: "appagiota",
  storageBucket: "appagiota.firebasestorage.app",
  messagingSenderId: "289015782913",
  appId: "1:289015782913:web:008963bd59d60d6ac36a00",
  measurementId: "G-GL6WTNFTYS",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

export default app

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDipnNOvpahw9rfZDdGj41pevr96E7Kb4I",
  authDomain: "campus-platform-20799.firebaseapp.com",
  projectId: "campus-platform-20799",
  storageBucket: "campus-platform-20799.firebasestorage.app",
  messagingSenderId: "420943014891",
  appId: "1:420943014891:web:1bbfec1aed4de05587c7ae"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
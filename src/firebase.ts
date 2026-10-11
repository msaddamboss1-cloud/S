import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB7w62sre73EzNY7TsvHfg88sjVrzPTcSM",
  authDomain: "saddam-premium-hub.firebaseapp.com",
  databaseURL: "https://saddam-premium-hub-default-rtdb.firebaseio.com",
  projectId: "saddam-premium-hub",
  storageBucket: "saddam-premium-hub.firebasestorage.app",
  messagingSenderId: "965040635094",
  appId: "1:965040635094:web:f0102f639adefbaee51d77",
  measurementId: "G-QK1V6L0ZGL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let analytics: ReturnType<typeof getAnalytics> | null = null;

if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn("Firebase Analytics initialization failed.", error);
  }
}

export { app, auth, database, analytics };

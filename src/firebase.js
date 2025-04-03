import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDE-JuYQxj5DyO4c_kwk1ro5khRmoinJFQ",
  authDomain: "planner-ui-2cd08.firebaseapp.com",
  databaseURL: "https://planner-ui-2cd08-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "planner-ui-2cd08",
  storageBucket: "planner-ui-2cd08.firebasestorage.app",
  messagingSenderId: "828775083131",
  appId: "1:828775083131:web:0101751e44e306e72846de",
  measurementId: "G-EFYN6NN18H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };

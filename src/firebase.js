import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDaYUTvG_pmdjFF-RKuhgGYuTQxxuFVAK4",
  authDomain: "controle-de-gastos-dh-7a4e7.firebaseapp.com",
  // Confira esta URL na aba "Dados" do Realtime Database no console do Firebase
  databaseURL: "https://controle-de-gastos-dh-7a4e7-default-rtdb.firebaseio.com",
  projectId: "controle-de-gastos-dh-7a4e7",
  storageBucket: "controle-de-gastos-dh-7a4e7.firebasestorage.app",
  messagingSenderId: "718649884365",
  appId: "1:718649884365:web:74a76d80c8196d508bf384",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

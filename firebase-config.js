// Firebase設定ファイル

// Firebaseの設定情報（Firebase Consoleから取得）
const firebaseConfig = {
    apiKey: "AIzaSyCze0ASsmhY_TPuJPxRZaFs1hvLRcG7Uqc",
    authDomain: "work-efeb4.firebaseapp.com",
    projectId: "work-efeb4",
    storageBucket: "work-efeb4.firebasestorage.app",
    messagingSenderId: "995650415978",
    appId: "1:995650415978:web:11cce65a1bb0324b5ec913"
};

// Firebaseの初期化
firebase.initializeApp(firebaseConfig);

// Firebase Authentication と Firestore のインスタンスを取得
const auth = firebase.auth();
const db = firebase.firestore();

// Google認証プロバイダーの設定
const googleProvider = new firebase.auth.GoogleAuthProvider();

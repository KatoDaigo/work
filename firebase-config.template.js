// Firebase設定ファイルのテンプレート
// このファイルをコピーして firebase-config.js という名前で保存し、
// Firebase Consoleから取得した実際の設定値で置き換えてください。

// Firebaseの設定情報（Firebase Consoleから取得）
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebaseの初期化
firebase.initializeApp(firebaseConfig);

// Firebase Authentication と Firestore のインスタンスを取得
const auth = firebase.auth();
const db = firebase.firestore();

// Google認証プロバイダーの設定
const googleProvider = new firebase.auth.GoogleAuthProvider();

# Firebase セットアップガイド

このアプリケーションは、複数の端末でデータを共有するためにGoogle FirebaseとGoogle認証を使用します。

## 必要な設定手順

### 1. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: kyuyo-keisan）
4. Google アナリティクスは必要に応じて設定（不要な場合はオフにできます）
5. 「プロジェクトを作成」をクリック

### 2. Webアプリの追加

1. プロジェクトのダッシュボードで、「</>」（Web）アイコンをクリック
2. アプリのニックネームを入力（例: 給与計算システム）
3. 「Firebase Hosting を設定する」のチェックは不要（後でも追加可能）
4. 「アプリを登録」をクリック
5. 表示される設定情報（firebaseConfig）をコピー

### 3. Google認証の有効化

1. Firebase Consoleの左メニューから「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブを開く
4. 「Google」を選択
5. 「有効にする」をオンにする
6. プロジェクトのサポートメールを選択
7. 「保存」をクリック

### 4. Firestoreデータベースの作成

1. Firebase Consoleの左メニューから「Firestore Database」を選択
2. 「データベースの作成」をクリック
3. ロケーションを選択（例: asia-northeast1 (東京)）
4. セキュリティルールは「本番環境モード」で開始（後で変更します）
5. 「作成」をクリック

### 5. Firestoreセキュリティルールの設定

1. Firestore Database画面で「ルール」タブを選択
2. 以下のルールを設定して「公開」をクリック：

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ユーザーは自分のデータのみ読み書き可能
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. アプリに設定を適用

1. `firebase-config.js` ファイルを開く
2. 手順2でコピーした設定情報で、以下の値を置き換える：
   - `YOUR_API_KEY` → `apiKey` の値
   - `YOUR_PROJECT_ID` → `projectId` の値（3箇所）
   - `YOUR_MESSAGING_SENDER_ID` → `messagingSenderId` の値
   - `YOUR_APP_ID` → `appId` の値

例：
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyAbc123...",
    authDomain: "kyuyo-keisan.firebaseapp.com",
    projectId: "kyuyo-keisan",
    storageBucket: "kyuyo-keisan.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abc123..."
};
```

3. ファイルを保存

## 使い方

1. アプリを開く（index.htmlをブラウザで開く）
2. 右上の「Googleでログイン」ボタンをクリック
3. Googleアカウントでログイン
4. データを入力すると、自動的にFirestoreに保存されます
5. 別の端末で同じGoogleアカウントでログインすると、同じデータが表示されます

## トラブルシューティング

### ログインできない場合
- Firebase Consoleで「Authentication」→「Sign-in method」→「Google」が有効になっているか確認
- ブラウザのポップアップブロックを無効にしてみる

### データが保存されない場合
- Firestoreのセキュリティルールが正しく設定されているか確認
- ブラウザのコンソールでエラーメッセージを確認

### 既存のlocalStorageデータの移行
現在localStorageに保存されているデータは、ログイン後、手動で再入力する必要があります。
（自動移行機能は実装されていません）

## 注意事項

- firebase-config.js には機密情報が含まれます。GitHubなどの公開リポジトリにプッシュする場合は、`.gitignore` に追加することをおすすめします
- 無料プランの制限:
  - 同時接続: 100
  - ストレージ: 1GB
  - 読み取り: 50,000/日
  - 書き込み: 20,000/日
  - 削除: 20,000/日

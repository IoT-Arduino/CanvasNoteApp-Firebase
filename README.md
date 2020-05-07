<h1 align="center">
  CanvasNoteApp<br />
  (Firebase Version)
</h1>

## 💫 DemoSiteのアドレス

アプリurl : [CanvasNoteApp-Firebase](https://canvasnoteapp.web.app/) &nbsp;(サインイン必要）
コード解説記事 : [FirebaseとVanillaJavaScript で手書きノートアプリを作成](https://myfrontend.netlify.app/canvasnoteapp-firebase-1)


## 💫 関連アプリケーションレポジトリ

[CanvasNoteApp-localStorage](https://github.com/IoT-Arduino/CanvasNoteApp-Localstorage) 



## 🧐 プログラム・フォルダ構成

Vanilla Javascript,HTML/CSSで実装。
バックエンドはFirebase(FirebaseAuth,Firestore,Firebase Hosting)を使用しています。

public/  
　├ scripts/index-bundle.js etc.. 
　├ styles/style.css  
　├ index.html  
　├ edit.html  
　└ 404.html  
src/  
　├ index.js  
　├ notes-function.js  
　├ edit.js  
　├ edit-canvas.js  
　└ firebase-init.js  
firestore.rules
webpack.config.js
  
1.  **`publicフォルダ`**: HTMLファイル、CSS、トランスパイルjsファイル。

2.  **`srcフォルダ`**: Javascriptファイル

3.  **`firestore.rules`**: Firestoreルール定義ファイル

4.  **`webpack.config.js`**: webpack定義ファイル


  

## References 

* [Firebase Authentication](https://firebase.google.com/docs/auth/web/start?hl=ja)
* [Cloud Firestore](https://firebase.google.com/docs/firestore?hl=ja)
* [Firebase Hosting](https://firebase.google.com/docs/hosting?hl=ja)



## 🚀 Deploy

Firebase HostingをつかってDeployしています。
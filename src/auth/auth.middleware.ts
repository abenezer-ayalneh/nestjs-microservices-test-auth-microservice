import { Injectable, NestMiddleware } from '@nestjs/common';
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5YutyJ0rFDNRL4aKJc7db2frbWLl5orE",
  authDomain: "nestjs-auth-microservice-test.firebaseapp.com",
  projectId: "nestjs-auth-microservice-test",
  storageBucket: "nestjs-auth-microservice-test.appspot.com",
  messagingSenderId: "551261789576",
  appId: "1:551261789576:web:512227183f002bc7a1ee3d",
  measurementId: "G-2VN24JFJXW"
};

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor() {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
  }
  
  use(req: any, res: any, next: () => void) {
    next();
  }
}

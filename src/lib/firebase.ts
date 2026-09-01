import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCph1r0B95j8eP8xyTnbTt5B7qyZ4t6B90",
  authDomain: "angular-principle-j78pp.firebaseapp.com",
  projectId: "angular-principle-j78pp",
  storageBucket: "angular-principle-j78pp.firebasestorage.app",
  messagingSenderId: "1072709461943",
  appId: "1:1072709461943:web:7980ff292e506398a7aa32"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-lainearquitetafi-b2e0500d-823c-4f48-857a-db631f5afa0f");

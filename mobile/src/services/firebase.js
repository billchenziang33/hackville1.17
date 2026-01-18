import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { FIREBASE_CONFIG } from '../config';

const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);

export const signUp = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const signIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logOut = async () => {
  await signOut(auth);
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const getIdToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export const signInWithToken = async (customToken) => {
  const userCredential = await signInWithCustomToken(auth, customToken);
  return userCredential.user;
};

export { auth };

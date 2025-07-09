import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export const authService = {
  // Register new user
  async register(email, password, name, role) {
    try {
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
        role: role,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });

      return { user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  },

  // Login existing user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login timestamp
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp()
      });

      return { user, error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  },

  // Logout user
  async logout() {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  },

  // Get user profile from Firestore
  async getUserProfile(uid) {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { profile: docSnap.data(), error: null };
      } else {
        return { profile: null, error: 'User profile not found' };
      }
    } catch (error) {
      return { profile: null, error: error.message };
    }
  },

  // Update user profile in Firestore
  async updateUserProfile(uid, profileData) {
    try {
      const docRef = doc(db, 'users', uid);
      
      // Update the document with new profile data
      await updateDoc(docRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      });

      // Get the updated profile
      const { profile } = await this.getUserProfile(uid);
      
      return { success: true, profile, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, profile: null, error: error.message };
    }
  }
};
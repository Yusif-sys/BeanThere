import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { 
  doc, 
  updateDoc, 
  getDoc, 
  setDoc 
} from 'firebase/firestore';
import { 
  updateProfile 
} from 'firebase/auth';
import { storage, firestore, auth } from './firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  bio?: string;
  location?: string;
  preferences?: {
    favoriteDrink?: string;
    preferredRoast?: string;
  };
  createdAt: any;
  updatedAt: any;
}

// Upload profile picture to Firebase Storage
export const uploadProfilePicture = async (file: File, userId: string): Promise<string> => {
  try {
    console.log('ProfileService: Starting upload for user:', userId);
    console.log('ProfileService: File details:', file.name, file.size, file.type);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB');
    }
    
    // Validate image dimensions
    const img = new Image();
    const validateImage = (): Promise<boolean> => {
      return new Promise((resolve, reject) => {
        img.onload = () => {
          console.log('ProfileService: Image validation - dimensions:', img.naturalWidth, 'x', img.naturalHeight);
          if (img.naturalWidth === 0 || img.naturalHeight === 0) {
            reject(new Error('Invalid image: zero dimensions'));
          } else if (img.naturalWidth < 50 || img.naturalHeight < 50) {
            reject(new Error('Image too small: minimum 50x50 pixels'));
          } else {
            resolve(true);
          }
        };
        img.onerror = () => {
          reject(new Error('Invalid image file'));
        };
        img.src = URL.createObjectURL(file);
      });
    };
    
    // Validate image before upload
    await validateImage();
    
    // Check if storage is available
    if (!storage) {
      throw new Error('Firebase Storage is not available. Please enable Storage in your Firebase Console.');
    }

    // Create a unique filename with .jpg extension for consistency
    const fileName = `profile-pictures/${userId}/${Date.now()}.jpg`;
    
    console.log('ProfileService: Creating storage reference for:', fileName);
    
    // Create storage reference
    const storageRef = ref(storage, fileName);
    
    console.log('ProfileService: Uploading file...');
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    
    console.log('ProfileService: Upload successful, getting download URL...');
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('ProfileService: Download URL obtained:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('ProfileService: Error uploading profile picture:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('storage')) {
        throw new Error('Storage service not available. Please enable Firebase Storage.');
      } else if (error.message.includes('permission')) {
        throw new Error('Permission denied. Please check Storage security rules.');
      } else if (error.message.includes('network')) {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    } else {
      throw new Error('Failed to upload profile picture');
    }
  }
};

// Delete old profile picture from storage
export const deleteProfilePicture = async (photoURL: string): Promise<void> => {
  try {
    if (!photoURL || photoURL.includes('googleusercontent.com')) {
      // Skip deletion for Google profile pictures
      return;
    }
    
    const storageRef = ref(storage, photoURL);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting old profile picture:', error);
    // Don't throw error as this is not critical
  }
};

// Update user profile in Firestore
export const updateUserProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    const userRef = doc(firestore, 'users', user.uid);
    
    await updateDoc(userRef, {
      ...profileData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update profile');
  }
};

// Get user profile from Firestore
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw new Error('Failed to get user profile');
  }
};

// Create or update user profile
export const createUserProfile = async (profileData: Partial<UserProfile>): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    const userRef = doc(firestore, 'users', user.uid);
    
    await setDoc(userRef, {
      uid: user.uid,
      displayName: profileData.displayName || user.displayName || '',
      email: profileData.email || user.email || '',
      photoURL: profileData.photoURL || user.photoURL || '',
      bio: profileData.bio || '',
      location: profileData.location || '',
      preferences: profileData.preferences || {},
      createdAt: new Date(),
      updatedAt: new Date()
    }, { merge: true });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
};

// Update Firebase Auth profile
export const updateAuthProfile = async (displayName?: string, photoURL?: string): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    await updateProfile(user, {
      displayName: displayName || user.displayName,
      photoURL: photoURL || user.photoURL
    });
  } catch (error) {
    console.error('Error updating auth profile:', error);
    throw new Error('Failed to update auth profile');
  }
}; 
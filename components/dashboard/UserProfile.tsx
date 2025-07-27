import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../../contexts/AuthContext';
import { 
  uploadProfilePicture, 
  deleteProfilePicture, 
  updateUserProfile, 
  updateAuthProfile,
  createUserProfile 
} from '../../lib/profileService';

export default function UserProfile() {
  const { user, signOutUser } = useAuthContext();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOutUser();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      console.log('Starting profile picture upload...');
      console.log('File:', file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('User ID:', user.uid);

      // Upload new profile picture
      const photoURL = await uploadProfilePicture(file, user.uid);
      console.log('Upload successful, photoURL:', photoURL);

      // Delete old profile picture if it exists and is not from Google
      if (user.photoURL && !user.photoURL.includes('googleusercontent.com')) {
        console.log('Deleting old profile picture...');
        await deleteProfilePicture(user.photoURL);
      }

      // Update Firebase Auth profile
      console.log('Updating Firebase Auth profile...');
      await updateAuthProfile(user.displayName || undefined, photoURL);

      // Update user profile in Firestore
      console.log('Updating Firestore profile...');
      await createUserProfile({
        photoURL: photoURL
      });

      console.log('Profile picture update complete!');
      
      // Don't reload the page - the user object should update automatically
      // The image will refresh when the user state updates
    } catch (error) {
      console.error('Error updating profile picture:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('storage')) {
          setUploadError('Storage error: Please enable Firebase Storage in your Firebase Console');
        } else if (error.message.includes('permission')) {
          setUploadError('Permission denied: Please check your Firebase Storage rules');
        } else if (error.message.includes('network')) {
          setUploadError('Network error: Please check your internet connection');
        } else {
          setUploadError(`Upload failed: ${error.message}`);
        }
      } else {
        setUploadError('Failed to update profile picture. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const userName = localStorage.getItem('userName') || user?.displayName || user?.email?.split('@')[0] || 'Coffee Lover';
  const userEmail = user?.email || 'No email available';
  const userAvatar = user?.photoURL || null;
  
  // Debug: Log the current user avatar URL
  console.log('Current user avatar URL:', userAvatar);
  console.log('Current user object:', user);
  
  // Test image accessibility
  useEffect(() => {
    if (userAvatar) {
      fetch(userAvatar)
        .then(response => {
          console.log('Image fetch response:', response.status, response.statusText);
          return response.blob();
        })
        .then(blob => {
          console.log('Image blob size:', blob.size, 'bytes');
          console.log('Image blob type:', blob.type);
        })
        .catch(error => {
          console.error('Image fetch error:', error);
        });
    }
  }, [userAvatar]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-shrink-0 relative group">
                    {userAvatar ? (
            <img
              className="h-16 w-16 rounded-full object-cover cursor-pointer transition-opacity hover:opacity-80"
              src={userAvatar}
              alt={userName}
              onClick={triggerFileInput}
            />
          ) : (
            <div 
              className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center cursor-pointer transition-opacity group-hover:opacity-80"
              onClick={triggerFileInput}
            >
              <span className="text-2xl text-amber-600 font-semibold">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          


          {/* Loading overlay */}
          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center z-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
          

        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold text-gray-900 truncate">{userName}</h2>
          <p className="text-sm text-gray-500 truncate">{userEmail}</p>
          <p className="text-xs text-gray-400 mt-1">
            Member since {user?.metadata?.creationTime ? 
              new Date(user.metadata.creationTime).toLocaleDateString() : 
              'Recently'
            }
          </p>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleProfilePictureChange}
        className="hidden"
      />

      {/* Upload error message */}
      {uploadError && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
          {uploadError}
        </div>
      )}

      {/* Profile picture upload button */}
      <div className="mb-4">
        <button
          onClick={triggerFileInput}
          disabled={isUploading}
          className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors font-medium"
        >
          {isUploading ? 'Uploading...' : 'Change Profile Picture'}
        </button>
        <p className="text-xs text-gray-500 mt-1 text-center">
          Click to upload a new profile picture (max 5MB)
        </p>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
        >
          {isSigningOut ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Signing out...</span>
            </div>
          ) : (
            'Sign Out'
          )}
        </button>
      </div>
    </div>
  );
} 
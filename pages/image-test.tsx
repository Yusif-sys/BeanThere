import { useState } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

export default function ImageTest() {
  const { user } = useAuthContext();
  const [imageUrl, setImageUrl] = useState('');

  const testImage = () => {
    if (user?.photoURL) {
      setImageUrl(user.photoURL);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Image Test</h1>
        
        <button 
          onClick={testImage}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Current Profile Image
        </button>

        {imageUrl && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Image URL: {imageUrl}</p>
            
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Profile Image (64x64):</h3>
              <img 
                src={imageUrl} 
                alt="Profile" 
                className="w-16 h-16 rounded-full object-cover border"
                onLoad={() => console.log('Image loaded successfully')}
                onError={(e) => console.error('Image failed to load:', e)}
              />
            </div>

            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Profile Image (200x200):</h3>
              <img 
                src={imageUrl} 
                alt="Profile" 
                className="w-50 h-50 rounded object-cover border"
                onLoad={() => console.log('Large image loaded successfully')}
                onError={(e) => console.error('Large image failed to load:', e)}
              />
            </div>

            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Raw Image (no styling):</h3>
              <img 
                src={imageUrl} 
                alt="Profile" 
                onLoad={() => console.log('Raw image loaded successfully')}
                onError={(e) => console.error('Raw image failed to load:', e)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
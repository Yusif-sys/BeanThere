import { useState } from 'react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function StorageTest() {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const testStorage = async () => {
    setIsUploading(true);
    setResult('');
    setError('');

    try {
      // Create a simple test file
      const testContent = 'This is a test file for Firebase Storage';
      const testFile = new File([testContent], 'test.txt', { type: 'text/plain' });

      console.log('Testing Firebase Storage...');
      console.log('Storage object:', storage);

      // Create a test reference
      const testRef = ref(storage, 'test/test-file.txt');
      console.log('Test reference created:', testRef);

      // Upload the test file
      console.log('Uploading test file...');
      const snapshot = await uploadBytes(testRef, testFile);
      console.log('Upload successful:', snapshot);

      // Get download URL
      console.log('Getting download URL...');
      const downloadURL = await getDownloadURL(testRef);
      console.log('Download URL:', downloadURL);

      setResult(`✅ Storage test successful! Download URL: ${downloadURL}`);
    } catch (error) {
      console.error('Storage test failed:', error);
      setError(`❌ Storage test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Firebase Storage Test</h1>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Firebase Storage</h2>
          
          <button
            onClick={testStorage}
            disabled={isUploading}
            className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors font-medium"
          >
            {isUploading ? 'Testing...' : 'Run Storage Test'}
          </button>

          {result && (
            <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
              <p className="text-green-800">{result}</p>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Troubleshooting Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Enable Firebase Storage in Firebase Console</li>
              <li>Deploy Storage security rules: <code className="bg-gray-200 px-1 rounded">firebase deploy --only storage</code></li>
              <li>Check browser console for detailed error messages</li>
              <li>Verify Firebase configuration in <code className="bg-gray-200 px-1 rounded">lib/firebase.ts</code></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
} 
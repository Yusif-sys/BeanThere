import { useEffect, useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';

export default function DebugPage() {
  const [testResults, setTestResults] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    const results: any = {};

    // Test 1: Environment Variables
    results.envVars = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Present' : '❌ Missing',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Present' : '❌ Missing',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Present' : '❌ Missing',
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Present' : '❌ Missing',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✅ Present' : '❌ Missing',
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ? '✅ Present' : '❌ Missing',
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ? '✅ Present' : '❌ Missing'
    };

    // Test 2: Firebase App Initialization
    try {
      results.firebaseApp = '✅ Initialized';
    } catch (err) {
      results.firebaseApp = `❌ Error: ${err}`;
    }

    // Test 3: Firebase Auth Initialization
    try {
      if (auth) {
        results.firebaseAuth = '✅ Initialized';
      } else {
        results.firebaseAuth = '❌ Not initialized';
      }
    } catch (err) {
      results.firebaseAuth = `❌ Error: ${err}`;
    }

    // Test 4: Google Provider
    try {
      if (googleProvider) {
        results.googleProvider = '✅ Initialized';
      } else {
        results.googleProvider = '❌ Not initialized';
      }
    } catch (err) {
      results.googleProvider = `❌ Error: ${err}`;
    }

    // Test 5: Network Connectivity
    try {
      // Test multiple endpoints to identify the issue
      const tests = [
        { name: 'Google APIs Discovery', url: 'https://www.googleapis.com/discovery/v1/apis/firebaseauth/v1/rest' },
        { name: 'Firebase Auth API', url: 'https://identitytoolkit.googleapis.com/v1/projects/beanthere-23cb8/accounts:signInWithPassword' },
        { name: 'Google OAuth', url: 'https://accounts.google.com/.well-known/openid_configuration' },
        { name: 'General Internet', url: 'https://www.google.com' }
      ];

      results.networkTests = {};
      
      for (const test of tests) {
        try {
          const response = await fetch(test.url, { 
            method: 'HEAD',
            mode: 'cors',
            cache: 'no-cache'
          });
          results.networkTests[test.name] = response.ok ? '✅ Connected' : `❌ HTTP ${response.status}`;
        } catch (err: any) {
          results.networkTests[test.name] = `❌ ${err.message}`;
        }
      }

      // Overall network status
      const successfulTests = Object.values(results.networkTests).filter((test: any) => String(test).includes('✅')).length;
      results.networkConnectivity = successfulTests > 0 ? '✅ Partial connectivity' : '❌ No connectivity';
      
    } catch (err) {
      results.networkConnectivity = `❌ Error: ${err}`;
      results.networkTests = { 'Error': `❌ ${err}` };
    }

    // Test 6: API Key Format
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (apiKey) {
      results.apiKeyFormat = apiKey.startsWith('AIza') ? '✅ Valid format' : '❌ Invalid format';
      results.apiKeyLength = apiKey.length === 39 ? '✅ Correct length' : `❌ Wrong length (${apiKey.length})`;
    } else {
      results.apiKeyFormat = '❌ No API key';
      results.apiKeyLength = '❌ No API key';
    }

    setTestResults(results);
    setLoading(false);
  };

  const testSignIn = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      setError(`✅ Sign-in successful! User: ${result.user.email}`);
    } catch (err: any) {
      setError(`❌ Sign-in failed: ${err.message}`);
      console.error('Sign-in error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Running Firebase tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Firebase Debug Test</h1>
        
        {/* Environment Variables Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. Environment Variables</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(testResults.envVars || {}).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-mono text-sm">{key}:</span>
                <span className={String(value).includes('✅') ? 'text-green-600' : 'text-red-600'}>
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Firebase Initialization Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">2. Firebase Initialization</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>Firebase App:</span>
              <span className={testResults.firebaseApp?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {testResults.firebaseApp}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>Firebase Auth:</span>
              <span className={testResults.firebaseAuth?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {testResults.firebaseAuth}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>Google Provider:</span>
              <span className={testResults.googleProvider?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {testResults.googleProvider}
              </span>
            </div>
          </div>
        </div>

        {/* API Key Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">3. API Key Validation</h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>API Key Format:</span>
              <span className={testResults.apiKeyFormat?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {testResults.apiKeyFormat}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>API Key Length:</span>
              <span className={testResults.apiKeyLength?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {testResults.apiKeyLength}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <span>Network Connectivity:</span>
              <span className={testResults.networkConnectivity?.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {testResults.networkConnectivity}
              </span>
            </div>
          </div>
          
          {/* Detailed Network Tests */}
          {testResults.networkTests && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Detailed Network Tests:</h3>
              <div className="space-y-1">
                {Object.entries(testResults.networkTests).map(([name, status]) => (
                  <div key={name} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <span>{name}:</span>
                    <span className={String(status).includes('✅') ? 'text-green-600' : 'text-red-600'}>
                      {String(status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sign-in Test */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">4. Sign-in Test</h2>
          <button
            onClick={testSignIn}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Test Google Sign-in
          </button>
          {error && (
            <div className={`mt-4 p-3 rounded ${error.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {error}
            </div>
          )}
        </div>

        {/* Raw Config Display */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">5. Raw Configuration</h2>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
            <pre>{JSON.stringify({
              apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
              authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
              projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
              storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
              messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
              appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.substring(0, 20) + '...',
              measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
            }, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
} 
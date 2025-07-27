import { useState } from 'react';

export default function NetworkTest() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const runNetworkTest = async () => {
    setLoading(true);
    const testResults: any = {};

    // Test basic fetch
    try {
      const response = await fetch('https://httpbin.org/get');
      testResults.basicFetch = response.ok ? '✅ Success' : `❌ HTTP ${response.status}`;
    } catch (error: any) {
      testResults.basicFetch = `❌ ${error.message}`;
    }

    // Test Google
    try {
      const response = await fetch('https://www.google.com', { method: 'HEAD' });
      testResults.google = response.ok ? '✅ Success' : `❌ HTTP ${response.status}`;
    } catch (error: any) {
      testResults.google = `❌ ${error.message}`;
    }

    // Test Firebase
    try {
      const response = await fetch('https://identitytoolkit.googleapis.com/v1/projects/beanthere-23cb8/accounts:signInWithPassword', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      testResults.firebase = response.status === 400 ? '✅ Connected (expected auth error)' : `❌ HTTP ${response.status}`;
    } catch (error: any) {
      testResults.firebase = `❌ ${error.message}`;
    }

    // Test with XMLHttpRequest (alternative to fetch)
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://httpbin.org/get', false);
      xhr.send();
      testResults.xmlHttpRequest = xhr.status === 200 ? '✅ Success' : `❌ HTTP ${xhr.status}`;
    } catch (error: any) {
      testResults.xmlHttpRequest = `❌ ${error.message}`;
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Network Connectivity Test</h1>
        
        <button
          onClick={runNetworkTest}
          disabled={loading}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 mb-6"
        >
          {loading ? 'Testing...' : 'Run Network Test'}
        </button>

        {Object.keys(results).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
            <div className="space-y-2">
              {Object.entries(results).map(([test, result]) => (
                <div key={test} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium">{test}:</span>
                  <span className={String(result).includes('✅') ? 'text-green-600' : 'text-red-600'}>
                    {String(result)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Troubleshooting Steps:</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• Try connecting to a different network (mobile hotspot)</li>
            <li>• Temporarily disable Windows Firewall</li>
            <li>• Check if you're behind a corporate proxy</li>
            <li>• Try a different browser</li>
            <li>• Restart your development server</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 
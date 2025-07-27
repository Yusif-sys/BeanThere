import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '../contexts/AuthContext';

export default function SignIn() {
  const router = useRouter();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, signOutUser, user } = useAuthContext();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignOut = async () => {
    const result = await signOutUser();
    if (result.success) {
      // Clear user data from localStorage
      localStorage.removeItem('userName');
      localStorage.removeItem('userUID');
      localStorage.removeItem('userEmail');
      // Reload the page to reset state
      window.location.reload();
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    // Check if Firebase is properly configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_api_key_here') {
      setError('Firebase is not configured. Please set up your Firebase project and add the configuration to .env.local');
      setLoading(false);
      return;
    }
    
    const result = await signInWithGoogle();
    
    if (result.success) {
      // Check if this is a new user (first time signing in)
      const isNewUser = result.user?.metadata?.creationTime === result.user?.metadata?.lastSignInTime;
      
      if (isNewUser) {
        // For Google sign-in, we can get the name from the user object
        const displayName = result.user?.displayName;
        if (displayName) {
          localStorage.setItem('userName', displayName);
        }
      }
      router.push('/explore');
    } else {
      setError(result.error || 'An error occurred');
    }
    
    setLoading(false);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check if Firebase is properly configured
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'your_api_key_here') {
      setError('Firebase is not configured. Please set up your Firebase project and add the configuration to .env.local');
      setLoading(false);
      return;
    }

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // For sign-up, require name
    if (isSignUp && !name.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    const result = isSignUp 
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);

    if (result.success) {
      if (isSignUp && name.trim()) {
        // Store the name for new users
        localStorage.setItem('userName', name.trim());
        alert(`Welcome ${name.trim()}! 🎉`);
      }
      router.push('/explore');
    } else {
      setError(result.error || 'An error occurred');
    }

    setLoading(false);
  };

  // Check if Firebase is configured
  const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== 'your_api_key_here';

  // If user is already signed in, show a different view
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">BeanThere</h1>
              <p className="text-gray-600">You're already signed in!</p>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="text-center">
                <div className="text-2xl mb-2">👋</div>
                <h2 className="text-lg font-semibold text-green-800 mb-2">
                  Welcome back, {localStorage.getItem('userName') || user.email?.split('@')[0] || user.email}!
                </h2>
                <p className="text-green-700 text-sm">You're all set to explore coffee shops.</p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/explore')}
                className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors font-medium"
              >
                Go to Explore
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Back to Home
              </button>
              
              <button
                onClick={handleSignOut}
                className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">BeanThere</h1>
              <p className="text-gray-600">Firebase Authentication Setup Required</p>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-yellow-800 mb-4">🚀 Setup Instructions</h2>
              <div className="text-sm text-yellow-700 space-y-3">
                <p><strong>1.</strong> Create a Firebase project at <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Firebase Console</a></p>
                <p><strong>2.</strong> Enable Authentication → Sign-in method → Google & Email/Password</p>
                <p><strong>3.</strong> Go to Project Settings → Add app → Web</p>
                <p><strong>4.</strong> Copy the configuration values</p>
                <p><strong>5.</strong> Create a <code className="bg-yellow-100 px-2 py-1 rounded">.env.local</code> file in the root directory with:</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="text-xs text-gray-700 space-y-1">
                <div># Firebase Configuration</div>
                <div>NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key</div>
                <div>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com</div>
                <div>NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id</div>
                <div>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com</div>
                <div>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id</div>
                <div>NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id</div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Reload After Setup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">BeanThere</h1>
            <p className="text-gray-600">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full mb-6 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black mb-1">Name</label>
                <input
                  type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                  placeholder="Enter your name" required={isSignUp}
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black mb-1">Email</label>
              <input
                type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                placeholder="Enter your email" required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black mb-1">Password</label>
              <input
                type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-black"
                placeholder="Enter your password" required
              />
            </div>
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors font-medium"
            >
              {loading ? 'Signing in...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          {/* Toggle Sign In/Sign Up */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setName(''); // Clear name when switching modes
                }}
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
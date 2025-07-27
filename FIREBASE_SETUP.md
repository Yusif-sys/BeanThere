# Firebase Authentication Setup

## Prerequisites
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication in your Firebase project
3. Enable Google Sign-in and Email/Password authentication methods

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Maps API Key (if you're using Google Maps)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## Firebase Project Setup Steps

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"
   - Enter project name and follow setup wizard

2. **Enable Authentication**
   - In Firebase Console, go to "Authentication" → "Sign-in method"
   - Enable "Google" provider
   - Enable "Email/Password" provider

3. **Get Configuration**
   - Go to Project Settings (gear icon)
   - Scroll down to "Your apps" section
   - Click "Add app" → "Web"
   - Register app and copy configuration values

4. **Configure Google Sign-in**
   - In Authentication → Sign-in method → Google
   - Add your domain to authorized domains
   - For development, add `localhost` to authorized domains

## Features Implemented

- ✅ Google Sign-in with popup
- ✅ Email/Password authentication
- ✅ Automatic account creation for new users
- ✅ User UID storage in localStorage
- ✅ Automatic redirect to /explore after sign-in
- ✅ Sign-out functionality
- ✅ User state management across the app
- ✅ Protected routes (can be extended)

## Usage

1. Users can sign in with Google or email/password
2. New users automatically get accounts created
3. User UID is stored in localStorage for persistence
4. After sign-in, users are redirected to the explore page
5. Sign-out button available on the explore page

## Security Notes

- All Firebase configuration is client-side (using NEXT_PUBLIC_ prefix)
- Firebase handles authentication security
- User UID is stored in localStorage for session management
- Consider implementing server-side authentication checks for sensitive operations 
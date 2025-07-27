# Firestore Setup Instructions

## 1. Enable Firestore in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`beanthere-23cb8`)
3. In the left sidebar, click on "Firestore Database"
4. Click "Create database"
5. Choose "Start in test mode" (we'll add security rules later)
6. Select a location (choose the closest to your users)
7. Click "Done"

## 2. Deploy Security Rules

1. Install Firebase CLI if you haven't already:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in your project:
   ```bash
   cd coffeefinder
   firebase init firestore
   ```

4. Deploy the security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```

## 3. Test the Review System

Once Firestore is set up:

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Sign in to your app
3. Go to any coffee shop and click "Write Review"
4. Submit a review with a rating and comment
5. The review should now be visible to all users!

## 4. Security Rules Explanation

The security rules in `firestore.rules` ensure:

- ✅ **Anyone can read reviews** (public visibility)
- ✅ **Only authenticated users can create reviews**
- ✅ **Users can only edit/delete their own reviews**
- ✅ **Reviews must have valid data** (rating 1-5, non-empty text, etc.)

## 5. Troubleshooting

If you encounter issues:

1. **Check Firebase Console** - Make sure Firestore is enabled
2. **Check Network Tab** - Look for Firestore API calls
3. **Check Console** - Look for any error messages
4. **Verify Rules** - Make sure security rules are deployed

## 6. Features Now Available

- 🌟 **Public Reviews** - All users can see all reviews
- ⭐ **Star Ratings** - 1-5 star rating system
- 📝 **Review Text** - Users can write detailed reviews
- ✏️ **Edit Reviews** - Users can edit their own reviews
- 🗑️ **Delete Reviews** - Users can delete their own reviews
- 📊 **Average Ratings** - Automatic calculation of cafe ratings
- 👤 **User Names** - Reviews show who wrote them
- 📅 **Timestamps** - Reviews show when they were written 
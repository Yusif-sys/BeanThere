# Account Dashboard Feature

## Overview

The Account Dashboard is a comprehensive user profile system that displays user information, reviews, favorites, and taste analytics. It's built with Next.js, TypeScript, Tailwind CSS, and Firebase.

## Features

### 🏠 **Main Dashboard Page** (`/account`)
- **Authentication Check**: Redirects to signin if not authenticated
- **Responsive Layout**: 3-column grid on desktop, stacked on mobile
- **Loading States**: Smooth loading animations
- **Error Handling**: Graceful error display

### 👤 **UserProfile Component**
- **User Info**: Name, email, avatar (if available)
- **Profile Picture Upload**: Click to change profile picture
- **Image Validation**: File type and size validation (max 5MB)
- **Member Since**: Account creation date
- **Sign Out**: Secure logout with redirect
- **Avatar Fallback**: Initial letter in styled circle
- **Hover Effects**: Visual feedback for upload interaction

### 📝 **ReviewList Component**
- **User Reviews**: All reviews written by the user
- **Rating Display**: Star ratings with visual indicators
- **Date Formatting**: Human-readable dates
- **Sorting**: Newest reviews first
- **Empty State**: Encouraging message for new users

### ❤️ **FavoriteCafes Component**
- **Saved Cafes**: List of user's favorite coffee shops
- **Add/Remove**: Manage favorites (remove functionality included)
- **Date Tracking**: When each cafe was added
- **Empty State**: Guide for new users

### 📊 **TasteProfile Component**
- **Analytics**: Total reviews, average rating
- **Rating Distribution**: Visual breakdown of ratings
- **Favorite Tags**: Most common preferences
- **Recent Activity**: Time since last review
- **Visual Charts**: Progress bars and statistics

## Technical Implementation

### **Firebase Integration**
- **Authentication**: Uses existing Firebase Auth
- **Firestore**: Reviews, favorites, and users collections
- **Storage**: Profile picture uploads
- **Security Rules**: User-specific data access
- **Real-time Updates**: Automatic data refresh

### **Data Structure**

#### Reviews Collection
```typescript
interface Review {
  id?: string;
  cafeId: string;
  cafeName: string;
  userId: string;
  userName: string;
  rating: number;
  review: string;
  createdAt: any;
}
```

#### Favorites Collection
```typescript
interface FavoriteCafe {
  id?: string;
  userId: string;
  cafeId: string;
  cafeName: string;
  cafeAddress: string;
  addedAt: any;
}
```

#### Users Collection
```typescript
interface UserProfile {
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
```

### **Component Architecture**
```
AccountDashboard (pages/account.tsx)
├── UserProfile (components/dashboard/UserProfile.tsx)
├── ReviewList (components/dashboard/ReviewList.tsx)
├── FavoriteCafes (components/dashboard/FavoriteCafes.tsx)
└── TasteProfile (components/dashboard/TasteProfile.tsx)
```

## Setup Instructions

### 1. **Enable Firebase Services**
- **Firestore**: Follow the existing `FIRESTORE_SETUP.md` instructions
- **Storage**: Enable Firebase Storage in Firebase Console

### 2. **Deploy Security Rules**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

### 3. **Create Required Indexes**
Firestore will prompt you to create indexes for:
- `reviews` collection: `createdAt` (descending)
- `favorites` collection: `userId` (ascending)

### 4. **Access the Dashboard**
- Sign in to your account
- Click "My Account" in the navigation
- Or navigate directly to `/account`

## Profile Picture Feature

### **How It Works**
1. **Click to Upload**: Click on profile picture or "Change Profile Picture" button
2. **File Selection**: Choose an image file (JPG, PNG, GIF, etc.)
3. **Validation**: File type and size validation (max 5MB)
4. **Upload**: Image uploaded to Firebase Storage
5. **Update**: Profile updated in Firebase Auth and Firestore
6. **Cleanup**: Old profile picture deleted from storage

### **Features**
- ✅ **Drag & Drop**: Click anywhere on profile picture
- ✅ **File Validation**: Image files only, max 5MB
- ✅ **Loading States**: Upload progress indicator
- ✅ **Error Handling**: Clear error messages
- ✅ **Automatic Cleanup**: Old pictures deleted
- ✅ **Google Integration**: Preserves Google profile pictures

### **Storage Structure**
```
profile-pictures/
├── user1/
│   ├── 1234567890.jpg
│   └── 1234567891.png
└── user2/
    └── 1234567892.jpg
```

## Usage

### **For Users**
1. **View Profile**: See your account information
2. **Upload Picture**: Click profile picture to change it
3. **Browse Reviews**: View all your written reviews
4. **Manage Favorites**: Add/remove favorite cafes
5. **Analyze Taste**: See your coffee preferences
6. **Sign Out**: Secure logout

### **For Developers**
1. **Add Favorites**: Use the favorites collection
2. **Extend Analytics**: Add more taste profile metrics
3. **Customize UI**: Modify Tailwind classes
4. **Add Features**: Extend component functionality

## Security

### **Firestore Rules**
- ✅ **Reviews**: Public read, user-specific write
- ✅ **Favorites**: User-specific read/write
- ✅ **Users**: User-specific read/write
- ✅ **Data Validation**: Required fields and types
- ✅ **Authentication**: All operations require auth

### **Storage Rules**
- ✅ **Profile Pictures**: User-specific upload/delete
- ✅ **File Validation**: Image files only, size limits
- ✅ **Public Read**: Profile pictures publicly accessible
- ✅ **Authentication**: Upload/delete requires auth

### **Client-Side Security**
- ✅ **Route Protection**: Redirects unauthenticated users
- ✅ **Data Filtering**: Only user's own data
- ✅ **Error Handling**: Graceful failure states
- ✅ **File Validation**: Client-side file checks

## Styling

### **Design System**
- **Colors**: Amber theme with gray accents
- **Typography**: Consistent font weights and sizes
- **Spacing**: Tailwind spacing scale
- **Components**: Reusable card layouts

### **Responsive Design**
- **Desktop**: 3-column grid layout
- **Tablet**: 2-column layout
- **Mobile**: Single column, stacked

## Future Enhancements

### **Planned Features**
- [x] **Profile Picture Upload**: ✅ Implemented
- [ ] **Profile Editing**: Update name and bio
- [ ] **Review Analytics**: More detailed insights
- [ ] **Favorite Sharing**: Share favorite cafes
- [ ] **Export Data**: Download review history
- [ ] **Notifications**: Review reminders

### **Technical Improvements**
- [ ] **Caching**: Optimize Firestore queries
- [ ] **Pagination**: Handle large datasets
- [ ] **Real-time**: Live updates for new reviews
- [ ] **Offline**: Service worker support
- [ ] **Image Optimization**: Automatic resizing and compression

## Troubleshooting

### **Common Issues**
1. **"Firestore not available"**: Enable Firestore in Firebase Console
2. **"Storage not available"**: Enable Firebase Storage in Firebase Console
3. **"Permission denied"**: Deploy updated security rules
4. **"Missing index"**: Create required Firestore indexes
5. **"Upload failed"**: Check file size and type
6. **"Loading forever"**: Check network connectivity

### **Debug Steps**
1. Check browser console for errors
2. Verify Firebase configuration
3. Test authentication state
4. Validate Firestore rules
5. Check Storage rules
6. Verify file upload permissions

## Contributing

When adding new features:
1. Follow the existing component structure
2. Use TypeScript interfaces
3. Add proper error handling
4. Include loading states
5. Update security rules
6. Test on multiple devices
7. Validate file uploads 
# Groop - Social Platform

Groop social posting platform built with React, Firebase, and Node.js. It features user authentication, post creation and management, admin controls, and more.

## Features

### User Features

- **Authentication**: Secure login and registration with Firebase Auth
- **Post Management**: Create, edit, and delete your own posts
- **Profile Management**: Update profile information and upload profile pictures
- **Social Interaction**: Like posts and view post details
- **Responsive Design**: Works on desktop and mobile devices

### Admin Features

- **User Management**: View and manage user roles (promote to admin or demote to regular user)
- **Post Management**: Pin important posts to the top, delete any post
- **Content Moderation**: Admins can edit or remove inappropriate content

## Demo Users

Use these credentials to test the application:

### Admin User

- **Email**: admin@groop.com
- **Password**: admin123

### Regular User

- **Email**: user@groop.com
- **Password**: user123

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Firebase account

### Environment Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/groop.git
   cd groop
   ```

2. **Install dependencies for both client and server**

   ```bash
   # Install server dependencies
   npm install

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Configure environment variables**

   Create a `.env` file in the client directory with the following Firebase configuration:

   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_API_URL=http://localhost:5000/api
   ```

   Create a `.env` file in the root directory for the server:

   ```
   PORT=5000
   NODE_ENV=development
   ```

   Create a `serviceAccountKey.json` file in the root directory with your Firebase Admin SDK credentials.

4. **Start the Application**

   You can start both the server and client with:

   ```bash
   # Start the server
   npm run dev

   # In a new terminal, start the client
   cd client
   npm start
   ```

   The application will be available at `http://localhost:3000`

## Firebase Configuration

### Firebase Rules

#### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId ||
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow delete: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // Posts
    match /posts/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.authorId ||
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow delete: if request.auth.uid == resource.data.authorId ||
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

#### Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-images/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    match /post-images/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId ||
                    firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Project Structure

```
groop/
├── client/                 # React frontend
│   ├── public/             # Public assets
│   └── src/
│       ├── components/     # Reusable components
│       │   └── layout/     # Layout components
│       ├── pages/          # Page components
│       ├── services/       # API services
│       ├── store/          # State management
│       └── types/          # TypeScript types
│
└── server/                 # Node.js backend
    ├── middleware/         # Express middleware
    ├── routes/             # API routes
    └── uploads/            # Temporary file uploads
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
- `GET /api/users/profile` - Get current user profile

### Posts

- `GET /api/posts` - Get all posts (with pagination)
- `GET /api/posts/:id` - Get a specific post
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post
- `POST /api/posts/:id/like` - Like/unlike a post
- `PATCH /api/posts/:id/pin` - Pin/unpin a post (admin only)

### Users

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/profile/image` - Upload profile image

### Admin

- `GET /api/admin/users` - Get all users (admin only)
- `PATCH /api/admin/users/:id/role` - Update user role (admin only)

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Storage**: Firebase Storage
- **Deployment**: Firebase Hosting (frontend), Heroku/Vercel (backend)

## Configuration Security

### Sharing Configuration Securely

To share configuration with team members:

1. **Create configuration files**:
   - Create the actual `.env` files with real values
   - Export your Firebase service account key as `serviceAccountKey.json`

2. **Share securely** using one of these methods:
   - Password-protected zip file
   - Secure file sharing service (Google Drive with restricted access)
   - Password manager's secure notes feature

3. **Never commit sensitive files** to the repository

### Repository Setup

1. **Use example templates**:
   - The repository includes `.env.example` files showing required variables
   - Copy these to create your own `.env` files with actual values

2. **Required configuration files**:
   - `client/.env` - Frontend Firebase configuration
   - `.env` - Server configuration
   - `serviceAccountKey.json` - Firebase Admin SDK credentials

3. **Obtaining Firebase credentials**:
   - Firebase Console → Project Settings → General → Your Apps → SDK setup and configuration
   - For the service account key: Firebase Console → Project Settings → Service accounts → Generate new private key

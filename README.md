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
   git clone https://github.com/cristian081496/groop-v1.git
   cd groop-v1
   ```

2. **Install dependencies for both client and server**

   ```bash
   # Install server dependencies
   cd server
   npm install
   cd ..

   # Install client dependencies
   cd client
   npm install
   cd ..
   ```

3. **Configure environment variables**

   Create a `.env` file in the client directory with the following Firebase configuration:

   # Client Configuration (check the email for the .env file)

   ```
   VITE_FIREBASE_API_KEY=xxx
   VITE_FIREBASE_AUTH_DOMAIN=xxx
   VITE_FIREBASE_PROJECT_ID=xxx
   VITE_BACKEND_URL=xxx
   VITE_BACKEND_DEV=true

   ```

   Create a `.env` file in the root directory for the server:

   # Backend Configuration (check the email for the .env file)

   ```
   # Server configuration
   PORT=5001
   NODE_ENV=development

   # NODE_ENV=production
   # CLIENT_URL=https://api.groop.com (use this for prod only)
   STORAGE_BUCKET=xxx
   ```

   Create a `serviceAccountKey.json` file in the root directory with your Firebase Admin SDK credentials.

4. **Start the Application**

   You can start both the server and client with:

   ```bash
   # Start the server
   cd server
   npm run start

   # In a new terminal, start the client
   cd client
   npm run dev
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

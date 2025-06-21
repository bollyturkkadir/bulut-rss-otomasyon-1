import * as admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors during hot-reloads
if (!admin.apps.length) {
  try {
    // Ensure environment variables are present before trying to initialize
    if (
        !process.env.FIREBASE_PROJECT_ID ||
        !process.env.FIREBASE_CLIENT_EMAIL ||
        !process.env.FIREBASE_PRIVATE_KEY
    ) {
        throw new Error('Firebase Admin environment variables are not set.');
    }
      
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // This replaces the literal characters \\n with actual newlines, crucial for Vercel
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK initialized successfully.');

  } catch (error) {
    console.error('Firebase Admin SDK initialization error:', error);
  }
}

// Export the initialized firestore and auth instances
const db = admin.firestore();
const auth = admin.auth();

export { db, auth };

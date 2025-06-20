import * as admin from 'firebase-admin';

// Gerekli ortam değişkenlerinin varlığını kontrol et
if (
  !process.env.FIREBASE_PROJECT_ID ||
  !process.env.FIREBASE_CLIENT_EMAIL ||
  !process.env.FIREBASE_PRIVATE_KEY
) {
  // Eğer değişkenlerden biri bile eksikse, anlamlı bir hata vererek işlemi durdur.
  throw new Error('Firebase Admin environment variables are not set.');
}

try {
  // Eğer Firebase uygulaması zaten başlatılmamışsa başlat
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // .replace() fonksiyonu artık güvenli çünkü değişkenin varlığını yukarıda kontrol ettik.
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }
} catch (error) {
  console.error('Firebase admin initialization error', error);
}

// vercel-build sırasında "db" dışarıya aktarıldığında hata verebiliyor, bu yüzden doğrudan "firestore()" olarak export ediyoruz.
const db = admin.firestore();
const auth = admin.auth();

export { db, auth };

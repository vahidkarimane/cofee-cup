import {initializeApp, getApps, cert} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import {getStorage} from 'firebase-admin/storage';
import {getAuth} from 'firebase-admin/auth';

// Parse the Firebase Admin private key
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
	? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
	: undefined;

// Firebase Admin configuration
const firebaseAdminConfig = {
	credential: cert({
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
		privateKey,
	}),
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

// Initialize Firebase Admin
function getFirebaseAdmin() {
	if (!getApps().length) {
		return initializeApp(firebaseAdminConfig);
	}
	return getApps()[0];
}

// Initialize Firebase Admin services
const adminApp = getFirebaseAdmin();
const adminDb = getFirestore(adminApp);
const adminStorage = getStorage(adminApp);
const adminAuth = getAuth(adminApp);

export {adminApp, adminDb, adminStorage, adminAuth};

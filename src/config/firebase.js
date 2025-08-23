// src/config/firebase.js
import admin from "firebase-admin";

export const setupFirebase = () => {
  const serviceAccountBase64 = process.env.FIREBASE_CREDENTIALS_KEY;

  if (!serviceAccountBase64) {
    console.warn("[firebase] FIREBASE_CREDENTIALS_KEY not found → skip init");
    return {
      enabled: false,
      auth: {
        async verifyIdToken() {
          throw new Error("FIREBASE_DISABLED");
        },
      },
    };
  }

  try {
    const decodedServiceAccount = Buffer.from(
      serviceAccountBase64,
      "base64"
    ).toString("utf-8");
    const serviceAccount = JSON.parse(decodedServiceAccount);

    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("[firebase] initialized");
    return {
      enabled: true,
      app,
      auth: admin.auth(),
    };
  } catch (e) {
    console.error("[firebase] init failed:", e.message);
    return {
      enabled: false,
      auth: {
        async verifyIdToken() {
          throw new Error("FIREBASE_INIT_FAILED");
        },
      },
    };
  }
};
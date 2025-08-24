// // src/config/firebase.js
// import admin from "firebase-admin";

// export const setupFirebase = () => {
//   const serviceAccountBase64 = process.env.FIREBASE_CREDENTIALS_KEY;

//   if (!serviceAccountBase64) {
//     console.warn("[firebase] FIREBASE_CREDENTIALS_KEY not found → skip init");
//     return {
//       enabled: false,
//       auth: {
//         async verifyIdToken() {
//           throw new Error("FIREBASE_DISABLED");
//         },
//       },
//     };
//   }

//   try {
//     const decodedServiceAccount = Buffer.from(
//       serviceAccountBase64,
//       "base64"
//     ).toString("utf-8");
//     const serviceAccount = JSON.parse(decodedServiceAccount);

//     const app = admin.initializeApp({
//       credential: admin.credential.cert(serviceAccount),
//     });

//     console.log("[firebase] initialized");
//     return {
//       enabled: true,
//       app,
//       auth: admin.auth(),
//     };
//   } catch (e) {
//     console.error("[firebase] init failed:", e.message);
//     return {
//       enabled: false,
//       auth: {
//         async verifyIdToken() {
//           throw new Error("FIREBASE_INIT_FAILED");
//         },
//       },
//     };
//   }
// };
// src/config/firebase.js
// Import the functions you need from the SDKs you need
// src/config/firebase.js
import admin from "firebase-admin";

let _app = null;

/**
 * Firebase Admin 초기화
 * - .env 에 반드시 다음 중 하나가 있어야 함
 *   1) FIREBASE_CREDENTIALS_KEY : 서비스 계정 JSON을 base64 인코딩한 문자열
 *   2) FIREBASE_CREDENTIALS_JSON : 서비스 계정 JSON을 문자열 그대로 (private_key 는 \n 으로 처리)
 *   3) GOOGLE_APPLICATION_CREDENTIALS : 서비스 계정 JSON 파일 경로
 */
export function setupFirebase() {
  try {
    if (_app) return _app; // 이미 초기화된 경우 재사용

    const b64 = process.env.FIREBASE_CREDENTIALS_KEY;
    const raw = process.env.FIREBASE_CREDENTIALS_JSON;
    const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    if (b64) {
      // base64 → JSON
      const json = Buffer.from(b64, "base64").toString("utf8");
      const creds = JSON.parse(json);
      _app = admin.initializeApp({ credential: admin.credential.cert(creds) });
      console.log("[firebase] initialized via FIREBASE_CREDENTIALS_KEY");
      return _app;
    }

    if (raw) {
      // JSON 문자열 직접 사용
      const creds = JSON.parse(raw);
      _app = admin.initializeApp({ credential: admin.credential.cert(creds) });
      console.log("[firebase] initialized via FIREBASE_CREDENTIALS_JSON");
      return _app;
    }

    if (gac) {
      // 파일 경로 사용 (Admin SDK가 알아서 읽음)
      _app = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log("[firebase] initialized via GOOGLE_APPLICATION_CREDENTIALS");
      return _app;
    }

    console.log("[firebase] no credentials provided → skip init");
    return null;
  } catch (e) {
    console.error("[firebase] init failed:", e.message);
    throw e;
  }
}

/** Firebase Auth 핸들러 */
export function getFirebaseAuth() {
  if (!_app) throw new Error("Firebase not initialized");
  return admin.auth(_app);
}
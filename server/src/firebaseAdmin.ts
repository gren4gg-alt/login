import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import "dotenv/config";

// Local dev: reads server/firebase-service-account.json directly (gitignored).
// Production (Vercel): reads the FIREBASE_SERVICE_ACCOUNT env var instead,
// since Vercel can't access a file that isn't committed to the repo.
let firebaseAuth: Auth | null = null;

function loadServiceAccount(): object | null {
  const localPath = join(process.cwd(), "firebase-service-account.json");
  if (existsSync(localPath)) {
    return JSON.parse(readFileSync(localPath, "utf-8"));
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }
  return null;
}

try {
  const serviceAccount = loadServiceAccount();
  if (serviceAccount) {
    if (getApps().length === 0) {
      initializeApp({ credential: cert(serviceAccount as any) });
    }
    firebaseAuth = getAuth();
  } else {
    console.warn(
      "No Firebase service account found — Google sign-in will be unavailable until it's configured."
    );
  }
} catch (err) {
  console.error("Failed to initialize Firebase Admin:", err);
}

export { firebaseAuth };

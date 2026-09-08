import admin from "firebase-admin";

export function getDetectiveApp(): admin.app.App {
    const existing = admin.apps.find((app) => app?.name === "detective");
    if (existing) return existing;

    return admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.DETECTIVE_FIREBASE_PROJECT_ID,
            clientEmail: process.env.DETECTIVE_FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.DETECTIVE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    }, "detective");
}

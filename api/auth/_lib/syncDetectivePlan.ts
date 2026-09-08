import admin from "firebase-admin";

// Espelha o estado de plano do quemsoueu (users/{uid}) no doc
// users/{detectiveUid} do projeto do criminal-minds. Escreve `plan`/
// `planExpiresAt` crus (sem calcular "está ativo" aqui) — quem decide se o
// plano está válido é a regra do Firestore do criminal-minds, no momento do
// uso, igual o isPlanActive() do próprio quemsoueu faz. Isso é só o cache.
export async function syncDetectiveUserPlan(
    detectiveApp: admin.app.App,
    detectiveUid: string,
    plan: string | undefined,
    planExpiresAt: string | null | undefined,
) {
    await admin.firestore(detectiveApp).collection('users').doc(detectiveUid).set({
        plan: plan ?? 'free',
        planExpiresAt: planExpiresAt ?? null,
        planSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
}

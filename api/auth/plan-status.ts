import admin from "firebase-admin";
import { checkRateLimit } from "./_lib/rateLimit.js";
import { getDetectiveApp } from "./_lib/detectiveApp.js";
import { syncDetectiveUserPlan } from "./_lib/syncDetectivePlan.js";

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
    } catch (error: any) {
        console.error("❌ Erro na inicialização do Admin SDK (api/auth/plan-status.ts):", error.message);
    }
}

// Único endpoint chamado cross-origin (criminal-minds -> este domínio) —
// CORS restrito a uma allowlist exata, nunca "*", já que a resposta carrega
// status de plano. Inclui localhost pra dar pra testar o SSO/sync em dev
// sem precisar de deploy; nunca ecoa uma origem fora da lista.
const ALLOWED_ORIGINS = [
    "https://criminal-mind.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
];

function isPlanActive(plan: string | undefined, planExpiresAt: string | null | undefined): boolean {
    if (!plan || !['premium', 'annual'].includes(plan)) return false;
    if (!planExpiresAt) return true;
    return new Date(planExpiresAt) > new Date();
}

export default async function handler(req: any, res: any) {
    const origin = req.headers.origin;
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization || '';
        const detectiveIdToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!detectiveIdToken) return res.status(401).json({ message: 'Token de autenticação ausente' });

        let detectiveApp: admin.app.App;
        try {
            detectiveApp = getDetectiveApp();
        } catch (error: any) {
            console.error("❌ Erro ao inicializar Admin SDK do criminal-minds:", error.message);
            return res.status(500).json({ message: 'Integração com o Criminal Minds não configurada' });
        }

        // O token aqui é do projeto do criminal-minds, não do quemsoueu —
        // verificado com o Admin App "detective", não com o app default.
        const decodedDetective = await admin.auth(detectiveApp).verifyIdToken(detectiveIdToken);
        if (!decodedDetective.email) {
            return res.status(403).json({ message: 'Conta sem e-mail associado' });
        }
        if (!decodedDetective.email_verified) {
            return res.status(403).json({ message: 'E-mail não verificado' });
        }

        const db = admin.firestore();
        const rateLimitOk = await checkRateLimit(db, decodedDetective.uid, { collection: "detective_plan_status_rate_limits", max: 20, windowMs: 60_000 });
        if (!rateLimitOk) {
            return res.status(429).json({ message: 'Muitas requisições. Aguarde alguns segundos.' });
        }

        // Usuário do criminal-minds pode não ter conta no quemsoueu — nesse
        // caso o plano é free por ausência, não é erro.
        const userQuery = await db.collection('users').where('email', '==', decodedDetective.email).limit(1).get();
        const userData = userQuery.empty ? undefined : userQuery.docs[0].data();
        const plan = userData?.plan ?? 'free';
        const planExpiresAt = userData?.planExpiresAt ?? null;

        await syncDetectiveUserPlan(detectiveApp, decodedDetective.uid, plan, planExpiresAt);

        return res.status(200).json({ plan, planExpiresAt, isPremium: isPlanActive(plan, planExpiresAt) });
    } catch (error: any) {
        console.error('❌ Erro ao sincronizar status de plano:', error.message);
        return res.status(500).json({ message: 'Falha ao verificar status de plano' });
    }
}

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
        console.error("❌ Erro na inicialização do Admin SDK (api/auth/detective-token.ts):", error.message);
    }
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const authHeader = req.headers.authorization || '';
        const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!idToken) return res.status(401).json({ message: 'Token de autenticação ausente' });

        const decoded = await admin.auth().verifyIdToken(idToken);

        if (!decoded.email) {
            return res.status(403).json({ message: 'Conta sem e-mail associado' });
        }
        if (!decoded.email_verified) {
            return res.status(403).json({ message: 'E-mail não verificado' });
        }

        const db = admin.firestore();
        const rateLimitOk = await checkRateLimit(db, decoded.uid, { collection: "detective_sso_rate_limits", max: 10, windowMs: 60_000 });
        if (!rateLimitOk) {
            return res.status(429).json({ message: 'Muitas requisições. Aguarde alguns segundos.' });
        }

        let detectiveApp: admin.app.App;
        try {
            detectiveApp = getDetectiveApp();
        } catch (error: any) {
            console.error("❌ Erro ao inicializar Admin SDK do criminal-minds:", error.message);
            return res.status(500).json({ message: 'Integração com o Criminal Minds não configurada' });
        }

        const detectiveAuth = admin.auth(detectiveApp);

        let detectiveUser;
        try {
            detectiveUser = await detectiveAuth.getUserByEmail(decoded.email);
            if (!detectiveUser.emailVerified) {
                // Mesmo princípio do trip-token.ts do CashZ: já provamos que o
                // usuário do quemsoueu é dono do e-mail, mas não sabemos quem
                // controla a senha do lado do criminal-minds — falha fechada.
                console.error(`❌ SSO recusado: conta ${detectiveUser.uid} do Criminal Minds com e-mail ${decoded.email} não verificada.`);
                return res.status(409).json({ message: 'Já existe uma conta não verificada com este e-mail no Criminal Minds. Entre em contato com o suporte.' });
            }
        } catch (error: any) {
            if (error.code !== 'auth/user-not-found') throw error;
            detectiveUser = await detectiveAuth.createUser({
                email: decoded.email,
                emailVerified: true,
                displayName: decoded.name,
                photoURL: decoded.picture,
            });
        }

        // Sincroniza o status de plano do quemsoueu pro doc do usuário no
        // criminal-minds — quem decide se o plano ainda vale é a regra do
        // Firestore de lá. Falha na sincronização não deve impedir o login.
        try {
            const userSnap = await db.collection('users').doc(decoded.uid).get();
            const userData = userSnap.data();
            await syncDetectiveUserPlan(detectiveApp, detectiveUser.uid, userData?.plan, userData?.planExpiresAt ?? null);
        } catch (error: any) {
            console.error('❌ Erro ao sincronizar plano pro Criminal Minds:', error.message);
        }

        const customToken = await detectiveAuth.createCustomToken(detectiveUser.uid);

        return res.status(200).json({ customToken });
    } catch (error: any) {
        console.error('❌ Erro ao gerar token SSO do Criminal Minds:', error.message);
        return res.status(500).json({ message: 'Falha ao gerar acesso ao Criminal Minds' });
    }
}

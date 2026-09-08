import { MercadoPagoConfig, Payment } from 'mercadopago';
import admin from "firebase-admin";

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
        console.error("❌ Erro na inicialização:", error.message);
    }
}

const adminDb = admin.firestore();
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || ''
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { data, type, action } = req.body;

        if (type === 'payment' || action === 'payment.created' || action === 'payment.updated') {
            const paymentId = data?.id || req.body?.data?.id;
            if (!paymentId) return res.status(200).send('OK');

            const payment = new Payment(client);
            const p = await payment.get({ id: Number(paymentId) });

            if (p.status === 'approved') {
                const userId = p.external_reference;

                if (!userId) {
                    console.error("❌ Erro: external_reference (userId) não encontrado.");
                    return res.status(200).send('OK');
                }

                // O item enviado em api/checkout.ts (items[0].id) já é "premium"
                // literal — ler isso é a fonte de verdade, sem heurístico por valor.
                const itemId = p.additional_info?.items?.[0]?.id;
                const planType = itemId === 'premium' ? itemId : 'premium';
                const daysToAdd = 30;

                const userRef = adminDb.collection("users").doc(userId);
                const userDoc = await userRef.get();

                let startDate = new Date();
                if (userDoc.exists) {
                    const currentData = userDoc.data();
                    if (currentData?.planExpiresAt) {
                        const currentExp = new Date(currentData.planExpiresAt);
                        if (currentExp > startDate) startDate = currentExp;
                    }
                }

                const expirationDate = new Date(startDate);
                expirationDate.setDate(expirationDate.getDate() + daysToAdd);

                await userRef.set({
                    plan: planType,
                    planExpiresAt: expirationDate.toISOString(),
                    lastPaymentId: String(paymentId),
                    lastUpdated: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
        }

        return res.status(200).send('OK');

    } catch (error: any) {
        console.error('❌ Webhook Error:', error.message);
        return res.status(200).send('Erro processado');
    }
}

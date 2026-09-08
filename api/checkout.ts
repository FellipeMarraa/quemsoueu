import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || ''
});

// Preço definido só no servidor — nunca aceitar valor vindo do client (mesmo
// princípio de segurança já aplicado no checkout do CashZ).
const PLAN_PRICES: Record<string, number> = {
    premium: 14.90
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { userId, planType } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'userId é obrigatório' });
        }

        const price = PLAN_PRICES[planType];
        if (price === undefined) {
            return res.status(400).json({ message: 'planType inválido' });
        }

        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: [
                    {
                        id: planType,
                        title: `Quem Sou Eu? - Plano ${planType}`,
                        quantity: 1,
                        unit_price: price,
                        currency_id: 'BRL'
                    }
                ],
                external_reference: userId,
                notification_url: "https://quemsoueu-celebs.vercel.app/api/webhook",
                back_urls: {
                    success: "https://quemsoueu-celebs.vercel.app/?status=success",
                    failure: "https://quemsoueu-celebs.vercel.app/?status=error",
                    pending: "https://quemsoueu-celebs.vercel.app/?status=pending"
                },
                auto_return: "approved",
            }
        });

        return res.status(200).json({ init_point: result.init_point });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({ error: error.message });
    }
}

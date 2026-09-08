// Espelha o isPlanActive() do CashZ: nunca confia só no campo `plan`
// sincronizado, sempre recalcula a expiração contra "agora". Serve só pra UI
// (habilitar/desabilitar ação); quem decide de verdade é a regra do
// Firestore no momento da escrita.
export function isPlanActive(plan: string | undefined, planExpiresAt: string | null | undefined): boolean {
    if (!plan || !['premium', 'annual'].includes(plan)) return false;
    if (!planExpiresAt) return true;
    return new Date(planExpiresAt) > new Date();
}

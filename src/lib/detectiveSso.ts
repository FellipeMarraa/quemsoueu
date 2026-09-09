import { auth } from "./firebase";

const CRIMINAL_MINDS_URL = "https://criminal-mind.vercel.app";

export async function getDetectiveSsoUrl(): Promise<string> {
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) throw new Error("Usuário não autenticado");

    const res = await fetch('/api/auth/detective-token', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${idToken}` }
    });
    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(`Falha ao gerar acesso ao Criminal Minds (${res.status}): ${body?.message ?? 'sem detalhe'}`);
    }

    const { customToken } = await res.json();
    return `${CRIMINAL_MINDS_URL}/#token=${encodeURIComponent(customToken)}`;
}

import type { Player } from '../types/game';

export const PODIUM_POINTS = [5, 3, 1];

// Aplica pontos de pódio (5/3/1) aos 3 primeiros a acertar, na ordem de
// guessedAt. No máximo 3 "vencedores" por rodada em qualquer tamanho de
// grupo — consequência direta de só existirem 3 faixas de pontos, sem
// precisar de corte separado por número de participantes.
export function awardRoundPoints(members: Player[]): Player[] {
    const guessOrder = members
        .filter((m) => m.guessedAt)
        .sort((a, b) => (a.guessedAt ?? 0) - (b.guessedAt ?? 0));

    return members.map((m) => {
        const rank = guessOrder.findIndex((g) => g.id === m.id);
        if (rank < 0 || rank >= PODIUM_POINTS.length) return m;
        return { ...m, totalPoints: (m.totalPoints ?? 0) + PODIUM_POINTS[rank] };
    });
}

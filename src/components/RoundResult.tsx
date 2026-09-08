import {db} from '../lib/firebase';
import {doc, updateDoc} from 'firebase/firestore';
import {Crown, Medal, PlayCircle, Trophy} from 'lucide-react';
import type {Group} from '../types/game';
import {PODIUM_POINTS} from '../lib/scoring';

interface RoundResultProps {
    group: Group;
    userId: string;
}

const MEDAL_COLORS = ['text-amber-400', 'text-slate-300', 'text-orange-400'];

export default function RoundResult({ group, userId }: RoundResultProps) {
    const isAdmin = group.adminId === userId;

    const podium = [...group.members]
        .filter((m) => m.guessedAt)
        .sort((a, b) => (a.guessedAt ?? 0) - (b.guessedAt ?? 0))
        .slice(0, PODIUM_POINTS.length);

    const standings = [...group.members].sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0));

    const startNextRound = async () => {
        if (!isAdmin) return;
        await updateDoc(doc(db, "groups", group.id), {
            status: 'WAITING_CHOICES',
            members: group.members.map((m) => ({ ...m, assignedCeleb: "", guessedAt: null }))
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center p-6">
            <div className="w-full max-w-2xl flex flex-col min-h-screen">

                <header className="flex flex-col items-center text-center mb-8 pt-6">
                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400 mb-3">
                        <Trophy size={32} />
                    </div>
                    <h2 className="text-2xl font-black leading-none">Resultado da Rodada</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">{group.name}</p>
                </header>

                {podium.length > 0 && (
                    <div className="space-y-3 mb-8">
                        {podium.map((member, i) => (
                            <div
                                key={member.id}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl"
                            >
                                <Medal size={28} className={MEDAL_COLORS[i]} />
                                <img
                                    src={member.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                                    className="w-12 h-12 rounded-full border-2 border-slate-800"
                                    alt={member.name}
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold truncate">{member.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{member.assignedCeleb}</p>
                                </div>
                                <span className="text-sm font-black text-emerald-400 shrink-0">+{PODIUM_POINTS[i]} pts</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mb-4">
                    <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                        <Crown size={16} /> Placar Geral
                    </h3>
                    <div className="space-y-2">
                        {standings.map((member, i) => (
                            <div
                                key={member.id}
                                className={`flex items-center gap-3 p-3 rounded-xl border ${
                                    i === 0 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-900/50 border-slate-800'
                                }`}
                            >
                                <span className="text-xs font-mono text-slate-500 w-5 shrink-0">{i + 1}º</span>
                                <img
                                    src={member.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                                    className="w-8 h-8 rounded-full border border-slate-800"
                                    alt={member.name}
                                />
                                <p className="flex-1 min-w-0 text-sm font-medium truncate">{member.name}</p>
                                <span className="text-sm font-black text-slate-300 shrink-0">{member.totalPoints ?? 0} pts</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1"></div>

                <div className="sticky bottom-0 pt-6 pb-2 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
                    {isAdmin ? (
                        <button
                            onClick={startNextRound}
                            className="w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-500/20 border-b-4 border-emerald-800 transition-all"
                        >
                            <PlayCircle size={20} /> Próxima Rodada
                        </button>
                    ) : (
                        <div className="w-full py-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                            Aguardando o anfitrião iniciar a próxima rodada...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

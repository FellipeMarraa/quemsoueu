import  {useEffect, useState} from 'react';
import {db} from '../lib/firebase';
import {doc, onSnapshot, runTransaction, updateDoc} from 'firebase/firestore';
import {ALL_CELEBS, CATEGORIES, FREE_CELEBS} from '../data/celebrities';
import type {AppUser, Group} from '../types/game';
import {isPlanActive} from '../lib/plan';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from './ui/alert-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from './ui/dialog';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    ChevronDown,
    Copy,
    Dices,
    Lock,
    Play, Plus,
    RotateCcw,
    Search,
    Shuffle,
    UserPlus,
    Users
} from 'lucide-react';

interface ChoicePhaseProps {
    group: Group;
    userId: string;
}

export default function ChoicePhase({ group, userId }: ChoicePhaseProps) {
    const isAdmin = group.adminId === userId;
    const [copied, setCopied] = useState(false);
    const [activeSelect, setActiveSelect] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isGroupPremium, setIsGroupPremium] = useState(false);
    const [lockedMessage, setLockedMessage] = useState<string | null>(null);

    // O plano do GRUPO é sempre o de quem criou (adminId) — não o de quem
    // está escolhendo no momento. Um membro premium dentro de um grupo
    // criado por um usuário free continua sob as regras do free.
    useEffect(() => {
        const unsub = onSnapshot(doc(db, "users", group.adminId), (snap) => {
            const ownerData = snap.data() as AppUser | undefined;
            setIsGroupPremium(isPlanActive(ownerData?.plan, ownerData?.planExpiresAt));
        });
        return () => unsub();
    }, [group.adminId]);

    const toggleSelect = (playerId: string) => {
        setActiveSelect(prev => prev === playerId ? null : playerId);
        setSearchTerm('');
    };

    const closeSelect = () => {
        setActiveSelect(null);
        setSearchTerm('');
    };

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredCategories = CATEGORIES
        .map(category => ({
            ...category,
            items: category.items.filter(celeb => celeb.name.toLowerCase().includes(normalizedSearch))
        }))
        .filter(category => category.items.length > 0);

    const otherPlayers = group.members.filter((m) => m.id !== userId);
    const activePlayer = otherPlayers.find((p) => p.id === activeSelect) ?? null;
    const allChoicesDone = group.members.every((m) => m.assignedCeleb && m.assignedCeleb !== "");
    const chosenCount = group.members.filter((m) => m.assignedCeleb && m.assignedCeleb !== "").length;
    const canStart = otherPlayers.length > 0 && (group.randomMode || allChoicesDone);

    const handleCopyLink = () => {
        const inviteLink = `${window.location.origin}?join=${group.id}`;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAssign = async (targetId: string, celebName: string) => {
        const groupRef = doc(db, "groups", group.id);
        await runTransaction(db, async (tx) => {
            const snap = await tx.get(groupRef);
            if (!snap.exists()) return;
            const currentMembers = (snap.data() as Group).members;
            const newMembers = currentMembers.map((m) =>
                m.id === targetId ? { ...m, assignedCeleb: celebName } : m
            );
            tx.update(groupRef, { members: newMembers });
        });
        setActiveSelect(null);
    };

    const handleRandomAssign = (targetId: string) => {
        const pool = isGroupPremium ? ALL_CELEBS : FREE_CELEBS;
        const randomCeleb = pool[Math.floor(Math.random() * pool.length)];
        handleAssign(targetId, randomCeleb.name);
    };

    const toggleRandomMode = async () => {
        if (!isAdmin) return;
        await updateDoc(doc(db, "groups", group.id), { randomMode: !group.randomMode });
    };

    const startCountdown = async () => {
        if (!canStart) return;
        const groupRef = doc(db, "groups", group.id);

        if (group.randomMode) {
            const pool = isGroupPremium ? ALL_CELEBS : FREE_CELEBS;
            await runTransaction(db, async (tx) => {
                const snap = await tx.get(groupRef);
                if (!snap.exists()) return;
                const currentMembers = (snap.data() as Group).members;
                const randomizedMembers = currentMembers.map((m) => ({
                    ...m,
                    assignedCeleb: pool[Math.floor(Math.random() * pool.length)].name
                }));
                tx.update(groupRef, { members: randomizedMembers, status: 'STARTING', startingAt: Date.now() });
            });
        } else {
            await updateDoc(groupRef, { status: 'STARTING', startingAt: Date.now() });
        }
    };

    return (
        <>
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center">
            <div className="w-full max-w-2xl p-6 flex flex-col min-h-screen">

                {/* Header Superior */}
                <header className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => window.location.href = window.location.origin}
                        className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-slate-400"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-right">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">Sessão Ativa</span>
                        <h2 className="text-xl font-bold leading-none truncate max-w-[200px]">{group.name || 'Fase de Escolha'}</h2>
                        <p className="text-[10px] font-bold text-slate-500 mt-1 font-mono">
                            {group.randomMode ? 'sorteio automático' : `${chosenCount}/${group.members.length} escolheram`}
                        </p>
                    </div>
                </header>

                {/* Card de Convite Estilo Shadcn */}
                {isAdmin && (
                    <div className="mb-8 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0">
                                <UserPlus size={20} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Convidar amigos</p>
                                <p className="text-sm text-slate-200 truncate font-mono">ID: {group.id}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleCopyLink}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                                copied ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                        >
                            {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Link</>}
                        </button>
                    </div>
                )}

                {/* Modo Aleatório */}
                {isAdmin ? (
                    <button
                        onClick={toggleRandomMode}
                        className={`mb-8 p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all text-left ${
                            group.randomMode
                                ? 'bg-indigo-600/10 border-indigo-500/30'
                                : 'bg-slate-900/50 border-slate-800'
                        }`}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className={`p-2 rounded-lg shrink-0 ${group.randomMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                                <Dices size={20} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-300 uppercase tracking-wider truncate">Sorteio Automático</p>
                                <p className="text-[10px] text-slate-500 mt-0.5">Ao iniciar, cada jogador recebe um personagem aleatório</p>
                            </div>
                        </div>
                        <div className={`w-11 h-6 rounded-full p-0.5 transition-all shrink-0 ${group.randomMode ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${group.randomMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                    </button>
                ) : group.randomMode && (
                    <div className="mb-8 p-3 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 flex items-center gap-2 justify-center">
                        <Dices size={14} className="text-indigo-400" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Sorteio automático ativado pelo anfitrião</p>
                    </div>
                )}

                {/* Lista de Jogadores */}
                <div className="flex-1 space-y-4 mb-24">
                    {otherPlayers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-800 border-dashed animate-pulse">
                                <Users size={32} className="text-slate-700" />
                            </div>
                            <p className="text-slate-400 font-medium">Aguardando jogadores...</p>
                            <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-1">Envie o código ou link de convite</p>
                        </div>
                    ) : (
                        otherPlayers.map((player) => (
                            <div key={player.id}>
                                <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                                    !group.randomMode && player.assignedCeleb
                                        ? 'bg-slate-900/50 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]'
                                        : 'bg-slate-900 border-slate-800'
                                }`}>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="relative shrink-0">
                                                <img
                                                    src={player.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`}
                                                    className={`w-14 h-14 rounded-full border-2 transition-colors duration-300 ${!group.randomMode && player.assignedCeleb ? 'border-emerald-500' : 'border-slate-800'}`}
                                                    alt={player.name}
                                                />
                                                {!group.randomMode && player.assignedCeleb && (
                                                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-slate-950 shadow-lg">
                                                        <CheckCircle2 size={12} className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg truncate">{player.name}</h3>
                                                {group.randomMode ? (
                                                    <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.1em] mt-0.5">Pronto pro sorteio</p>
                                                ) : player.assignedCeleb ? (
                                                    <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-black uppercase tracking-wider mt-0.5 truncate">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                                                        <span className="truncate">{player.assignedCeleb}</span>
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] mt-0.5">Aguardando celebridade</p>
                                                )}
                                            </div>
                                        </div>

                                        {!group.randomMode && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleRandomAssign(player.id)}
                                                    title="Escolher aleatoriamente"
                                                    className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white transition-all shrink-0"
                                                >
                                                    <Shuffle size={16} />
                                                </button>

                                                {/* Botão Dinâmico: Escolher ou Alterar */}
                                                <button
                                                    onClick={() => toggleSelect(player.id)}
                                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                                                        player.assignedCeleb
                                                            ? 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                                                            : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-700'
                                                    }`}
                                                >
                                                    {player.assignedCeleb ? (
                                                        <><RotateCcw size={16} /> Alterar</>
                                                    ) : (
                                                        <><Plus size={16} /> Escolher</>
                                                    )}
                                                    <ChevronDown size={14} className={`transition-transform duration-300 ${activeSelect === player.id ? 'rotate-180' : ''}`} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Botão Fixo Inferior */}
                <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
                    <div className="max-w-2xl mx-auto">
                        {isAdmin ? (
                            <button
                                onClick={startCountdown}
                                disabled={!canStart}
                                className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-2xl ${
                                    canStart
                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 border-b-4 border-emerald-800'
                                        : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                                }`}
                            >
                                <Play size={20} fill={canStart ? "currentColor" : "none"} />
                                COMEÇAR RODADA
                            </button>
                        ) : (
                            <div className="w-full py-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                                {canStart ? "Aguardando ADM iniciar..." : "Aguardando escolhas..."}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <Dialog open={!!activeSelect} onOpenChange={(open) => !open && closeSelect()}>
            <DialogContent className="max-h-[85vh] flex flex-col p-4">
                <DialogHeader>
                    <DialogTitle>Escolher para {activePlayer?.name}</DialogTitle>
                    <DialogDescription>Qual personagem essa pessoa vai tentar adivinhar?</DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-2 text-slate-500 bg-slate-800/50 rounded-xl px-3 py-2.5 shrink-0">
                    <Search size={14} />
                    <input
                        type="text"
                        placeholder="Procurar..."
                        className="bg-transparent border-none outline-none text-sm font-medium w-full text-slate-200"
                        autoFocus
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-y-auto flex-1 -mx-1 px-1">
                    {filteredCategories.length === 0 && (
                        <p className="px-3 py-6 text-center text-xs text-slate-500">Nenhuma celebridade encontrada.</p>
                    )}
                    {filteredCategories.map(category => {
                        const locked = category.premium && !isGroupPremium;
                        return (
                            <div key={category.id} className="mb-4">
                                <div className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${locked ? 'text-amber-500' : 'text-indigo-400'}`}>
                                    <span>{category.icon}</span> {category.title}
                                    {locked && (
                                        <span className="flex items-center gap-1 ml-auto text-[9px] bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5">
                                            <Lock size={9} /> Premium
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-1">
                                    {category.items.map(celeb => (
                                        <button
                                            key={celeb.id}
                                            onClick={() => {
                                                if (locked) {
                                                    setLockedMessage("Essa categoria é exclusiva do plano Premium. O plano vale pra rodada inteira: quem criou o grupo precisa ser Premium pra liberar.");
                                                } else if (activeSelect) {
                                                    handleAssign(activeSelect, celeb.name);
                                                }
                                            }}
                                            className={`flex items-center px-3 py-2.5 rounded-lg text-sm text-left transition-colors font-medium group ${
                                                locked
                                                    ? 'text-slate-600 cursor-not-allowed opacity-60'
                                                    : activePlayer?.assignedCeleb === celeb.name
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'hover:bg-slate-800 text-slate-300'
                                            }`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full mr-3 transition-colors ${
                                                activePlayer?.assignedCeleb === celeb.name ? 'bg-white' : 'bg-slate-700 group-hover:bg-indigo-400'
                                            }`}></div>
                                            {celeb.name}
                                            {locked && <Lock size={12} className="ml-auto shrink-0" />}
                                            {!locked && activePlayer?.assignedCeleb === celeb.name && <Check size={14} className="ml-auto" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </DialogContent>
        </Dialog>

        <AlertDialog open={!!lockedMessage} onOpenChange={(open) => !open && setLockedMessage(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Categoria Premium</AlertDialogTitle>
                    <AlertDialogDescription>{lockedMessage}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setLockedMessage(null)}>Entendi</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        </>
    );
}
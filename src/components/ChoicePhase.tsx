import  {useState} from 'react';
import {db} from '../lib/firebase';
import {doc, updateDoc} from 'firebase/firestore';
import {CATEGORIES} from '../data/celebrities';
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    ChevronDown,
    Copy,
    Play, Plus,
    RotateCcw,
    Search,
    UserPlus,
    Users
} from 'lucide-react';

interface ChoicePhaseProps {
    group: any;
    userId: string;
}

export default function ChoicePhase({ group, userId }: ChoicePhaseProps) {
    const isAdmin = group.adminId === userId;
    const [copied, setCopied] = useState(false);
    const [activeSelect, setActiveSelect] = useState<string | null>(null);

    const otherPlayers = group.members.filter((m: any) => m.id !== userId);
    const allChoicesDone = group.members.every((m: any) => m.assignedCeleb && m.assignedCeleb !== "");

    const handleCopyLink = () => {
        const inviteLink = `${window.location.origin}?join=${group.id}`;
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleAssign = async (targetId: string, celebName: string) => {
        const newMembers = group.members.map((m: any) =>
            m.id === targetId ? { ...m, assignedCeleb: celebName } : m
        );
        await updateDoc(doc(db, "groups", group.id), { members: newMembers });
        setActiveSelect(null);
    };

    const startCountdown = async () => {
        if (!allChoicesDone) return;
        await updateDoc(doc(db, "groups", group.id), { status: 'STARTING' });
        setTimeout(async () => {
            await updateDoc(doc(db, "groups", group.id), { status: 'PLAYING' });
        }, 5000);
    };

    return (
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
                        <h2 className="text-xl font-bold leading-none">Fase de Escolha</h2>
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
                        otherPlayers.map((player: any) => (
                            <div key={player.id} className="relative group">
                                <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                                    player.assignedCeleb
                                        ? 'bg-slate-900/50 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]'
                                        : 'bg-slate-900 border-slate-800'
                                }`}>
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            <img
                                                src={player.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`}
                                                className={`w-14 h-14 rounded-full border-2 transition-colors duration-300 ${player.assignedCeleb ? 'border-emerald-500' : 'border-slate-800'}`}
                                                alt={player.name}
                                            />
                                            {player.assignedCeleb && (
                                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 border-2 border-slate-950 shadow-lg">
                                                    <CheckCircle2 size={12} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-lg truncate">{player.name}</h3>
                                            {player.assignedCeleb ? (
                                                <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] font-black uppercase tracking-wider mt-0.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    {player.assignedCeleb}
                                                </div>
                                            ) : (
                                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.1em] mt-0.5">Aguardando celebridade</p>
                                            )}
                                        </div>

                                        {/* Botão Dinâmico: Escolher ou Alterar */}
                                        <button
                                            onClick={() => setActiveSelect(activeSelect === player.id ? null : player.id)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border shrink-0 ${
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
                                </div>

                                {/* Custom Dropdown Seletor */}
                                {activeSelect === player.id && (
                                    <div className="absolute top-full left-0 right-0 z-50 mt-2 p-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-80 overflow-y-auto custom-scrollbar border-indigo-500/20">
                                        <div className="sticky top-0 bg-slate-900 pb-2 border-b border-slate-800 mb-2 px-2">
                                            <div className="flex items-center gap-2 text-slate-500 py-2">
                                                <Search size={14} />
                                                <input
                                                    type="text"
                                                    placeholder="Procurar..."
                                                    className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest w-full text-slate-200"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        {CATEGORIES.map(category => (
                                            <div key={category.id} className="mb-4">
                                                <div className="px-3 py-1.5 text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <span>{category.icon}</span> {category.title}
                                                </div>
                                                <div className="grid grid-cols-1 gap-1">
                                                    {category.items.map(celeb => (
                                                        <button
                                                            key={celeb.id}
                                                            onClick={() => handleAssign(player.id, celeb.name)}
                                                            className={`flex items-center px-3 py-2.5 rounded-lg text-sm text-left transition-colors font-medium group ${
                                                                player.assignedCeleb === celeb.name
                                                                    ? 'bg-indigo-600 text-white'
                                                                    : 'hover:bg-slate-800 text-slate-300'
                                                            }`}
                                                        >
                                                            <div className={`w-1.5 h-1.5 rounded-full mr-3 transition-colors ${
                                                                player.assignedCeleb === celeb.name ? 'bg-white' : 'bg-slate-700 group-hover:bg-indigo-400'
                                                            }`}></div>
                                                            {celeb.name}
                                                            {player.assignedCeleb === celeb.name && <Check size={14} className="ml-auto" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
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
                                disabled={!allChoicesDone || otherPlayers.length === 0}
                                className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-2xl ${
                                    allChoicesDone && otherPlayers.length > 0
                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 border-b-4 border-emerald-800'
                                        : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                                }`}
                            >
                                <Play size={20} fill={allChoicesDone && otherPlayers.length > 0 ? "currentColor" : "none"} />
                                COMEÇAR RODADA
                            </button>
                        ) : (
                            <div className="w-full py-4 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl">
                                {allChoicesDone ? "Aguardando ADM iniciar..." : "Aguardando escolhas..."}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
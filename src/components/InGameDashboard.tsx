import {useState} from 'react';
import {db} from '../lib/firebase';
import {doc, updateDoc} from 'firebase/firestore';
import {Eye, EyeOff, Square, Trophy, User} from 'lucide-react';

interface InGameDashboardProps {
    group: any;
    userId: string;
}

export default function InGameDashboard({ group, userId }: InGameDashboardProps) {
    const isAdmin = group.adminId === userId;
    const [visibleNames, setVisibleNames] = useState<Record<string, boolean>>({});

    const toggleVisibility = (id: string) => {
        setVisibleNames(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const finishGame = async () => {
        if (!isAdmin) return;
        await updateDoc(doc(db, "groups", group.id), {
            status: 'WAITING_CHOICES',
            members: group.members.map((m: any) => ({ ...m, assignedCeleb: "" }))
        });
    };

    const displayMembers = group.members.filter((m: any) => m.id !== userId);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center p-6">
            <div className="w-full max-w-2xl flex flex-col min-h-screen">

                <header className="flex items-center justify-between mb-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold leading-none">Em Partida</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Sala: {group.id}</p>
                        </div>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={finishGame}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5"
                        >
                            <Square size={14} fill="currentColor" /> Finalizar
                        </button>
                    )}
                </header>

                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-4 mb-8 text-center">
                    <p className="text-sm text-indigo-300 font-medium">
                        Nomes dos outros jogadores <br/>
                        <span className="text-[10px] uppercase opacity-70">Clique no olho para revelar</span>
                    </p>
                </div>

                <div className="flex-1 space-y-4 mb-10">
                    {displayMembers.map((member: any) => (
                        <div
                            key={member.id}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-5 flex items-center justify-between gap-4 transition-all hover:border-slate-700 shadow-xl"
                        >
                            <div className="flex items-center gap-4 min-w-0">
                                <img
                                    src={member.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                                    className="w-12 h-12 rounded-full border-2 border-slate-800"
                                    alt={member.name}
                                />
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter truncate">
                                        {member.name}
                                    </p>
                                    <div className="relative mt-1">
                                        <p className={`text-xl font-black uppercase tracking-tight transition-all duration-300 ${
                                            visibleNames[member.id] ? 'blur-0 opacity-100' : 'blur-md opacity-20 select-none'
                                        }`}>
                                            {member.assignedCeleb || "???"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => toggleVisibility(member.id)}
                                className={`p-4 rounded-2xl transition-all ${
                                    visibleNames[member.id]
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                            >
                                {visibleNames[member.id] ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    ))}

                    {displayMembers.length === 0 && (
                        <div className="py-20 text-center text-slate-600 flex flex-col items-center">
                            <User size={48} className="mb-4 opacity-20" />
                            <p className="font-bold">Aguardando amigos entrarem na partida.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
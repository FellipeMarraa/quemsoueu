import {useEffect, useRef} from 'react';
import {db} from '../lib/firebase';
import {doc, updateDoc} from 'firebase/firestore';
import {Square} from 'lucide-react';

interface GameScreenProps {
    group: any;
    userId: string;
}

export default function GameScreen({ group, userId }: GameScreenProps) {
    const me = group.members.find((m: any) => m.id === userId);
    const isAdmin = group.adminId === userId;
    const wakeLockRef = useRef<any>(null); // Referência para o bloqueio de tela

    // 1. Lógica para MANTER A TELA ACESA (Wake Lock)
    useEffect(() => {
        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
                    console.log('Wake Lock ativo: A tela não irá apagar.');
                }
            } catch (err) {
                console.error('Erro ao ativar Wake Lock:', err);
            }
        };

        requestWakeLock();

        // Limpeza ao fechar o componente ou acabar a partida
        return () => {
            if (wakeLockRef.current) {
                wakeLockRef.current.release().then(() => {
                    wakeLockRef.current = null;
                    console.log('Wake Lock liberado.');
                });
            }
        };
    }, []);

    // 2. Lógica de Rotação e Fullscreen
    useEffect(() => {
        const setupScreen = async () => {
            try {
                if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                    if (screen.orientation && (screen.orientation as any).lock) {
                        await (screen.orientation as any).lock('landscape');
                    }
                }
            } catch (err) {
                console.log("Rotação automática bloqueada.");
            }
        };
        setupScreen();
    }, []);

    const finishRound = async () => {
        if (!isAdmin) return;

        await updateDoc(doc(db, "groups", group.id), {
            status: 'WAITING_CHOICES',
            members: group.members.map((m: any) => ({ ...m, assignedCeleb: "" }))
        });

        if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-indigo-600 flex items-center justify-center overflow-hidden h-screen w-screen">
            <div className="flex flex-col items-center justify-center w-full h-full p-10 portrait:rotate-90 portrait:w-[100vh] portrait:h-[100vw]">

                <div className="text-center relative">
          <span className="block text-indigo-300 text-sm md:text-xl font-black uppercase tracking-[0.5em] mb-4 opacity-60">
            Você é:
          </span>

                    <h1 className="text-[14vw] md:text-[10vw] font-black uppercase leading-none tracking-tighter text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.3)] whitespace-nowrap">
                        {me?.assignedCeleb || "ERRO!"}
                    </h1>

                    <div className="mt-10 inline-flex items-center gap-3 rounded-full bg-white/10 px-6 py-2 backdrop-blur-md border border-white/20 shadow-xl">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <p className="text-xs md:text-sm font-bold uppercase tracking-widest text-indigo-100">
                            Tela sempre ativa
                        </p>
                    </div>
                </div>

                {isAdmin && (
                    <div className="absolute bottom-10 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <button
                            onClick={finishRound}
                            className="flex items-center gap-3 px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-95 border-b-4 border-red-800"
                        >
                            <Square size={18} fill="currentColor" />
                            Finalizar Rodada
                        </button>
                    </div>
                )}
            </div>

            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-indigo-400 rounded-full blur-[120px] opacity-20"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-cyan-400 rounded-full blur-[120px] opacity-20"></div>
            </div>
        </div>
    );
}
import {useEffect, useState} from 'react';
import {auth, db} from './lib/firebase';
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth';
import {Crown, DoorOpen, Gamepad2, Hash, LogIn, LogOut, PlayCircle, Plus, Trash2, Users} from 'lucide-react';

// Importação dos componentes de fase
import ChoicePhase from './components/ChoicePhase';
import InGameDashboard from './components/InGameDashboard';
import type {AppUser, Group, Player} from './types/game';
import {isPlanActive} from './lib/plan';
import {syncPlanFromCashz} from './lib/planSync';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from './components/ui/alert-dialog';

// Componente de Avatar com tratamento de erro e política de imagem do Google
const UserAvatar = ({ src, name }: { src?: string | null; name: string }) => {
  const [error, setError] = useState(false);
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';

  if (!src || error) {
    return (
        <div className="w-12 h-12 rounded-full border-2 border-indigo-500 bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0">
          {initials}
        </div>
    );
  }

  return (
      <img
          src={src}
          referrerPolicy="no-referrer"
          className="w-12 h-12 rounded-full border-2 border-indigo-500 object-cover shrink-0"
          alt={name}
          onError={() => setError(true)}
      />
  );
};

// Componente de Timer Regressivo (sincronizado por timestamp do servidor, não conta local)
const CountdownDisplay = ({ startingAt }: { startingAt: number }) => {
  const getRemaining = () => {
    const elapsed = Math.floor((Date.now() - startingAt) / 1000);
    return Math.min(5, Math.max(0, 5 - elapsed));
  };
  const [count, setCount] = useState(getRemaining());

  useEffect(() => {
    const interval = setInterval(() => setCount(getRemaining()), 200);
    return () => clearInterval(interval);
  }, [startingAt]);

  return (
      <div key={count} className="text-[35vw] font-black leading-none animate-in zoom-in-50 fade-in duration-300">
        {count > 0 ? count : "VAI!"}
      </div>
  );
};

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [inputGroupId, setInputGroupId] = useState('');
  const [inviteProcessed, setInviteProcessed] = useState(false);
  const [groupAction, setGroupAction] = useState<{ id: string; type: 'delete' | 'leave' } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Monitoramento de Autenticação
  useEffect(() => {
    let unsubGroups: (() => void) | null = null;
    let unsubProfile: (() => void) | null = null;

    // Perfil via onSnapshot (não getDoc único): plan/planExpiresAt/activeGroupId
    // podem mudar depois do login já carregado (sync do CashZ é assíncrono,
    // ou o próprio CashZ atualiza o plano com a aba aberta) — precisa refletir
    // ao vivo, não só na hora do login. Resolve a Promise só no primeiro
    // snapshot pra não liberar a UI (loading=false) antes de saber o plano real.
    const subscribeToProfile = (userRef: ReturnType<typeof doc>, baseData: Omit<AppUser, 'plan' | 'planExpiresAt' | 'activeGroupId'>): Promise<() => void> => {
      return new Promise((resolve) => {
        let resolved = false;
        const settle = (unsub: () => void) => {
          if (resolved) return;
          resolved = true;
          resolve(unsub);
        };
        const unsub = onSnapshot(userRef, (snap) => {
          const data = snap.data();
          setUser({
            ...baseData,
            plan: data?.plan,
            planExpiresAt: data?.planExpiresAt ?? null,
            activeGroupId: data?.activeGroupId ?? null
          });
          settle(unsub);
        }, (error) => {
          console.error("Erro ao observar perfil:", error);
          settle(unsub);
        });
      });
    };

    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      unsubGroups?.();
      unsubGroups = null;
      unsubProfile?.();
      unsubProfile = null;

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const baseData = {
          uid: currentUser.uid,
          name: currentUser.displayName || 'Usuário',
          email: currentUser.email,
          photo: currentUser.photoURL,
          lastLogin: new Date()
        };

        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          await setDoc(userRef, baseData);
        }

        unsubProfile = await subscribeToProfile(userRef, baseData);
        unsubGroups = fetchUserGroups(currentUser.uid);
        syncPlanFromCashz(currentUser);
      } else {
        setUser(null);
        setUserGroups([]);
      }
      setLoading(false);
    });

    return () => {
      unsubAuth();
      unsubGroups?.();
      unsubProfile?.();
    };
  }, []);

  // 2. Processamento de Convite via URL
  useEffect(() => {
    if (!user || inviteProcessed) return;

    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('join');

    if (inviteCode) {
      setInviteProcessed(true);
      setTimeout(() => {
        handleJoinByInvite(inviteCode.toUpperCase(), user);
      }, 1500);
    }
  }, [user, inviteProcessed]);

  // 3. Sincronização de Grupos do Usuário
  const fetchUserGroups = (uid: string) => {
    const q = query(collection(db, "groups"), where("memberIds", "array-contains", uid));
    return onSnapshot(q, (snapshot) => {
      const groups = snapshot.docs.map(doc => doc.data() as Group);
      setUserGroups(groups);
    });
  };

  // 4. Sincronização do Grupo Ativo
  useEffect(() => {
    if (!group?.id) return;
    const unsubGroup = onSnapshot(doc(db, "groups", group.id), (doc) => {
      setGroup(doc.exists() ? (doc.data() as Group) : null);
    });
    return () => unsubGroup();
  }, [group?.id]);

  // 5. Transição STARTING -> PLAYING: qualquer cliente vendo o countdown pode disparar,
  // não só quem iniciou a rodada (evita travar o grupo se o admin fechar a aba).
  useEffect(() => {
    if (!group || group.status !== 'STARTING' || !group.startingAt) return;
    const remaining = Math.max(0, 5000 - (Date.now() - group.startingAt));
    const timer = setTimeout(() => {
      updateDoc(doc(db, "groups", group.id), { status: 'PLAYING' }).catch(() => {});
    }, remaining);
    return () => clearTimeout(timer);
  }, [group?.status, group?.startingAt, group?.id]);

  const handleJoinByInvite = async (code: string, currentUser: AppUser) => {
    const groupRef = doc(db, "groups", code);
    const groupSnap = await getDoc(groupRef);

    if (groupSnap.exists()) {
      const groupData = groupSnap.data() as Group;
      const alreadyMember = groupData.memberIds.includes(currentUser.uid);

      if (!alreadyMember && groupData.status !== 'WAITING_CHOICES') {
        setErrorMessage("Essa rodada já começou. Peça pro anfitrião criar um novo grupo.");
        setTimeout(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        }, 0);
        return;
      }

      if (!alreadyMember) {
        const ownerSnap = await getDoc(doc(db, "users", groupData.adminId));
        const ownerData = ownerSnap.data() as AppUser | undefined;
        if (!isPlanActive(ownerData?.plan, ownerData?.planExpiresAt) && groupData.memberIds.length >= 5) {
          setErrorMessage("Esse grupo já atingiu o limite de 5 jogadores do plano gratuito do anfitrião.");
          setTimeout(() => {
            window.history.replaceState({}, document.title, window.location.pathname);
          }, 0);
          return;
        }

        const newMember: Player = {
          id: currentUser.uid,
          name: currentUser.name,
          photo: currentUser.photo,
          assignedCeleb: ""
        };
        await updateDoc(groupRef, {
          memberIds: arrayUnion(currentUser.uid),
          members: arrayUnion(newMember)
        });
        setGroup({
          ...groupData,
          memberIds: [...groupData.memberIds, currentUser.uid],
          members: [...groupData.members, newMember]
        });
      } else {
        setGroup(groupData);
      }

      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }, 2000);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    const isMobile = /iPhone|Android/i.test(navigator.userAgent);

    try {
      await setPersistence(auth, browserLocalPersistence);
      if (isMobile) {
        try {
          await signInWithPopup(auth, provider);
        } catch {
          await signInWithRedirect(auth, provider);
        }
      } else {
        await signInWithPopup(auth, provider);
      }
    } catch (error) {
      console.error("Erro no login:", error);
    }
  };

  const createGroup = async () => {
    if (!user) return;

    let id = '';
    let isUnique = false;
    for (let attempts = 0; attempts < 5 && !isUnique; attempts++) {
      id = Math.random().toString(36).substring(2, 7).toUpperCase();
      const existing = await getDoc(doc(db, "groups", id));
      isUnique = !existing.exists();
    }
    if (!isUnique) {
      setErrorMessage("Não foi possível gerar um código único. Tente de novo.");
      return;
    }

    const newGroup: Group = {
      id,
      adminId: user.uid,
      status: 'WAITING_CHOICES',
      memberIds: [user.uid],
      members: [{
        id: user.uid,
        name: user.name,
        photo: user.photo,
        assignedCeleb: ""
      }],
      createdAt: new Date()
    };

    const userRef = doc(db, "users", user.uid);
    try {
      await runTransaction(db, async (tx) => {
        const userSnap = await tx.get(userRef);
        const userData = userSnap.data() as AppUser | undefined;

        if (!isPlanActive(userData?.plan, userData?.planExpiresAt) && userData?.activeGroupId) {
          throw new Error('LIMIT_ACTIVE_GROUP');
        }

        tx.set(doc(db, "groups", id), newGroup);
        tx.update(userRef, { activeGroupId: id });
      });
    } catch (error: any) {
      if (error.message === 'LIMIT_ACTIVE_GROUP') {
        setErrorMessage("Seu plano free permite só 1 grupo ativo por vez. Exclua o grupo atual ou vire Premium.");
      } else {
        setErrorMessage("Não foi possível criar o grupo. Tente de novo.");
      }
      return;
    }

    setGroup(newGroup);
  };

  const joinGroup = async (targetId?: string) => {
    if (!user) return;
    const idToJoin = (targetId || inputGroupId).toUpperCase();
    if (!idToJoin) return;
    const groupRef = doc(db, "groups", idToJoin);
    const groupSnap = await getDoc(groupRef);

    if (groupSnap.exists()) {
      const groupData = groupSnap.data() as Group;
      const alreadyMember = groupData.memberIds.includes(user.uid);

      if (!alreadyMember && groupData.status !== 'WAITING_CHOICES') {
        setErrorMessage("Essa rodada já começou. Peça pro anfitrião criar um novo grupo.");
        return;
      }

      if (!alreadyMember) {
        const ownerSnap = await getDoc(doc(db, "users", groupData.adminId));
        const ownerData = ownerSnap.data() as AppUser | undefined;
        if (!isPlanActive(ownerData?.plan, ownerData?.planExpiresAt) && groupData.memberIds.length >= 5) {
          setErrorMessage("Esse grupo já atingiu o limite de 5 jogadores do plano gratuito do anfitrião.");
          return;
        }

        const newMember: Player = { id: user.uid, name: user.name, photo: user.photo, assignedCeleb: "" };
        await updateDoc(groupRef, {
          memberIds: arrayUnion(user.uid),
          members: arrayUnion(newMember)
        });
        setGroup({
          ...groupData,
          memberIds: [...groupData.memberIds, user.uid],
          members: [...groupData.members, newMember]
        });
      } else {
        setGroup(groupData);
      }
    } else {
      setErrorMessage("Grupo não encontrado!");
    }
  };

  const confirmGroupAction = async () => {
    if (!groupAction || !user) return;
    const groupRef = doc(db, "groups", groupAction.id);

    if (groupAction.type === 'delete') {
      const batch = writeBatch(db);
      batch.delete(groupRef);
      batch.update(doc(db, "users", user.uid), { activeGroupId: null });
      await batch.commit();
    } else {
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(groupRef);
        if (!snap.exists()) return;
        const data = snap.data() as Group;
        tx.update(groupRef, {
          memberIds: data.memberIds.filter(id => id !== user.uid),
          members: data.members.filter(m => m.id !== user.uid)
        });
      });
    }
    setGroupAction(null);
  };

  if (loading) return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
  );

  if (!user) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 p-6 text-center">
          <h1 className="mb-4 text-7xl font-black tracking-tighter text-white">
            EU SOU<span className="text-indigo-500">?</span>
          </h1>
          <p className="mb-10 max-w-xs text-slate-400">O jogo de celebridades online.</p>
          <button
              onClick={handleGoogleLogin}
              className="flex items-center gap-3 rounded-2xl bg-white px-10 py-4 font-bold text-black transition-all hover:bg-slate-200 active:scale-95 shadow-xl"
          >
            <LogIn size={20} /> Entrar com Google
          </button>
        </div>
    );
  }

  if (!group) {
    return (
        <>
        <div className="min-h-screen w-full bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center overflow-y-auto">
          <div className="w-full max-w-2xl">
            <header className="mb-10 flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
              <div className="flex items-center gap-4">
                <UserAvatar src={user.photo} name={user.name} />
                <div>
                  <h2 className="text-xl font-bold leading-tight">{user.name}</h2>
                  <div className="flex items-center gap-2">
                    {isPlanActive(user.plan, user.planExpiresAt) ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-400">
                      <Crown size={10} /> Premium
                    </span>
                    ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                      <Gamepad2 size={10} /> Free
                    </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => auth.signOut()} className="rounded-xl bg-slate-800 p-3 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all">
                <LogOut size={20} />
              </button>
            </header>

            <div className="grid gap-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <button
                    onClick={createGroup}
                    className="flex flex-col items-center justify-center rounded-3xl border border-indigo-500/30 bg-indigo-600/10 p-8 transition-all hover:bg-indigo-600/20 group shadow-lg"
                >
                  <Plus className="mb-2 text-indigo-400 transition-transform group-hover:scale-110" size={40} />
                  <span className="font-bold text-lg">Criar Grupo</span>
                </button>

                <div className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Hash size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">Entrar em um Grupo</span>
                  </div>
                  <input
                      placeholder="CÓDIGO"
                      className="rounded-2xl border-none bg-slate-800 p-4 text-center font-mono text-2xl font-bold uppercase text-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                      value={inputGroupId}
                      onChange={e => setInputGroupId(e.target.value)}
                  />
                  <button onClick={() => joinGroup()} className="rounded-2xl bg-indigo-600 py-4 font-bold text-white transition-all hover:bg-indigo-500 active:scale-95 shadow-md">
                    ENTRAR AGORA
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  <Users size={16} /> Meus Grupos Ativos
                </h3>
                <div className="space-y-3">
                  {userGroups.length === 0 ? (
                      <div className="rounded-3xl border border-dashed border-slate-800 bg-slate-900/20 py-12 text-center text-slate-500 shadow-inner">
                        Você ainda não está em nenhum grupo.
                      </div>
                  ) : (
                      userGroups.map((g) => (
                          <div
                              key={g.id}
                              className="group flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all hover:border-indigo-500/50 hover:bg-slate-800/50 shadow-sm"
                          >
                            <button onClick={() => joinGroup(g.id)} className="flex items-center gap-4 flex-1 min-w-0 text-left">
                              <div className="flex h-12 items-center justify-center rounded-xl bg-indigo-500/10 px-3 font-mono text-sm font-bold text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shrink-0">
                                {g.id}
                              </div>
                              <div className="text-left min-w-0">
                                <p className="font-bold text-lg leading-tight">Sala de Jogo</p>
                                <p className="text-sm text-slate-500">{g.members.length} Jogadores</p>
                              </div>
                            </button>
                            <div className="flex items-center gap-2 shrink-0">
                              {g.adminId === user.uid ? (
                                  <button
                                      onClick={() => setGroupAction({ id: g.id, type: 'delete' })}
                                      className="p-2.5 rounded-xl text-slate-600 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                  >
                                    <Trash2 size={20} />
                                  </button>
                              ) : (
                                  <button
                                      onClick={() => setGroupAction({ id: g.id, type: 'leave' })}
                                      className="p-2.5 rounded-xl text-slate-600 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                  >
                                    <DoorOpen size={20} />
                                  </button>
                              )}
                              <button onClick={() => joinGroup(g.id)} className="p-2.5">
                                <PlayCircle className="text-slate-700 transition-colors group-hover:text-indigo-500" size={28} />
                              </button>
                            </div>
                          </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <AlertDialog open={!!groupAction} onOpenChange={(open) => !open && setGroupAction(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{groupAction?.type === 'delete' ? 'Excluir grupo?' : 'Sair do grupo?'}</AlertDialogTitle>
              <AlertDialogDescription>
                {groupAction?.type === 'delete'
                    ? 'Essa ação não pode ser desfeita. O grupo e todo o progresso da rodada serão perdidos.'
                    : 'Você precisará de um novo convite para entrar de novo.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmGroupAction}>
                {groupAction?.type === 'delete' ? 'Excluir' : 'Sair'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!errorMessage} onOpenChange={(open) => !open && setErrorMessage(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ops!</AlertDialogTitle>
              <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setErrorMessage(null)}>Entendi</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </>
    );
  }

  return (
      <div className="min-h-screen w-full bg-slate-950 text-white">
        {group.status === 'WAITING_CHOICES' && <ChoicePhase group={group} userId={user.uid} />}

        {group.status === 'STARTING' && (
            <div className="fixed inset-0 z-[10000] bg-indigo-600 flex flex-col items-center justify-center text-white overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500 animate-pulse opacity-50"></div>
              <div className="relative z-10 flex flex-col items-center">
                <p className="text-xl font-black uppercase tracking-[0.4em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-center p-6">
                  Preparem seus celulares!
                </p>
                <CountdownDisplay startingAt={group.startingAt ?? Date.now()} />
              </div>
            </div>
        )}

        {group.status === 'PLAYING' && (
            <InGameDashboard group={group} userId={user.uid} />
        )}
      </div>
  );
}
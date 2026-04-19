import {useEffect, useState} from 'react';
import {auth, db} from './lib/firebase';
import {arrayUnion, collection, doc, getDoc, onSnapshot, query, setDoc, updateDoc, where} from 'firebase/firestore';
import {
  browserLocalPersistence,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect
} from 'firebase/auth';
import {Crown, Gamepad2, Hash, LogIn, LogOut, PlayCircle, Plus, Users} from 'lucide-react';
import ChoicePhase from './components/ChoicePhase';
import GameScreen from './components/GameScreen';

// Componente de Avatar
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

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<any>(null);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [inputGroupId, setInputGroupId] = useState('');
  const [inviteProcessed, setInviteProcessed] = useState(false); // 🔥 NOVO

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        let userData = {
          uid: currentUser.uid,
          name: currentUser.displayName || 'Usuário',
          email: currentUser.email,
          photo: currentUser.photoURL,
          isAdmin: false,
          lastLogin: new Date()
        };

        if (userSnap.exists()) {
          userData.isAdmin = userSnap.data().isAdmin || false;
        } else {
          await setDoc(userRef, userData);
        }

        setUser(userData);
        fetchUserGroups(currentUser.uid);

      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubAuth();
  }, []);

  // 🔥 PROCESSAMENTO CORRETO DO INVITE (SEPARADO DO AUTH)
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

  const fetchUserGroups = (uid: string) => {
    const q = query(collection(db, "groups"), where("memberIds", "array-contains", uid));
    return onSnapshot(q, (snapshot) => {
      const groups = snapshot.docs.map(doc => doc.data());
      setUserGroups(groups);
    });
  };

  useEffect(() => {
    if (!group?.id) return;
    const unsubGroup = onSnapshot(doc(db, "groups", group.id), (doc) => {
      if (doc.exists()) setGroup(doc.data());
    });
    return () => unsubGroup();
  }, [group?.id]);

  const handleJoinByInvite = async (code: string, currentUser: any) => {
    const groupRef = doc(db, "groups", code);
    const groupSnap = await getDoc(groupRef);

    if (groupSnap.exists()) {
      const groupData = groupSnap.data();

      if (!groupData.memberIds.includes(currentUser.uid)) {
        await updateDoc(groupRef, {
          memberIds: arrayUnion(currentUser.uid),
          members: arrayUnion({
            id: currentUser.uid,
            name: currentUser.name,
            photo: currentUser.photo,
            assignedCeleb: ""
          })
        });
      }

      setGroup(groupSnap.data());

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
    const id = Math.random().toString(36).substring(2, 7).toUpperCase();
    const newGroup = {
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
    await setDoc(doc(db, "groups", id), newGroup);
    setGroup(newGroup);
  };

  const joinGroup = async (targetId?: string) => {
    const idToJoin = (targetId || inputGroupId).toUpperCase();
    if (!idToJoin) return;
    const groupRef = doc(db, "groups", idToJoin);
    const groupSnap = await getDoc(groupRef);

    if (groupSnap.exists()) {
      const groupData = groupSnap.data();
      if (!groupData.memberIds.includes(user.uid)) {
        await updateDoc(groupRef, {
          memberIds: arrayUnion(user.uid),
          members: arrayUnion({
            id: user.uid,
            name: user.name,
            photo: user.photo,
            assignedCeleb: ""
          })
        });
      }
      setGroup(groupData);
    } else {
      alert("Grupo não encontrado!");
    }
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
              className="flex items-center gap-3 rounded-2xl bg-white px-10 py-4 font-bold text-black transition-all hover:bg-slate-200 active:scale-95"
          >
            <LogIn size={20} /> Entrar com Google
          </button>
        </div>
    );
  }

  if (!group) {
    return (
        <div className="min-h-screen w-full bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center overflow-y-auto">
          <div className="w-full max-w-2xl">
            <header className="mb-10 flex items-center justify-between rounded-3xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl">
              <div className="flex items-center gap-4">
                <UserAvatar src={user.photo} name={user.name} />
                <div>
                  <h2 className="text-xl font-bold leading-tight">{user.name}</h2>
                  <div className="flex items-center gap-2">
                    {user.isAdmin ? (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-400">
                      <Crown size={10} /> Admin
                    </span>
                    ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                      <Gamepad2 size={10} /> Jogador
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
                {user.isAdmin && (
                    <button
                        onClick={createGroup}
                        className="flex flex-col items-center justify-center rounded-3xl border border-indigo-500/30 bg-indigo-600/10 p-8 transition-all hover:bg-indigo-600/20 group shadow-lg"
                    >
                      <Plus className="mb-2 text-indigo-400 transition-transform group-hover:scale-110" size={40} />
                      <span className="font-bold text-lg">Criar Grupo</span>
                    </button>
                )}

                <div className={`flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-lg ${!user.isAdmin ? 'md:col-span-2' : ''}`}>
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
                          <button
                              key={g.id}
                              onClick={() => joinGroup(g.id)}
                              className="group flex w-full items-center justify-between rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all hover:border-indigo-500/50 hover:bg-slate-800/50 shadow-sm"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 font-mono text-xl font-bold text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                {g.id}
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-lg leading-tight">Sala de Jogo</p>
                                <p className="text-sm text-slate-500">{g.members.length} Jogadores</p>
                              </div>
                            </div>
                            <PlayCircle className="text-slate-700 transition-colors group-hover:text-indigo-500" size={28} />
                          </button>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen w-full bg-slate-950 text-white">
        {group.status === 'WAITING_CHOICES' && <ChoicePhase group={group} userId={user.uid} />}
        // No seu App.tsx, substitua o trecho de retorno do status 'STARTING' e 'PLAYING' por este:

        {group.status === 'STARTING' && (
            <div className="fixed inset-0 z-[10000] bg-indigo-600 flex flex-col items-center justify-center text-white overflow-hidden">
              <div className="absolute inset-0 bg-indigo-500 animate-pulse opacity-50"></div>

              <div className="relative z-10 flex flex-col items-center">
                <p className="text-xl font-black uppercase tracking-[0.4em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  Prepare sua testa!
                </p>

                <CountdownDisplay />
              </div>

              <p className="absolute bottom-10 text-indigo-200 text-xs font-bold uppercase tracking-widest">
                Gire o celular para o lado
              </p>
            </div>
        )}

        {group.status === 'PLAYING' && (
            <GameScreen group={group} userId={user.uid} />
        )}
      </div>
  );
}

const CountdownDisplay = () => {
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count <= 0) return;
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count]);

  return (
      <div key={count} className="text-[35vw] font-black leading-none animate-in zoom-in-50 fade-in duration-300">
        {count > 0 ? count : "VAI!"}
      </div>
  );
};
import { useEffect, useRef, useState } from 'react';
import { signInWithCustomToken } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

export default function Sso() {
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const ranRef = useRef(false);

    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;

        const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
        const token = new URLSearchParams(hash).get('token');

        // Remove o token do histórico do navegador assim que lido, antes de tentar usá-lo.
        window.history.replaceState(null, '', '/sso');

        if (!token) {
            navigate('/', { replace: true });
            return;
        }

        signInWithCustomToken(auth, token)
            .then(() => navigate('/', { replace: true }))
            .catch((err) => {
                console.error('Erro ao autenticar via SSO:', err);
                setError(true);
            });
    }, [navigate]);

    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-950">
            {error ? (
                <div className="text-center space-y-3">
                    <p className="text-white">Não foi possível entrar automaticamente.</p>
                    <a href="/" className="text-indigo-400 underline">Ir para o início</a>
                </div>
            ) : (
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            )}
        </div>
    );
}

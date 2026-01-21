import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      console.error(err);
      setError('Credenciales inválidas. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Fondo Decorativo */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-30"></div>
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-[100px]"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md bg-white/5 border border-white/10 backdrop-blur-md p-8 md:p-10 rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
        
        <div className="text-center mb-10">
          <img 
            src="/images/kebablogo.png" 
            alt="Logo" 
            className="h-16 mx-auto mb-6 object-contain"
          />
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Lalezar', cursive" }}>
            Panel <span className="text-[#FFD700]">Admin</span>
          </h1>
          <p className="text-gray-400 text-sm">Ingresa tus credenciales para gestionar el restaurante</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
            <i className="bi bi-exclamation-triangle-fill"></i> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-gray-500 ml-1">Correo Electrónico</label>
            <div className="relative">
              <i className="bi bi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
              <input
                type="email"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] outline-none transition-all"
                placeholder="admin@kebab.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider font-bold text-gray-500 ml-1">Contraseña</label>
            <div className="relative">
              <i className="bi bi-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
              <input
                type="password"
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700] outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFD700] hover:bg-yellow-500 text-black font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest shadow-lg shadow-[#FFD700]/20"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">
            Sistema Protegido por Limitless Solutions
          </p>
        </div>
      </div>
    </div>
  );
}
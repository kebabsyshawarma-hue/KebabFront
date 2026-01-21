import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin', icon: 'bi-speedometer2', label: 'Dashboard' },
    { path: '/admin/menu', icon: 'bi-grid', label: 'Menú' },
    { path: '/admin/categories', icon: 'bi-bookmarks', label: 'Categorías' },
    { path: '/admin/zones', icon: 'bi-geo-alt', label: 'Zonas' },
    { path: '/admin/hero', icon: 'bi-images', label: 'Banners' },
  ];

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden selection:bg-[#FFD700] selection:text-black">
      
      {/* Sidebar Premium */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col hidden md:flex">
        
        {/* Header Branding */}
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FFD700] rounded-lg flex items-center justify-center text-black font-black text-xs">
              K
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide text-white leading-none">KEBAB</h1>
              <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase">Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <p className="px-2 text-[10px] uppercase tracking-widest text-gray-600 font-bold mb-2">Principal</p>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                  ${isActive 
                    ? 'bg-white/5 text-white' 
                    : 'text-gray-400 hover:bg-white/[0.02] hover:text-gray-200'}
                `}
              >
                {/* Indicador activo (línea dorada sutil) */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FFD700] rounded-r-full shadow-[0_0_10px_#FFD700]"></span>
                )}
                
                <i className={`bi ${item.icon} text-base transition-colors ${isActive ? 'text-[#FFD700]' : 'text-gray-500 group-hover:text-gray-300'}`}></i>
                <span className={isActive ? 'ml-1' : ''}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User / Logout */}
        <div className="p-4 border-t border-white/5">
          <div className="bg-white/5 rounded-xl p-3 flex items-center justify-between group cursor-pointer hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold">
                AD
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Admin</span>
                <span className="text-[10px] text-gray-500">Online</span>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-400 transition-colors p-1"
              title="Cerrar Sesión"
            >
              <i className="bi bi-box-arrow-right text-lg"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 flex-shrink-0">
          <span className="font-bold text-[#FFD700]">KEBAB ADMIN</span>
          <button onClick={handleLogout} className="text-gray-400"><i className="bi bi-box-arrow-right text-xl"></i></button>
        </header>

        {/* Content Scrollable */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-[#050505]">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#0a0a0a] border-t border-white/10 flex justify-around p-3 z-50 backdrop-blur-lg bg-opacity-90">
        {navItems.map((item) => {
           const isActive = location.pathname === item.path;
           return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 ${isActive ? 'text-[#FFD700]' : 'text-gray-600'}`}
            >
              <i className={`bi ${item.icon} text-xl ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]' : ''}`}></i>
              <span className="text-[9px] uppercase font-bold tracking-wider">{item.label}</span>
            </Link>
          )
        })}
      </nav>

    </div>
  );
}
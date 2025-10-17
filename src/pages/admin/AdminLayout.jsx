import { Link, Outlet } from 'react-router-dom';
import '../../styles/admin-layout.css'; // Adjusted path
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLayout() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="admin-layout hide-social-widgets">
      <aside className="admin-sidebar">
        <h2 className="mb-4">Admin</h2>
        <nav className="nav flex-column">
          <Link className="nav-link" to="/admin">Pedidos</Link>
          <Link className="nav-link" to="/admin/menu">Gestionar Menú</Link>
          <Link className="nav-link" to="/admin/hero">Gestionar Hero</Link>
          <button className="nav-link btn btn-link text-start" onClick={handleLogout} style={{ color: 'inherit', textDecoration: 'none' }}>Cerrar Sesión</button>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
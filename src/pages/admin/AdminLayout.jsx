import { Link, Outlet } from 'react-router-dom';
import '../../styles/admin-layout.css'; // Adjusted path

export default function AdminLayout() {
  return (
    <div className="admin-layout hide-social-widgets">
      <aside className="admin-sidebar">
        <h2 className="mb-4">Admin</h2>
        <nav className="nav flex-column">
          <Link className="nav-link" to="/admin">Pedidos</Link>
          <Link className="nav-link" to="/admin/menu">Gestionar Menú</Link>
          <Link className="nav-link" to="/admin/hero">Gestionar Hero</Link>
        </nav>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
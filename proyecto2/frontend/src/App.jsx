import { Routes, Route, NavLink } from 'react-router-dom'
import Productos from './pages/Productos'
import Clientes from './pages/Clientes'
import Ventas from './pages/Ventas'
import Reportes from './pages/Reportes'

export default function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f5f5f5' }}>
      <nav style={{
        background: '#1a1a2e', padding: '1rem 2rem',
        display: 'flex', gap: '2rem', alignItems: 'center'
      }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem', marginRight: '2rem' }}>
          🛒 Tienda
        </span>
        {[
          { to: '/', label: 'Productos' },
          { to: '/clientes', label: 'Clientes' },
          { to: '/ventas', label: 'Ventas' },
          { to: '/reportes', label: 'Reportes' },
        ].map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            style={({ isActive }) => ({
              color: isActive ? '#e94560' : '#ccc',
              textDecoration: 'none',
              fontWeight: isActive ? 'bold' : 'normal',
              borderBottom: isActive ? '2px solid #e94560' : '2px solid transparent',
              paddingBottom: '4px'
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <main style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Productos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/reportes" element={<Reportes />} />
        </Routes>
      </main>
    </div>
  )
}
import { useState } from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { isAuthenticated, getUser, clearSession, hasRole } from './auth'
import Login from './pages/Login'
import Productos from './pages/Productos'
import Clientes from './pages/Clientes'
import Ventas from './pages/Ventas'
import Reportes from './pages/Reportes'
import Bodega from './pages/Bodega'

export default function App() {
  const [autenticado, setAutenticado] = useState(isAuthenticated())
  const user = getUser()

  function handleLogin() {
    setAutenticado(true)
  }

  function handleLogout() {
    clearSession()
    setAutenticado(false)
  }

  if (!autenticado) {
    return <Login onLogin={handleLogin} />
  }

  const links = [
    { to: '/', label: 'Productos', roles: ['gerente', 'supervisor', 'vendedor', 'cajero', 'bodeguero'] },
    { to: '/clientes', label: 'Clientes', roles: ['gerente', 'supervisor', 'vendedor'] },
    { to: '/ventas', label: 'Ventas', roles: ['gerente', 'supervisor', 'vendedor', 'cajero'] },
    { to: '/reportes', label: 'Reportes', roles: ['gerente', 'supervisor'] },
    { to: '/bodega', label: 'Bodega', roles: ['gerente', 'supervisor', 'bodeguero'] },
  ]

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: '#f5f5f5' }}>
      <nav style={{
        background: '#1a1a2e', padding: '1rem 2rem',
        display: 'flex', gap: '2rem', alignItems: 'center'
      }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.2rem', marginRight: '2rem' }}>
          🛒 Tienda
        </span>
        {links
          .filter(link => hasRole(...link.roles))
          .map(link => (
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

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#ccc', fontSize: '0.9rem' }}>
            👤 {user?.username} ({user?.rol})
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: '#e94560', color: 'white', border: 'none',
              padding: '6px 14px', borderRadius: '6px',
              cursor: 'pointer', fontWeight: 'bold'
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      <main style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Productos />} />
          <Route path="/clientes" element={
            hasRole('gerente', 'supervisor', 'vendedor') ? <Clientes /> : <Navigate to="/" />
          } />
          <Route path="/ventas" element={
            hasRole('gerente', 'supervisor', 'vendedor', 'cajero') ? <Ventas /> : <Navigate to="/" />
          } />
          <Route path="/reportes" element={
            hasRole('gerente', 'supervisor') ? <Reportes /> : <Navigate to="/" />
          } />
          <Route path="/bodega" element={
            hasRole('gerente', 'supervisor', 'bodeguero') ? <Bodega /> : <Navigate to="/" />
          } />
        </Routes>
      </main>
    </div>
  )
}
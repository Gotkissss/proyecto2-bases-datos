import { useState } from 'react'
import { saveSession } from '../auth'

const API = 'http://localhost:8000'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [registrando, setRegistrando] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const body = new URLSearchParams({ username, password })
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error al iniciar sesión')
      saveSession(data.access_token, data.username, data.rol)
      onLogin()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rol: 'empleado' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error al registrar')
      setRegistrando(false)
      alert('Usuario creado. Ahora inicia sesión.')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#1a1a2e',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'white', padding: '2.5rem', borderRadius: '12px',
        width: '360px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <h2 style={{ marginTop: 0, textAlign: 'center' }}>🛒 Tienda</h2>
        <h3 style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>
          {registrando ? 'Crear cuenta' : 'Iniciar sesión'}
        </h3>

        {error && (
          <div style={{
            background: '#ffe0e0', color: '#c00',
            padding: '10px', borderRadius: '6px', marginBottom: '1rem'
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={registrando ? handleRegister : handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Usuario</label>
            <input
              style={{
                width: '100%', padding: '10px', borderRadius: '6px',
                border: '1px solid #ccc', boxSizing: 'border-box'
              }}
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="usuario"
              required
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '4px' }}>Contraseña</label>
            <input
              type="password"
              style={{
                width: '100%', padding: '10px', borderRadius: '6px',
                border: '1px solid #ccc', boxSizing: 'border-box'
              }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px', background: '#e94560',
              color: 'white', border: 'none', borderRadius: '6px',
              fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer'
            }}
          >
            {loading ? 'Cargando...' : registrando ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
          {registrando ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
          <span
            style={{ color: '#e94560', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={() => { setRegistrando(!registrando); setError(null) }}
          >
            {registrando ? 'Inicia sesión' : 'Regístrate'}
          </span>
        </p>
      </div>
    </div>
  )
}
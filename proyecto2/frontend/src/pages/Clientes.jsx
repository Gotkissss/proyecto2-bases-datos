import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

const estilos = {
  tabla: { borderCollapse: 'collapse', width: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  th: { background: '#1a1a2e', color: 'white', padding: '12px', textAlign: 'left' },
  td: { padding: '10px 12px', borderBottom: '1px solid #eee' },
  btn: { padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' },
  btnVerde: { background: '#4caf50', color: 'white' },
  btnRojo: { background: '#e94560', color: 'white' },
  btnAzul: { background: '#1a1a2e', color: 'white' },
  input: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' },
  form: { background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  error: { background: '#ffe0e0', color: '#c00', padding: '10px', borderRadius: '6px', marginBottom: '1rem' },
  success: { background: '#e0ffe0', color: '#060', padding: '10px', borderRadius: '6px', marginBottom: '1rem' },
}

const formVacio = { nombre: '', apellido: '', telefono: '', email: '' }

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [form, setForm] = useState(formVacio)
  const [editandoId, setEditandoId] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { cargarClientes() }, [])

  async function cargarClientes() {
    const data = await fetch(`${API}/clientes`).then(r => r.json())
    setClientes(data)
  }

  function mostrarMensaje(texto, esError = false) {
    if (esError) { setError(texto); setMensaje(null) }
    else { setMensaje(texto); setError(null) }
    setTimeout(() => { setError(null); setMensaje(null) }, 3000)
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function abrirCrear() {
    setForm(formVacio)
    setEditandoId(null)
    setMostrarForm(true)
  }

  function abrirEditar(c) {
    setForm({ nombre: c.nombre, apellido: c.apellido, telefono: c.telefono || '', email: c.email || '' })
    setEditandoId(c.id_cliente)
    setMostrarForm(true)
  }

  function cancelar() {
    setForm(formVacio)
    setEditandoId(null)
    setMostrarForm(false)
  }

  async function guardar() {
    if (!form.nombre || !form.apellido) {
      mostrarMensaje('Nombre y apellido son obligatorios', true)
      return
    }
    setLoading(true)
    try {
      const url = editandoId ? `${API}/clientes/${editandoId}` : `${API}/clientes`
      const method = editandoId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error al guardar')
      mostrarMensaje(editandoId ? 'Cliente actualizado' : 'Cliente creado')
      cancelar()
      cargarClientes()
    } catch (e) {
      mostrarMensaje(e.message, true)
    } finally {
      setLoading(false)
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este cliente?')) return
    try {
      const res = await fetch(`${API}/clientes/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error al eliminar')
      mostrarMensaje('Cliente eliminado')
      cargarClientes()
    } catch (e) {
      mostrarMensaje(e.message, true)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>👥 Clientes</h2>
        <button style={{ ...estilos.btn, ...estilos.btnAzul }} onClick={abrirCrear}>+ Nuevo Cliente</button>
      </div>

      {error && <div style={estilos.error}>❌ {error}</div>}
      {mensaje && <div style={estilos.success}>✅ {mensaje}</div>}

      {mostrarForm && (
        <div style={estilos.form}>
          <h3 style={{ marginTop: 0 }}>{editandoId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
          <div style={estilos.grid}>
            <div>
              <label>Nombre *</label>
              <input style={estilos.input} name="nombre" value={form.nombre} onChange={handleChange} />
            </div>
            <div>
              <label>Apellido *</label>
              <input style={estilos.input} name="apellido" value={form.apellido} onChange={handleChange} />
            </div>
            <div>
              <label>Teléfono</label>
              <input style={estilos.input} name="telefono" value={form.telefono} onChange={handleChange} />
            </div>
            <div>
              <label>Email</label>
              <input style={estilos.input} name="email" type="email" value={form.email} onChange={handleChange} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{ ...estilos.btn, ...estilos.btnVerde }} onClick={guardar} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
            <button style={{ ...estilos.btn, background: '#ccc' }} onClick={cancelar}>Cancelar</button>
          </div>
        </div>
      )}

      <table style={estilos.tabla}>
        <thead>
          <tr>
            {['ID', 'Nombre', 'Apellido', 'Teléfono', 'Email', 'Acciones'].map(h => (
              <th key={h} style={estilos.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c.id_cliente}>
              <td style={estilos.td}>{c.id_cliente}</td>
              <td style={estilos.td}>{c.nombre}</td>
              <td style={estilos.td}>{c.apellido}</td>
              <td style={estilos.td}>{c.telefono || '—'}</td>
              <td style={estilos.td}>{c.email || '—'}</td>
              <td style={estilos.td}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ ...estilos.btn, ...estilos.btnAzul }} onClick={() => abrirEditar(c)}>Editar</button>
                  <button style={{ ...estilos.btn, ...estilos.btnRojo }} onClick={() => eliminar(c.id_cliente)}>Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
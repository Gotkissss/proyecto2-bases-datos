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

const formVacio = { nombre: '', descripcion: '', precio: '', stock: '', id_categoria: '', id_proveedor: '' }

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [form, setForm] = useState(formVacio)
  const [editandoId, setEditandoId] = useState(null)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [])

  async function cargarDatos() {
    const [p, c, pr] = await Promise.all([
      fetch(`${API}/productos`).then(r => r.json()),
      fetch(`${API}/categorias`).then(r => r.json()),
      fetch(`${API}/proveedores`).then(r => r.json()),
    ])
    setProductos(p)
    setCategorias(c)
    setProveedores(pr)
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

  function abrirEditar(p) {
    setForm({
      nombre: p.nombre, descripcion: p.descripcion || '',
      precio: p.precio, stock: p.stock,
      id_categoria: p.id_categoria, id_proveedor: p.id_proveedor
    })
    setEditandoId(p.id_producto)
    setMostrarForm(true)
  }

  function cancelar() {
    setForm(formVacio)
    setEditandoId(null)
    setMostrarForm(false)
  }

  async function guardar() {
    if (!form.nombre || !form.precio || !form.stock || !form.id_categoria || !form.id_proveedor) {
      mostrarMensaje('Completa todos los campos obligatorios', true)
      return
    }
    setLoading(true)
    const body = {
      nombre: form.nombre, descripcion: form.descripcion,
      precio: parseFloat(form.precio), stock: parseInt(form.stock),
      id_categoria: parseInt(form.id_categoria), id_proveedor: parseInt(form.id_proveedor)
    }
    try {
      const url = editandoId ? `${API}/productos/${editandoId}` : `${API}/productos`
      const method = editandoId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error al guardar')
      mostrarMensaje(editandoId ? 'Producto actualizado' : 'Producto creado')
      cancelar()
      cargarDatos()
    } catch (e) {
      mostrarMensaje(e.message, true)
    } finally {
      setLoading(false)
    }
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      const res = await fetch(`${API}/productos/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error al eliminar')
      mostrarMensaje('Producto eliminado')
      cargarDatos()
    } catch (e) {
      mostrarMensaje(e.message, true)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>Productos</h2>
        <button style={{ ...estilos.btn, ...estilos.btnAzul }} onClick={abrirCrear}>+ Nuevo Producto</button>
      </div>

      {error && <div style={estilos.error}>❌ {error}</div>}
      {mensaje && <div style={estilos.success}>✅ {mensaje}</div>}

      {mostrarForm && (
        <div style={estilos.form}>
          <h3 style={{ marginTop: 0 }}>{editandoId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <div style={estilos.grid}>
            <div>
              <label>Nombre *</label>
              <input style={estilos.input} name="nombre" value={form.nombre} onChange={handleChange} />
            </div>
            <div>
              <label>Precio (Q) *</label>
              <input style={estilos.input} name="precio" type="number" value={form.precio} onChange={handleChange} />
            </div>
            <div>
              <label>Stock *</label>
              <input style={estilos.input} name="stock" type="number" value={form.stock} onChange={handleChange} />
            </div>
            <div>
              <label>Categoría *</label>
              <select style={estilos.input} name="id_categoria" value={form.id_categoria} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label>Proveedor *</label>
              <select style={estilos.input} name="id_proveedor" value={form.id_proveedor} onChange={handleChange}>
                <option value="">Seleccionar...</option>
                {proveedores.map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label>Descripción</label>
              <input style={estilos.input} name="descripcion" value={form.descripcion} onChange={handleChange} />
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
            {['ID', 'Nombre', 'Precio', 'Stock', 'Categoría', 'Proveedor', 'Acciones'].map(h => (
              <th key={h} style={estilos.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id_producto}>
              <td style={estilos.td}>{p.id_producto}</td>
              <td style={estilos.td}>{p.nombre}</td>
              <td style={estilos.td}>Q{p.precio.toFixed(2)}</td>
              <td style={estilos.td}>
                <span style={{ color: p.stock < 20 ? '#e94560' : '#060', fontWeight: 'bold' }}>
                  {p.stock}
                </span>
              </td>
              <td style={estilos.td}>{p.categoria}</td>
              <td style={estilos.td}>{p.proveedor}</td>
              <td style={estilos.td}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ ...estilos.btn, ...estilos.btnAzul }} onClick={() => abrirEditar(p)}>Editar</button>
                  <button style={{ ...estilos.btn, ...estilos.btnRojo }} onClick={() => eliminar(p.id_producto)}>Eliminar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
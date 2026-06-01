import { useEffect, useState } from 'react'
import { getToken } from '../auth'

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
  error: { background: '#ffe0e0', color: '#c00', padding: '10px', borderRadius: '6px', marginBottom: '1rem' },
  success: { background: '#e0ffe0', color: '#060', padding: '10px', borderRadius: '6px', marginBottom: '1rem' },
}

export default function Bodega() {
  const [productos, setProductos] = useState([])
  const [idProducto, setIdProducto] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [operacion, setOperacion] = useState('incrementar')
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => { cargarProductos() }, [])

  async function cargarProductos() {
    const data = await fetch(`${API}/productos`).then(r => r.json())
    setProductos(data)
  }

  function mostrarMensaje(texto, esError = false) {
    if (esError) { setError(texto); setMensaje(null) }
    else { setMensaje(texto); setError(null) }
    setTimeout(() => { setError(null); setMensaje(null) }, 4000)
  }

  async function ajustar() {
    if (!idProducto) {
      mostrarMensaje('Selecciona un producto', true)
      return
    }
    if (cantidad < 1) {
      mostrarMensaje('La cantidad debe ser mayor a 0', true)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/productos/ajustar-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          id_producto: parseInt(idProducto),
          cantidad: parseInt(cantidad),
          operacion
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error al ajustar stock')
      mostrarMensaje(`${data.mensaje} — Stock actual: ${data.stock_nuevo}`)
      cargarProductos()
    } catch (e) {
      mostrarMensaje(e.message, true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: '1rem' }}>📦 Ajuste de Stock</h2>

      {error && <div style={estilos.error}>❌ {error}</div>}
      {mensaje && <div style={estilos.success}>✅ {mensaje}</div>}

      <div style={estilos.form}>
        <h3 style={{ marginTop: 0 }}>Registrar movimiento de stock</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label>Producto</label>
            <select style={estilos.input} value={idProducto} onChange={e => setIdProducto(e.target.value)}>
              <option value="">Seleccionar...</option>
              {productos.map(p => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre} (stock: {p.stock})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Cantidad</label>
            <input
              style={estilos.input}
              type="number"
              min="1"
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
            />
          </div>
          <div>
            <label>Operación</label>
            <select style={estilos.input} value={operacion} onChange={e => setOperacion(e.target.value)}>
              <option value="incrementar">Incrementar</option>
              <option value="decrementar">Decrementar</option>
            </select>
          </div>
          <button
            style={{ ...estilos.btn, ...estilos.btnVerde }}
            onClick={ajustar}
            disabled={loading}
          >
            {loading ? 'Procesando...' : 'Aplicar'}
          </button>
        </div>
      </div>

      <table style={estilos.tabla}>
        <thead>
          <tr>
            {['ID', 'Producto', 'Categoría', 'Stock Actual', 'Precio'].map(h => (
              <th key={h} style={estilos.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {productos.map(p => (
            <tr key={p.id_producto}>
              <td style={estilos.td}>{p.id_producto}</td>
              <td style={estilos.td}>{p.nombre}</td>
              <td style={estilos.td}>{p.categoria}</td>
              <td style={estilos.td}>
                <span style={{ color: p.stock < 20 ? '#e94560' : '#060', fontWeight: 'bold' }}>
                  {p.stock}
                </span>
              </td>
              <td style={estilos.td}>Q{p.precio.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
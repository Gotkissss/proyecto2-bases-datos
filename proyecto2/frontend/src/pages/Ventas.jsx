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
  btnGris: { background: '#ccc', color: '#333' },
  input: { padding: '8px', borderRadius: '6px', border: '1px solid #ccc', width: '100%', boxSizing: 'border-box' },
  form: { background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '1.5rem' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' },
  error: { background: '#ffe0e0', color: '#c00', padding: '10px', borderRadius: '6px', marginBottom: '1rem' },
  success: { background: '#e0ffe0', color: '#060', padding: '10px', borderRadius: '6px', marginBottom: '1rem' },
  modal: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: 'white', padding: '2rem', borderRadius: '8px', width: '600px', maxHeight: '80vh', overflowY: 'auto' },
}

export default function Ventas() {
  const [ventas, setVentas] = useState([])
  const [clientes, setClientes] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [productos, setProductos] = useState([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [detalleVenta, setDetalleVenta] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const [idCliente, setIdCliente] = useState('')
  const [idEmpleado, setIdEmpleado] = useState('')
  const [lineas, setLineas] = useState([{ id_producto: '', cantidad: 1 }])

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    const [v, c, e, p] = await Promise.all([
      fetch(`${API}/ventas`).then(r => r.json()),
      fetch(`${API}/clientes`).then(r => r.json()),
      fetch(`${API}/empleados`).then(r => r.json()),
      fetch(`${API}/productos`).then(r => r.json()),
    ])
    setVentas(v)
    setClientes(c)
    setEmpleados(e)
    setProductos(p)
  }

  function mostrarMensaje(texto, esError = false) {
    if (esError) { setError(texto); setMensaje(null) }
    else { setMensaje(texto); setError(null) }
    setTimeout(() => { setError(null); setMensaje(null) }, 4000)
  }

  function agregarLinea() {
    setLineas([...lineas, { id_producto: '', cantidad: 1 }])
  }

  function eliminarLinea(i) {
    setLineas(lineas.filter((_, idx) => idx !== i))
  }

  function cambiarLinea(i, campo, valor) {
    const nuevas = [...lineas]
    nuevas[i][campo] = valor
    setLineas(nuevas)
  }

  function calcularTotal() {
    return lineas.reduce((acc, l) => {
      const prod = productos.find(p => p.id_producto === parseInt(l.id_producto))
      return acc + (prod ? prod.precio * parseInt(l.cantidad || 0) : 0)
    }, 0)
  }

  async function registrarVenta() {
    if (!idCliente || !idEmpleado) {
      mostrarMensaje('Selecciona cliente y empleado', true)
      return
    }
    if (lineas.some(l => !l.id_producto || l.cantidad < 1)) {
      mostrarMensaje('Completa todos los productos y cantidades', true)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_cliente: parseInt(idCliente),
          id_empleado: parseInt(idEmpleado),
          productos: lineas.map(l => ({
            id_producto: parseInt(l.id_producto),
            cantidad: parseInt(l.cantidad)
          }))
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Error al registrar venta')
      mostrarMensaje(`Venta #${data.id_venta} registrada — Total: Q${data.total.toFixed(2)}`)
      setMostrarForm(false)
      setIdCliente('')
      setIdEmpleado('')
      setLineas([{ id_producto: '', cantidad: 1 }])
      cargarDatos()
    } catch (e) {
      mostrarMensaje(e.message, true)
    } finally {
      setLoading(false)
    }
  }

  async function verDetalle(id_venta) {
    const data = await fetch(`${API}/ventas/${id_venta}/detalle`).then(r => r.json())
    setDetalleVenta({ id_venta, items: data })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ margin: 0 }}>🧾 Ventas</h2>
        <button style={{ ...estilos.btn, ...estilos.btnAzul }} onClick={() => setMostrarForm(true)}>
          + Nueva Venta
        </button>
      </div>

      {error && <div style={estilos.error}>❌ {error}</div>}
      {mensaje && <div style={estilos.success}>✅ {mensaje}</div>}

      {mostrarForm && (
        <div style={estilos.form}>
          <h3 style={{ marginTop: 0 }}>Nueva Venta</h3>
          <div style={estilos.grid}>
            <div>
              <label>Cliente *</label>
              <select style={estilos.input} value={idCliente} onChange={e => setIdCliente(e.target.value)}>
                <option value="">Seleccionar...</option>
                {clientes.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido}</option>)}
              </select>
            </div>
            <div>
              <label>Empleado *</label>
              <select style={estilos.input} value={idEmpleado} onChange={e => setIdEmpleado(e.target.value)}>
                <option value="">Seleccionar...</option>
                {empleados.map(e => <option key={e.id_empleado} value={e.id_empleado}>{e.nombre} {e.apellido}</option>)}
              </select>
            </div>
          </div>

          <h4>Productos</h4>
          {lineas.map((linea, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem', marginBottom: '0.5rem', alignItems: 'end' }}>
              <div>
                <label>Producto *</label>
                <select style={estilos.input} value={linea.id_producto} onChange={e => cambiarLinea(i, 'id_producto', e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {productos.map(p => <option key={p.id_producto} value={p.id_producto}>{p.nombre} (Stock: {p.stock}) — Q{p.precio}</option>)}
                </select>
              </div>
              <div>
                <label>Cantidad *</label>
                <input style={estilos.input} type="number" min="1" value={linea.cantidad} onChange={e => cambiarLinea(i, 'cantidad', e.target.value)} />
              </div>
              <button style={{ ...estilos.btn, ...estilos.btnRojo }} onClick={() => eliminarLinea(i)} disabled={lineas.length === 1}>✕</button>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <button style={{ ...estilos.btn, ...estilos.btnGris }} onClick={agregarLinea}>+ Agregar producto</button>
            <strong style={{ fontSize: '1.1rem' }}>Total estimado: Q{calcularTotal().toFixed(2)}</strong>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button style={{ ...estilos.btn, ...estilos.btnVerde }} onClick={registrarVenta} disabled={loading}>
              {loading ? 'Registrando...' : 'Registrar Venta'}
            </button>
            <button style={{ ...estilos.btn, ...estilos.btnGris }} onClick={() => setMostrarForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <table style={estilos.tabla}>
        <thead>
          <tr>
            {['ID', 'Fecha', 'Cliente', 'Empleado', 'Total', 'Acciones'].map(h => (
              <th key={h} style={estilos.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ventas.map(v => (
            <tr key={v.id_venta}>
              <td style={estilos.td}>#{v.id_venta}</td>
              <td style={estilos.td}>{new Date(v.fecha).toLocaleDateString('es-GT')}</td>
              <td style={estilos.td}>{v.cliente}</td>
              <td style={estilos.td}>{v.empleado}</td>
              <td style={estilos.td}><strong>Q{v.total.toFixed(2)}</strong></td>
              <td style={estilos.td}>
                <button style={{ ...estilos.btn, ...estilos.btnAzul }} onClick={() => verDetalle(v.id_venta)}>
                  Ver detalle
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {detalleVenta && (
        <div style={estilos.modal}>
          <div style={estilos.modalContent}>
            <h3>Detalle Venta #{detalleVenta.id_venta}</h3>
            <table style={estilos.tabla}>
              <thead>
                <tr>
                  {['Producto', 'Cantidad', 'Precio Unit.', 'Subtotal'].map(h => (
                    <th key={h} style={estilos.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detalleVenta.items.map(item => (
                  <tr key={item.id_detalle}>
                    <td style={estilos.td}>{item.producto}</td>
                    <td style={estilos.td}>{item.cantidad}</td>
                    <td style={estilos.td}>Q{item.precio_unitario.toFixed(2)}</td>
                    <td style={estilos.td}>Q{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button style={{ ...estilos.btn, ...estilos.btnAzul }} onClick={() => setDetalleVenta(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
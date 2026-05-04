import { useEffect, useState } from 'react'

const API = 'http://localhost:8000'

const estilos = {
  tabla: { borderCollapse: 'collapse', width: '100%', background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginTop: '1rem' },
  th: { background: '#1a1a2e', color: 'white', padding: '12px', textAlign: 'left' },
  td: { padding: '10px 12px', borderBottom: '1px solid #eee' },
  card: { background: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' },
  badge: { display: 'inline-block', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '10px' },
  badgeAzul: { background: '#e3f0ff', color: '#1a1a2e' },
  badgeVerde: { background: '#e0ffe0', color: '#060' },
  badgeNaranja: { background: '#fff3e0', color: '#a04000' },
  badgeMorado: { background: '#f3e0ff', color: '#5a0080' },
}

function TablaGenerica({ columnas, datos, renderFila }) {
  return (
    <table style={estilos.tabla}>
      <thead>
        <tr>{columnas.map(c => <th key={c} style={estilos.th}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {datos.length === 0
          ? <tr><td style={estilos.td} colSpan={columnas.length}>Sin datos</td></tr>
          : datos.map((fila, i) => <tr key={i}>{renderFila(fila)}</tr>)
        }
      </tbody>
    </table>
  )
}

export default function Reportes() {
  const [resumenVentas, setResumenVentas] = useState([])
  const [clientesConVentas, setClientesConVentas] = useState([])
  const [productosBajoStock, setProductosBajoStock] = useState([])
  const [ventasPorCliente, setVentasPorCliente] = useState([])
  const [productosMasVendidos, setProductosMasVendidos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const [rv, cv, pb, vpc, pmv] = await Promise.all([
        fetch(`${API}/reportes/resumen-ventas`).then(r => r.json()),
        fetch(`${API}/reportes/clientes-con-ventas`).then(r => r.json()),
        fetch(`${API}/reportes/productos-bajo-stock`).then(r => r.json()),
        fetch(`${API}/reportes/ventas-por-cliente`).then(r => r.json()),
        fetch(`${API}/reportes/productos-mas-vendidos`).then(r => r.json()),
      ])
      setResumenVentas(rv)
      setClientesConVentas(cv)
      setProductosBajoStock(pb)
      setVentasPorCliente(vpc)
      setProductosMasVendidos(pmv)
      setLoading(false)
    }
    cargar()
  }, [])

  if (loading) return <p>Cargando reportes...</p>

  return (
    <div>
      <h2>📊 Reportes</h2>

      {/* VIEW: Resumen de ventas */}
      <div style={estilos.card}>
        <h3 style={{ marginTop: 0 }}>
          Resumen de Ventas
          <span style={{ ...estilos.badge, ...estilos.badgeAzul }}>VIEW</span>
          <span style={{ ...estilos.badge, ...estilos.badgeVerde }}>JOIN</span>
        </h3>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Usa la vista <code>resumen_ventas</code> que combina Venta + Cliente + Empleado + DetalleVenta
        </p>
        <TablaGenerica
          columnas={['ID', 'Fecha', 'Cliente', 'Empleado', 'Total', 'Productos']}
          datos={resumenVentas}
          renderFila={r => <>
            <td style={estilos.td}>#{r.id_venta}</td>
            <td style={estilos.td}>{new Date(r.fecha).toLocaleDateString('es-GT')}</td>
            <td style={estilos.td}>{r.cliente}</td>
            <td style={estilos.td}>{r.empleado}</td>
            <td style={estilos.td}><strong>Q{r.total.toFixed(2)}</strong></td>
            <td style={estilos.td}>{r.cantidad_productos}</td>
          </>}
        />
      </div>

      {/* GROUP BY + HAVING: Ventas por cliente */}
      <div style={estilos.card}>
        <h3 style={{ marginTop: 0 }}>
          Ventas por Cliente
          <span style={{ ...estilos.badge, ...estilos.badgeNaranja }}>GROUP BY</span>
          <span style={{ ...estilos.badge, ...estilos.badgeNaranja }}>HAVING</span>
          <span style={{ ...estilos.badge, ...estilos.badgeVerde }}>JOIN</span>
        </h3>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Clientes con monto total de compras mayor a Q100, agrupados y ordenados por monto
        </p>
        <TablaGenerica
          columnas={['Cliente', 'Total Ventas', 'Monto Total', 'Promedio por Venta']}
          datos={ventasPorCliente}
          renderFila={r => <>
            <td style={estilos.td}>{r.cliente}</td>
            <td style={estilos.td}>{r.total_ventas}</td>
            <td style={estilos.td}><strong>Q{r.monto_total.toFixed(2)}</strong></td>
            <td style={estilos.td}>Q{r.promedio_venta.toFixed(2)}</td>
          </>}
        />
      </div>

      {/* CTE: Productos más vendidos */}
      <div style={estilos.card}>
        <h3 style={{ marginTop: 0 }}>
          Productos Más Vendidos
          <span style={{ ...estilos.badge, ...estilos.badgeMorado }}>CTE</span>
          <span style={{ ...estilos.badge, ...estilos.badgeVerde }}>JOIN</span>
        </h3>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Ranking de productos usando CTE <code>ventas_por_producto</code>
        </p>
        <TablaGenerica
          columnas={['Producto', 'Unidades Vendidas', 'Ingresos Generados']}
          datos={productosMasVendidos}
          renderFila={r => <>
            <td style={estilos.td}>{r.nombre}</td>
            <td style={estilos.td}>{r.unidades_vendidas}</td>
            <td style={estilos.td}><strong>Q{r.ingresos.toFixed(2)}</strong></td>
          </>}
        />
      </div>

      {/* SUBQUERY 1: Clientes con ventas */}
      <div style={estilos.card}>
        <h3 style={{ marginTop: 0 }}>
          Clientes que han Comprado
          <span style={{ ...estilos.badge, ...estilos.badgeAzul }}>SUBQUERY IN</span>
        </h3>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Clientes cuyo <code>id_cliente</code> aparece en la tabla Venta usando <code>IN (SELECT...)</code>
        </p>
        <TablaGenerica
          columnas={['ID', 'Nombre', 'Apellido', 'Email']}
          datos={clientesConVentas}
          renderFila={r => <>
            <td style={estilos.td}>{r.id_cliente}</td>
            <td style={estilos.td}>{r.nombre}</td>
            <td style={estilos.td}>{r.apellido}</td>
            <td style={estilos.td}>{r.email || '—'}</td>
          </>}
        />
      </div>

      {/* SUBQUERY 2: Productos bajo stock promedio */}
      <div style={estilos.card}>
        <h3 style={{ marginTop: 0 }}>
          Productos con Stock Bajo el Promedio
          <span style={{ ...estilos.badge, ...estilos.badgeAzul }}>SUBQUERY</span>
        </h3>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Productos con stock menor al promedio usando <code>WHERE stock &lt; (SELECT AVG(stock)...)</code>
        </p>
        <TablaGenerica
          columnas={['ID', 'Producto', 'Stock Actual', 'Precio']}
          datos={productosBajoStock}
          renderFila={r => <>
            <td style={estilos.td}>{r.id_producto}</td>
            <td style={estilos.td}>{r.nombre}</td>
            <td style={estilos.td}>
              <span style={{ color: '#e94560', fontWeight: 'bold' }}>{r.stock}</span>
            </td>
            <td style={estilos.td}>Q{r.precio.toFixed(2)}</td>
          </>}
        />
      </div>
    </div>
  )
}
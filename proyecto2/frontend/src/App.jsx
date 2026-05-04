import { useEffect, useState } from "react";

const API = "http://localhost:8000";

export default function App() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API}/productos`)
      .then(res => {
        if (!res.ok) throw new Error("Error al cargar productos");
        return res.json();
      })
      .then(data => {
        setProductos(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>Tienda — Inventario</h1>

      {loading && <p>Cargando productos...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      {!loading && !error && (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead style={{ background: "#f0f0f0" }}>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th>Proveedor</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id_producto}>
                <td>{p.id_producto}</td>
                <td>{p.nombre}</td>
                <td>{p.descripcion}</td>
                <td>Q{p.precio.toFixed(2)}</td>
                <td>{p.stock}</td>
                <td>{p.categoria}</td>
                <td>{p.proveedor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
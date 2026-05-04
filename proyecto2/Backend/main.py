from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from db import get_connection

app = FastAPI(title="Tienda API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def crear_view():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            CREATE OR REPLACE VIEW resumen_ventas AS
            SELECT
                v.id_venta, v.fecha, v.total,
                c.nombre || ' ' || c.apellido AS cliente,
                e.nombre || ' ' || e.apellido AS empleado,
                COUNT(dv.id_detalle) AS cantidad_productos
            FROM Venta v
            JOIN Cliente c ON v.id_cliente = c.id_cliente
            JOIN Empleado e ON v.id_empleado = e.id_empleado
            JOIN DetalleVenta dv ON v.id_venta = dv.id_venta
            GROUP BY v.id_venta, v.fecha, v.total,
                     c.nombre, c.apellido, e.nombre, e.apellido
        """)
        conn.commit()
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error creando view: {e}")

# ========================
# MODELOS
# ========================

class ProductoCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    precio: float
    stock: int
    id_categoria: int
    id_proveedor: int

class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None
    precio: Optional[float] = None
    stock: Optional[int] = None
    id_categoria: Optional[int] = None
    id_proveedor: Optional[int] = None

class ClienteCreate(BaseModel):
    nombre: str
    apellido: str
    telefono: Optional[str] = None
    email: Optional[str] = None

class ClienteUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None

class VentaCreate(BaseModel):
    id_cliente: int
    id_empleado: int
    productos: list[dict]  # [{id_producto, cantidad}]

# ========================
# HEALTH CHECK
# ========================

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Tienda API funcionando"}

# ========================
# CATEGORIAS Y PROVEEDORES (para formularios)
# ========================

@app.get("/categorias")
def get_categorias():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id_categoria, nombre FROM Categoria ORDER BY nombre")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id_categoria": r[0], "nombre": r[1]} for r in rows]

@app.get("/proveedores")
def get_proveedores():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id_proveedor, nombre FROM Proveedor ORDER BY nombre")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id_proveedor": r[0], "nombre": r[1]} for r in rows]

@app.get("/empleados")
def get_empleados():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id_empleado, nombre, apellido FROM Empleado ORDER BY nombre")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id_empleado": r[0], "nombre": r[1], "apellido": r[2]} for r in rows]

# ========================
# CRUD PRODUCTOS
# ========================

@app.get("/productos")
def get_productos():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock,
               c.nombre AS categoria, pr.nombre AS proveedor,
               p.id_categoria, p.id_proveedor
        FROM Producto p
        JOIN Categoria c ON p.id_categoria = c.id_categoria
        JOIN Proveedor pr ON p.id_proveedor = pr.id_proveedor
        ORDER BY p.id_producto
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "id_producto": r[0], "nombre": r[1], "descripcion": r[2],
            "precio": float(r[3]), "stock": r[4], "categoria": r[5],
            "proveedor": r[6], "id_categoria": r[7], "id_proveedor": r[8]
        } for r in rows
    ]

@app.get("/productos/{id_producto}")
def get_producto(id_producto: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock,
               c.nombre AS categoria, pr.nombre AS proveedor,
               p.id_categoria, p.id_proveedor
        FROM Producto p
        JOIN Categoria c ON p.id_categoria = c.id_categoria
        JOIN Proveedor pr ON p.id_proveedor = pr.id_proveedor
        WHERE p.id_producto = %s
    """, (id_producto,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {
        "id_producto": row[0], "nombre": row[1], "descripcion": row[2],
        "precio": float(row[3]), "stock": row[4], "categoria": row[5],
        "proveedor": row[6], "id_categoria": row[7], "id_proveedor": row[8]
    }

@app.post("/productos", status_code=201)
def create_producto(p: ProductoCreate):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO Producto (nombre, descripcion, precio, stock, id_categoria, id_proveedor)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id_producto
        """, (p.nombre, p.descripcion, p.precio, p.stock, p.id_categoria, p.id_proveedor))
        new_id = cur.fetchone()[0]
        conn.commit()
        return {"id_producto": new_id, "mensaje": "Producto creado exitosamente"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.put("/productos/{id_producto}")
def update_producto(id_producto: int, p: ProductoUpdate):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE Producto
            SET nombre = COALESCE(%s, nombre),
                descripcion = COALESCE(%s, descripcion),
                precio = COALESCE(%s, precio),
                stock = COALESCE(%s, stock),
                id_categoria = COALESCE(%s, id_categoria),
                id_proveedor = COALESCE(%s, id_proveedor)
            WHERE id_producto = %s
        """, (p.nombre, p.descripcion, p.precio, p.stock,
              p.id_categoria, p.id_proveedor, id_producto))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        conn.commit()
        return {"mensaje": "Producto actualizado exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.delete("/productos/{id_producto}")
def delete_producto(id_producto: int):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM DetalleVenta WHERE id_producto = %s", (id_producto,))
        if cur.fetchone()[0] > 0:
            raise HTTPException(status_code=400, detail="No se puede eliminar: el producto tiene ventas registradas")
        cur.execute("DELETE FROM Producto WHERE id_producto = %s", (id_producto,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
        conn.commit()
        return {"mensaje": "Producto eliminado exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ========================
# CRUD CLIENTES
# ========================

@app.get("/clientes")
def get_clientes():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM Cliente ORDER BY id_cliente")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {"id_cliente": r[0], "nombre": r[1], "apellido": r[2],
         "telefono": r[3], "email": r[4]} for r in rows
    ]

@app.get("/clientes/{id_cliente}")
def get_cliente(id_cliente: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM Cliente WHERE id_cliente = %s", (id_cliente,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"id_cliente": row[0], "nombre": row[1], "apellido": row[2],
            "telefono": row[3], "email": row[4]}

@app.post("/clientes", status_code=201)
def create_cliente(c: ClienteCreate):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO Cliente (nombre, apellido, telefono, email)
            VALUES (%s, %s, %s, %s)
            RETURNING id_cliente
        """, (c.nombre, c.apellido, c.telefono, c.email))
        new_id = cur.fetchone()[0]
        conn.commit()
        return {"id_cliente": new_id, "mensaje": "Cliente creado exitosamente"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.put("/clientes/{id_cliente}")
def update_cliente(id_cliente: int, c: ClienteUpdate):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE Cliente
            SET nombre = COALESCE(%s, nombre),
                apellido = COALESCE(%s, apellido),
                telefono = COALESCE(%s, telefono),
                email = COALESCE(%s, email)
            WHERE id_cliente = %s
        """, (c.nombre, c.apellido, c.telefono, c.email, id_cliente))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        conn.commit()
        return {"mensaje": "Cliente actualizado exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.delete("/clientes/{id_cliente}")
def delete_cliente(id_cliente: int):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT COUNT(*) FROM Venta WHERE id_cliente = %s", (id_cliente,))
        if cur.fetchone()[0] > 0:
            raise HTTPException(status_code=400, detail="No se puede eliminar: el cliente tiene ventas registradas")
        cur.execute("DELETE FROM Cliente WHERE id_cliente = %s", (id_cliente,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Cliente no encontrado")
        conn.commit()
        return {"mensaje": "Cliente eliminado exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ========================
# VENTAS CON TRANSACCIÓN EXPLÍCITA
# ========================

@app.get("/ventas")
def get_ventas():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT v.id_venta, v.fecha, v.total,
               c.nombre || ' ' || c.apellido AS cliente,
               e.nombre || ' ' || e.apellido AS empleado
        FROM Venta v
        JOIN Cliente c ON v.id_cliente = c.id_cliente
        JOIN Empleado e ON v.id_empleado = e.id_empleado
        ORDER BY v.fecha DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "id_venta": r[0], "fecha": str(r[1]),
            "total": float(r[2]), "cliente": r[3], "empleado": r[4]
        } for r in rows
    ]

@app.post("/ventas", status_code=201)
def create_venta(v: VentaCreate):
    conn = get_connection()
    cur = conn.cursor()
    try:
        # TRANSACCIÓN EXPLÍCITA
        cur.execute("BEGIN")

        total = 0.0
        detalles = []

        for item in v.productos:
            id_producto = item["id_producto"]
            cantidad = item["cantidad"]

            # Verificar stock
            cur.execute("SELECT precio, stock FROM Producto WHERE id_producto = %s FOR UPDATE",
                        (id_producto,))
            producto = cur.fetchone()
            if not producto:
                raise Exception(f"Producto {id_producto} no encontrado")
            if producto[1] < cantidad:
                raise Exception(f"Stock insuficiente para producto {id_producto}")

            precio_unitario = float(producto[0])
            total += precio_unitario * cantidad
            detalles.append((id_producto, cantidad, precio_unitario))

        # Insertar venta
        cur.execute("""
            INSERT INTO Venta (fecha, total, id_cliente, id_empleado)
            VALUES (NOW(), %s, %s, %s)
            RETURNING id_venta
        """, (total, v.id_cliente, v.id_empleado))
        id_venta = cur.fetchone()[0]

        # Insertar detalles y descontar stock
        for id_producto, cantidad, precio_unitario in detalles:
            cur.execute("""
                INSERT INTO DetalleVenta (cantidad, precio_unitario, id_venta, id_producto)
                VALUES (%s, %s, %s, %s)
            """, (cantidad, precio_unitario, id_venta, id_producto))
            cur.execute("""
                UPDATE Producto SET stock = stock - %s WHERE id_producto = %s
            """, (cantidad, id_producto))

        cur.execute("COMMIT")
        return {"id_venta": id_venta, "total": total, "mensaje": "Venta registrada exitosamente"}

    except Exception as e:
        cur.execute("ROLLBACK")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cur.close()
        conn.close()

# ========================
# CONSULTAS SQL AVANZADAS
# ========================

# JOIN 1: ya está en /productos (Producto + Categoria + Proveedor)

# JOIN 2: Ventas con cliente y empleado (ya está en /ventas)

# JOIN 3: Detalle de una venta específica
@app.get("/ventas/{id_venta}/detalle")
def get_detalle_venta(id_venta: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT dv.id_detalle, p.nombre AS producto,
               dv.cantidad, dv.precio_unitario,
               (dv.cantidad * dv.precio_unitario) AS subtotal
        FROM DetalleVenta dv
        JOIN Producto p ON dv.id_producto = p.id_producto
        WHERE dv.id_venta = %s
    """, (id_venta,))
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "id_detalle": r[0], "producto": r[1],
            "cantidad": r[2], "precio_unitario": float(r[3]),
            "subtotal": float(r[4])
        } for r in rows
    ]

# SUBQUERY 1: Clientes que han realizado al menos una venta
@app.get("/reportes/clientes-con-ventas")
def clientes_con_ventas():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id_cliente, nombre, apellido, email
        FROM Cliente
        WHERE id_cliente IN (
            SELECT DISTINCT id_cliente FROM Venta
        )
        ORDER BY apellido
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {"id_cliente": r[0], "nombre": r[1], "apellido": r[2], "email": r[3]}
        for r in rows
    ]

# SUBQUERY 2: Productos con stock por debajo del promedio
@app.get("/reportes/productos-bajo-stock")
def productos_bajo_stock():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id_producto, nombre, stock, precio
        FROM Producto
        WHERE stock < (SELECT AVG(stock) FROM Producto)
        ORDER BY stock ASC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {"id_producto": r[0], "nombre": r[1], "stock": r[2], "precio": float(r[3])}
        for r in rows
    ]

# GROUP BY + HAVING + agregación: ventas por cliente con total > 100
@app.get("/reportes/ventas-por-cliente")
def ventas_por_cliente():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT c.nombre || ' ' || c.apellido AS cliente,
               COUNT(v.id_venta) AS total_ventas,
               SUM(v.total) AS monto_total,
               AVG(v.total) AS promedio_venta
        FROM Venta v
        JOIN Cliente c ON v.id_cliente = c.id_cliente
        GROUP BY c.id_cliente, c.nombre, c.apellido
        HAVING SUM(v.total) > 100
        ORDER BY monto_total DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "cliente": r[0], "total_ventas": r[1],
            "monto_total": float(r[2]), "promedio_venta": float(r[3])
        } for r in rows
    ]

# CTE: ranking de productos más vendidos
@app.get("/reportes/productos-mas-vendidos")
def productos_mas_vendidos():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        WITH ventas_por_producto AS (
            SELECT p.id_producto, p.nombre,
                   SUM(dv.cantidad) AS unidades_vendidas,
                   SUM(dv.cantidad * dv.precio_unitario) AS ingresos
            FROM DetalleVenta dv
            JOIN Producto p ON dv.id_producto = p.id_producto
            GROUP BY p.id_producto, p.nombre
        )
        SELECT nombre, unidades_vendidas, ingresos
        FROM ventas_por_producto
        ORDER BY unidades_vendidas DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {"nombre": r[0], "unidades_vendidas": r[1], "ingresos": float(r[2])}
        for r in rows
    ]

# VIEW: resumen de ventas
@app.get("/reportes/resumen-ventas")
def resumen_ventas():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM resumen_ventas ORDER BY fecha DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "id_venta": r[0], "fecha": str(r[1]), "total": float(r[2]),
            "cliente": r[3], "empleado": r[4], "cantidad_productos": r[5]
        } for r in rows
    ]
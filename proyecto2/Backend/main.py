import json
import csv
import io
import os

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv

from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db
from models import Base, Categoria, Proveedor, Producto, Empleado, Cliente, Venta, DetalleVenta, Usuario
from db import get_connection

load_dotenv()

app = FastAPI(title="Tienda API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========================
# AUTH CONFIG
# ========================

SECRET_KEY = os.getenv("SECRET_KEY", "tienda_secret_2026")
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)


def hash_password(password):
    return pwd_context.hash(password)


def create_token(data: dict):
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(hours=8)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Token inválido o expirado")


def require_roles(*roles):
    def checker(current_user: dict = Depends(get_current_user)):
        if current_user.get("rol") not in roles:
            raise HTTPException(status_code=403, detail="No tienes permiso para esta acción")
        return current_user
    return checker


# ========================
# MODELOS PYDANTIC
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
    productos: list[dict]


class UsuarioCreate(BaseModel):
    username: str
    password: str
    rol: str = "vendedor"


class AjusteStockRequest(BaseModel):
    id_producto: int
    cantidad: int
    operacion: str


# ========================
# HEALTH CHECK
# ========================

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Tienda API funcionando"}


# ========================
# AUTH ENDPOINTS
# ========================

@app.post("/auth/register", status_code=201)
def register(u: UsuarioCreate, db: Session = Depends(get_db)):
    existing = db.query(Usuario).filter(Usuario.username == u.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="El usuario ya existe")
    nuevo = Usuario(
        username=u.username,
        password_hash=hash_password(u.password),
        rol=u.rol
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return {"id_usuario": nuevo.id_usuario, "mensaje": "Usuario creado"}


@app.post("/auth/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.username == form.username).first()
    if not user or not verify_password(form.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    token = create_token({"sub": user.username, "rol": user.rol, "id": user.id_usuario})
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": user.username,
        "rol": user.rol
    }


@app.get("/auth/me")
def me(current_user: dict = Depends(get_current_user)):
    return current_user


@app.post("/auth/logout")
def logout():
    return {"mensaje": "Sesión cerrada"}


# ========================
# CATEGORIAS, PROVEEDORES, EMPLEADOS — ORM
# ========================

@app.get("/categorias")
def get_categorias(db: Session = Depends(get_db)):
    rows = db.query(Categoria).order_by(Categoria.nombre).all()
    return [{"id_categoria": r.id_categoria, "nombre": r.nombre} for r in rows]


@app.get("/proveedores")
def get_proveedores(db: Session = Depends(get_db)):
    rows = db.query(Proveedor).order_by(Proveedor.nombre).all()
    return [{"id_proveedor": r.id_proveedor, "nombre": r.nombre} for r in rows]


@app.get("/empleados")
def get_empleados(db: Session = Depends(get_db)):
    rows = db.query(Empleado).order_by(Empleado.nombre).all()
    return [{"id_empleado": r.id_empleado, "nombre": r.nombre, "apellido": r.apellido} for r in rows]


# ========================
# CRUD PRODUCTOS — ORM + Stored Procedures
# ========================

@app.get("/productos")
def get_productos(db: Session = Depends(get_db)):
    rows = (
        db.query(Producto)
        .join(Categoria, Producto.id_categoria == Categoria.id_categoria)
        .join(Proveedor, Producto.id_proveedor == Proveedor.id_proveedor)
        .order_by(Producto.id_producto)
        .all()
    )
    return [
        {
            "id_producto": r.id_producto,
            "nombre": r.nombre,
            "descripcion": r.descripcion,
            "precio": float(r.precio),
            "stock": r.stock,
            "categoria": r.categoria.nombre,
            "proveedor": r.proveedor.nombre,
            "id_categoria": r.id_categoria,
            "id_proveedor": r.id_proveedor,
        }
        for r in rows
    ]


@app.get("/productos/{id_producto}")
def get_producto(id_producto: int, db: Session = Depends(get_db)):
    r = db.query(Producto).filter(Producto.id_producto == id_producto).first()
    if not r:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {
        "id_producto": r.id_producto,
        "nombre": r.nombre,
        "descripcion": r.descripcion,
        "precio": float(r.precio),
        "stock": r.stock,
        "categoria": r.categoria.nombre,
        "proveedor": r.proveedor.nombre,
        "id_categoria": r.id_categoria,
        "id_proveedor": r.id_proveedor,
    }


@app.post("/productos", status_code=201)
def create_producto(
    p: ProductoCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("gerente", "supervisor"))
):
    result = db.execute(
        text("CALL sp_upsert_producto(:id, :nombre, :desc, :precio, :stock, :cat, :prov, null)"),
        {
            "id": 0,
            "nombre": p.nombre,
            "desc": p.descripcion,
            "precio": p.precio,
            "stock": p.stock,
            "cat": p.id_categoria,
            "prov": p.id_proveedor,
        }
    )
    db.commit()
    row = result.fetchone()
    new_id = row[0] if row else None
    return {"id_producto": new_id, "mensaje": "Producto creado exitosamente"}


@app.put("/productos/{id_producto}")
def update_producto(
    id_producto: int,
    p: ProductoUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("gerente", "supervisor"))
):
    try:
        db.execute(
            text("CALL sp_upsert_producto(:id, :nombre, :desc, :precio, :stock, :cat, :prov, null)"),
            {
                "id": id_producto,
                "nombre": p.nombre,
                "desc": p.descripcion,
                "precio": p.precio,
                "stock": p.stock,
                "cat": p.id_categoria,
                "prov": p.id_proveedor,
            }
        )
        db.commit()
        return {"mensaje": "Producto actualizado exitosamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/productos/{id_producto}")
def delete_producto(
    id_producto: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("gerente"))
):
    try:
        db.execute(
            text("CALL sp_eliminar_producto(:id, null)"),
            {"id": id_producto}
        )
        db.commit()
        return {"mensaje": "Producto eliminado exitosamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# ========================
# CRUD CLIENTES — ORM + Stored Procedures
# ========================

@app.get("/clientes")
def get_clientes(db: Session = Depends(get_db)):
    rows = db.query(Cliente).order_by(Cliente.id_cliente).all()
    return [
        {"id_cliente": r.id_cliente, "nombre": r.nombre, "apellido": r.apellido,
         "telefono": r.telefono, "email": r.email}
        for r in rows
    ]


@app.get("/clientes/{id_cliente}")
def get_cliente(id_cliente: int, db: Session = Depends(get_db)):
    r = db.query(Cliente).filter(Cliente.id_cliente == id_cliente).first()
    if not r:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return {"id_cliente": r.id_cliente, "nombre": r.nombre, "apellido": r.apellido,
            "telefono": r.telefono, "email": r.email}


@app.post("/clientes", status_code=201)
def create_cliente(
    c: ClienteCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("gerente", "supervisor", "vendedor"))
):
    try:
        result = db.execute(
            text("CALL sp_upsert_cliente(:id, :nombre, :apellido, :tel, :email, null)"),
            {"id": 0, "nombre": c.nombre, "apellido": c.apellido,
             "tel": c.telefono, "email": c.email}
        )
        db.commit()
        row = result.fetchone()
        new_id = row[0] if row else None
        return {"id_cliente": new_id, "mensaje": "Cliente creado exitosamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@app.put("/clientes/{id_cliente}")
def update_cliente(
    id_cliente: int,
    c: ClienteUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("gerente", "supervisor", "vendedor"))
):
    try:
        db.execute(
            text("CALL sp_upsert_cliente(:id, :nombre, :apellido, :tel, :email, null)"),
            {"id": id_cliente, "nombre": c.nombre, "apellido": c.apellido,
             "tel": c.telefono, "email": c.email}
        )
        db.commit()
        return {"mensaje": "Cliente actualizado exitosamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@app.delete("/clientes/{id_cliente}")
def delete_cliente(
    id_cliente: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("gerente"))
):
    try:
        db.execute(
            text("CALL sp_eliminar_cliente(:id, null)"),
            {"id": id_cliente}
        )
        db.commit()
        return {"mensaje": "Cliente eliminado exitosamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# ========================
# VENTAS — Stored Procedure
# ========================

@app.get("/ventas")
def get_ventas(db: Session = Depends(get_db)):
    rows = (
        db.query(Venta)
        .join(Cliente, Venta.id_cliente == Cliente.id_cliente)
        .join(Empleado, Venta.id_empleado == Empleado.id_empleado)
        .order_by(Venta.fecha.desc())
        .all()
    )
    return [
        {
            "id_venta": r.id_venta,
            "fecha": str(r.fecha),
            "total": float(r.total),
            "cliente": f"{r.cliente.nombre} {r.cliente.apellido}",
            "empleado": f"{r.empleado.nombre} {r.empleado.apellido}",
        }
        for r in rows
    ]


@app.get("/ventas/{id_venta}/detalle")
def get_detalle_venta(id_venta: int, db: Session = Depends(get_db)):
    rows = (
        db.query(DetalleVenta)
        .join(Producto, DetalleVenta.id_producto == Producto.id_producto)
        .filter(DetalleVenta.id_venta == id_venta)
        .all()
    )
    return [
        {
            "id_detalle": r.id_detalle,
            "producto": r.producto.nombre,
            "cantidad": r.cantidad,
            "precio_unitario": float(r.precio_unitario),
            "subtotal": float(r.cantidad * r.precio_unitario),
        }
        for r in rows
    ]


@app.post("/ventas", status_code=201)
def create_venta(
    v: VentaCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("gerente", "supervisor", "vendedor", "cajero"))
):
    try:
        productos_json = json.dumps(v.productos)
        result = db.execute(
            text("CALL sp_registrar_venta(:cliente, :empleado, :productos::json, null, null)"),
            {
                "cliente": v.id_cliente,
                "empleado": v.id_empleado,
                "productos": productos_json,
            }
        )
        db.commit()
        row = result.fetchone()
        id_venta = row[0] if row else None
        total = float(row[1]) if row else 0.0
        return {"id_venta": id_venta, "total": total, "mensaje": "Venta registrada exitosamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# ========================
# AJUSTE DE STOCK — SP exclusivo para bodeguero
# ========================

@app.post("/productos/ajustar-stock")
def ajustar_stock(
    req: AjusteStockRequest,
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("gerente", "supervisor", "bodeguero"))
):
    try:
        result = db.execute(
            text("CALL sp_ajustar_stock(:id, :cantidad, :op, null, null)"),
            {"id": req.id_producto, "cantidad": req.cantidad, "op": req.operacion}
        )
        db.commit()
        row = result.fetchone()
        return {
            "stock_nuevo": row[0] if row else None,
            "mensaje": row[1] if row else "Operación completada"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


# ========================
# REPORTES
# ========================

@app.get("/reportes/clientes-con-ventas")
def clientes_con_ventas(
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("gerente", "supervisor"))
):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT id_cliente, nombre, apellido, email
        FROM Cliente
        WHERE id_cliente IN (SELECT DISTINCT id_cliente FROM Venta)
        ORDER BY apellido
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"id_cliente": r[0], "nombre": r[1], "apellido": r[2], "email": r[3]} for r in rows]


@app.get("/reportes/productos-bajo-stock")
def productos_bajo_stock(db: Session = Depends(get_db)):
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
    return [{"id_producto": r[0], "nombre": r[1], "stock": r[2], "precio": float(r[3])} for r in rows]


@app.get("/reportes/ventas-por-cliente")
def ventas_por_cliente(
    db: Session = Depends(get_db),
    _: dict = Depends(require_roles("gerente", "supervisor"))
):
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
        {"cliente": r[0], "total_ventas": r[1], "monto_total": float(r[2]), "promedio_venta": float(r[3])}
        for r in rows
    ]


@app.get("/reportes/productos-mas-vendidos")
def productos_mas_vendidos(db: Session = Depends(get_db)):
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
    return [{"nombre": r[0], "unidades_vendidas": r[1], "ingresos": float(r[2])} for r in rows]


@app.get("/reportes/resumen-ventas")
def resumen_ventas(db: Session = Depends(get_db)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM resumen_ventas ORDER BY fecha DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {"id_venta": r[0], "fecha": str(r[1]), "total": float(r[2]),
         "cliente": r[3], "empleado": r[4], "cantidad_productos": r[5]}
        for r in rows
    ]


@app.get("/reportes/exportar-ventas-csv")
def exportar_ventas_csv(db: Session = Depends(get_db)):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM resumen_ventas ORDER BY fecha DESC")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(['ID Venta', 'Fecha', 'Total', 'Cliente', 'Empleado', 'Cantidad Productos'])
    for r in rows:
        writer.writerow([r[0], r[1], r[2], r[3], r[4], r[5]])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=ventas.csv"}
    )
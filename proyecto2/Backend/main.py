from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from db import get_connection

app = FastAPI(title="Tienda API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "Tienda API funcionando"}

@app.get("/productos")
def get_productos():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT p.id_producto, p.nombre, p.descripcion, p.precio, p.stock,
               c.nombre AS categoria, pr.nombre AS proveedor
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
            "id_producto": r[0],
            "nombre": r[1],
            "descripcion": r[2],
            "precio": float(r[3]),
            "stock": r[4],
            "categoria": r[5],
            "proveedor": r[6]
        } for r in rows
    ]

@app.get("/clientes")
def get_clientes():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM Cliente ORDER BY id_cliente")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "id_cliente": r[0],
            "nombre": r[1],
            "apellido": r[2],
            "telefono": r[3],
            "email": r[4]
        } for r in rows
    ]
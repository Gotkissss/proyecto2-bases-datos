# Proyecto 3 — Sistema de Inventario y Ventas con Seguridad

**Diego Quixchan — 24903**  
Bases de Datos 1, Sección 20  
Universidad del Valle de Guatemala  
Catedrático: Erick Francisco Marroquín Rodríguez  

---

## Descripción

Extensión del Proyecto 2. Agrega seguridad a nivel de base de datos mediante roles y permisos definidos en PostgreSQL, stored procedures para operaciones críticas e integración de un ORM (SQLAlchemy) para las operaciones CRUD principales.

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Base de datos | PostgreSQL 15 |
| Backend | Python 3.11 + FastAPI + SQLAlchemy 2.0 |
| Frontend | React 18 + Vite |
| Infraestructura | Docker + Docker Compose |

---

## Requisitos

- Docker Desktop instalado y corriendo
- Git

---

## Levantar el proyecto

```bash
git clone https://github.com/Gotkissss/proyecto2-bases-datos.git
cd proyecto2-bases-datos
git checkout proyecto-3
cp .env.example .env
docker compose up --build
```

Accede a:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **Documentación API:** http://localhost:8000/docs

---

## Credenciales de base de datos

| Variable | Valor |
|---|---|
| Usuario | proy3 |
| Contraseña | secret |
| Base de datos | tienda |

---

## Usuarios de prueba

| Usuario          | Contraseña | Rol        | Acceso                                      |
|------------------|------------|------------|---------------------------------------------|
| admin_gerente    | secret123  | gerente    | Todo                                        |
| admin_supervisor | secret123  | supervisor | Productos, clientes, ventas, reportes, bodega |
| admin_vendedor   | secret123  | vendedor   | Productos (ver), clientes, ventas           |
| admin_cajero     | secret123  | cajero     | Ventas (ver y registrar), productos (ver)   |
| admin_bodeguero  | secret123  | bodeguero  | Productos (ver), ajuste de stock            |

---

## Roles definidos en PostgreSQL

| Rol            | Permisos |
|----------------|----------|
| rol_gerente    | SELECT, INSERT, UPDATE, DELETE en todas las tablas |
| rol_supervisor | SELECT, INSERT, UPDATE en tablas de negocio (sin Usuario) |
| rol_vendedor   | SELECT en catálogos; INSERT en Venta y DetalleVenta |
| rol_cajero     | SELECT en tablas de negocio |
| rol_bodeguero  | SELECT en Producto/Categoría/Proveedor; UPDATE(stock) en Producto |

---

## Stored Procedures

| Procedure | Descripción |
|---|---|
| sp_registrar_venta | Registra venta completa con transacción y ROLLBACK automático |
| sp_upsert_producto | Crea o actualiza un producto |
| sp_upsert_cliente | Crea o actualiza un cliente |
| sp_ajustar_stock | Ajusta stock con parámetros de entrada/salida y validación |
| sp_eliminar_producto | Elimina producto con validación de integridad referencial |
| sp_eliminar_cliente | Elimina cliente con validación de integridad referencial |

---

## ORM

SQLAlchemy 2.0 se usa para todas las operaciones CRUD principales:
- `GET /productos` — query con JOIN a Categoria y Proveedor
- `GET /clientes` — query directa
- `GET /ventas` — query con JOIN a Cliente y Empleado
- `GET /ventas/{id}/detalle` — query con JOIN a Producto
- `POST /auth/register` y `POST /auth/login` — query a Usuario

---

## Estructura del proyecto

```
proyecto2/
├── docker-compose.yml
├── .env.example
├── README.md
├── docs/
│   ├── DER.png
│   └── diseño.md
├── Backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   ├── db.py
│   ├── database.py        ← nuevo: configuración SQLAlchemy
│   └── models.py          ← nuevo: modelos ORM
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── auth.js
│       └── pages/
│           ├── Login.jsx
│           ├── Productos.jsx
│           ├── Clientes.jsx
│           ├── Ventas.jsx
│           ├── Reportes.jsx
│           └── Bodega.jsx  ← nueva: gestión de stock para bodeguero
└── database/
    └── init.sql
```
# Proyecto 2 — Sistema de Inventario y Ventas

**Diego Quixchan — 24903**  
Bases de Datos 1, Sección 20  
Universidad del Valle de Guatemala  
Catedrático: Erick Francisco Marroquín Rodríguez  

---

## Descripción

Aplicación web para gestionar el inventario y las ventas de una tienda. Permite registrar productos, clientes, empleados, proveedores y ventas. Incluye reportes con consultas SQL avanzadas y autenticación de usuarios.

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Base de datos | PostgreSQL 15 |
| Backend | Python 3.11 + FastAPI |
| Frontend | React 18 + Vite |
| Infraestructura | Docker + Docker Compose |

---

## Requisitos

- Docker Desktop instalado y corriendo
- Git

---

## Levantar el proyecto

1. Clona el repositorio:
```bash
   git clone https://github.com/Gotkissss/proyecto2-bases-datos.git
   cd proyecto2-bases-datos
```

2. Crea el archivo de variables de entorno:
```bash
   cp .env.example .env
```

3. Levanta todos los servicios:
```bash
   docker compose up --build
```

4. Accede a la aplicación:
   - **Frontend:** http://localhost:3000
   - **Backend API:** http://localhost:8000
   - **Documentación API:** http://localhost:8000/docs

5. Crea tu usuario desde la pantalla de login con **Regístrate**.

---

## Credenciales de base de datos

| Variable | Valor |
|---|---|
| Usuario | proy2 |
| Contraseña | secret |
| Base de datos | tienda |
| Host | db |
| Puerto | 5432 |

---

## Estructura del proyecto
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
│   └── db.py
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
│           └── Reportes.jsx
└── database/
   └── init.sql

---

## Diagrama Entidad-Relación
<img width="1106" height="1280" alt="image" src="https://github.com/user-attachments/assets/aea444bb-2eba-4114-906e-64eeca468f26" />



---

## Funcionalidades

### Módulo de Productos
- Listado con JOIN entre Producto, Categoría y Proveedor
- Crear, editar y eliminar productos
- Stock resaltado en rojo cuando está bajo

### Módulo de Clientes
- Listado, creación, edición y eliminación de clientes
- Validación de errores visible en la UI

### Módulo de Ventas
- Registro de ventas con múltiples productos
- Transacción explícita con BEGIN / COMMIT / ROLLBACK
- Verificación de stock antes de confirmar
- Descuento automático de stock al registrar venta
- Modal con detalle de cada venta

### Reportes SQL
| Reporte | Técnica SQL |
|---|---|
| Resumen de ventas | VIEW + JOIN |
| Ventas por cliente | GROUP BY + HAVING + JOIN |
| Productos más vendidos | CTE (WITH) + JOIN |
| Clientes que han comprado | Subquery con IN |
| Productos bajo stock promedio | Subquery escalar |

### Avanzado
- Autenticación con JWT (login / logout / registro)
- Exportar reporte de ventas a CSV

---

## Consultas SQL implementadas

### JOINs
1. `GET /productos` — Producto + Categoría + Proveedor
2. `GET /ventas` — Venta + Cliente + Empleado
3. `GET /ventas/{id}/detalle` — DetalleVenta + Producto

### Subqueries
1. `GET /reportes/clientes-con-ventas` — IN (SELECT DISTINCT id_cliente FROM Venta)
2. `GET /reportes/productos-bajo-stock` — WHERE stock < (SELECT AVG(stock) FROM Producto)

### GROUP BY + HAVING
- `GET /reportes/ventas-por-cliente` — agrupa por cliente, filtra con HAVING SUM > 100

### CTE
- `GET /reportes/productos-mas-vendidos` — WITH ventas_por_producto AS (...)

### VIEW
- `resumen_ventas` — creado en startup del backend, usado en reportes

### Transacción explícita
- `POST /ventas` — BEGIN / verificación de stock / INSERT / UPDATE / COMMIT o ROLLBACK

---

## Notas
- El `.env` no se sube al repositorio (está en `.gitignore`)
- Usar `.env.example` como plantilla
- La base de datos se inicializa automáticamente con `init.sql` al hacer `docker compose up`

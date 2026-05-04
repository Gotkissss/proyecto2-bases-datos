# Diseño de Base de Datos

Diego Quixchan — 24903  
Bases de Datos 1, Sección 20  
Universidad del Valle de Guatemala

---

## Tabla desnormalizada inicial

El diseño empieza desde una tabla desnormalizada que concentra toda la información de una venta:

| Campo | Campo | Campo |
|---|---|---|
| id_venta | fecha_venta | total_venta |
| nombre_cliente | telefono_cliente | email_cliente |
| nombre_empleado | apellido_empleado | cargo_empleado |
| nombre_producto | descripcion_producto | precio_producto |
| stock_producto | nombre_categoria | descripcion_categoria |
| nombre_proveedor | telefono_proveedor | email_proveedor |
| cantidad | precio_unitario | — |

---

## Entidades identificadas

- **Cliente** — datos del comprador
- **Empleado** — quien atiende la venta
- **Producto** — artículo vendido
- **Categoría** — agrupación de productos
- **Proveedor** — origen del producto
- **Venta** — cabecera de la transacción
- **DetalleVenta** — líneas de la transacción

---

## Normalización

### 1FN — Primera Forma Normal

```
Venta(id_venta*, fecha, total, nombre_cliente, telefono_cliente, email_cliente,
      nombre_empleado, apellido_empleado, cargo_empleado)

DetalleVenta(id_venta*, nombre_producto*, precio_producto, nombre_categoria,
             nombre_proveedor, cantidad, precio_unitario)
```


---

### 2FN — Segunda Forma Normal


**Problemas detectados en DetalleVenta** (llave compuesta: id_venta + nombre_producto):
- `precio_producto` depende solo de `nombre_producto`
- `nombre_categoria` depende solo de `nombre_producto`
- `nombre_proveedor` depende solo de `nombre_producto`


**Solución — se extraen las dependencias parciales:**

```
Cliente(id_cliente*, nombre, apellido, telefono, email)
Empleado(id_empleado*, nombre, apellido, cargo, telefono, email)
Venta(id_venta*, fecha, total, id_cliente**, id_empleado**)
Producto(id_producto*, nombre, descripcion, precio, stock, id_categoria**, id_proveedor**)
DetalleVenta(id_detalle*, cantidad, precio_unitario, id_venta**, id_producto**)
```

---

### 3FN — Tercera Forma Normal

No existen dependencias transitivas después de 2FN. Cada atributo depende únicamente de la llave primaria de su tabla. 

Se agregan Categoría y Proveedor como tablas independientes, que ya fueron extraídas en el paso anterior.

---

## Modelo Relacional Final

Notación: `*` = llave primaria, `**` = llave foránea

```
Categoria(id_categoria*, nombre, descripcion)

Proveedor(id_proveedor*, nombre, telefono, email, direccion)

Producto(id_producto*, nombre, descripcion, precio, stock,
         id_categoria** → Categoria, id_proveedor** → Proveedor)

Empleado(id_empleado*, nombre, apellido, telefono, email, cargo)

Cliente(id_cliente*, nombre, apellido, telefono, email)

Venta(id_venta*, fecha, total,
      id_cliente** → Cliente, id_empleado** → Empleado)

DetalleVenta(id_detalle*, cantidad, precio_unitario,
             id_venta** → Venta, id_producto** → Producto)
```

---

## Cardinalidades

| Entidad A | Cardinalidad | Entidad B | Descripción |
|---|---|---|---|
| Categoria | 1 — N | Producto | Una categoría agrupa muchos productos |
| Proveedor | 1 — N | Producto | Un proveedor suministra muchos productos |
| Producto | 1 — N | DetalleVenta | Un producto aparece en muchas líneas de venta |
| Venta | 1 — N | DetalleVenta | Una venta tiene muchas líneas de detalle |
| Cliente | 1 — N | Venta | Un cliente realiza muchas ventas |
| Empleado | 1 — N | Venta | Un empleado atiende muchas ventas |

---

## Índices

```sql
-- Acelera reportes y filtros por fecha de venta
CREATE INDEX idx_venta_fecha ON Venta(fecha);

-- Acelera filtros de productos por categoría
CREATE INDEX idx_producto_categoria ON Producto(id_categoria);

-- Acelera consulta de detalles de una venta específica
CREATE INDEX idx_detalle_venta ON DetalleVenta(id_venta);

-- Acelera búsquedas de productos por proveedor
CREATE INDEX idx_producto_proveedor ON Producto(id_proveedor);
```

---

## Diagrama ER
<img width="1106" height="1280" alt="image" src="https://github.com/user-attachments/assets/9dc1d78d-6ec8-4be2-99b5-9532f7cbf357" />


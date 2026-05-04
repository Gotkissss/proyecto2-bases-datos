-- ========================
-- DDL
-- ========================
CREATE TABLE Categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

CREATE TABLE Proveedor (
    id_proveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT
);

CREATE TABLE Producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio NUMERIC(10,2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    id_categoria INTEGER NOT NULL REFERENCES Categoria(id_categoria),
    id_proveedor INTEGER NOT NULL REFERENCES Proveedor(id_proveedor)
);

CREATE TABLE Empleado (
    id_empleado SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    cargo VARCHAR(50)
);

CREATE TABLE Cliente (
    id_cliente SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100)
);

CREATE TABLE Venta (
    id_venta SERIAL PRIMARY KEY,
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),
    total NUMERIC(10,2) NOT NULL,
    id_cliente INTEGER NOT NULL REFERENCES Cliente(id_cliente),
    id_empleado INTEGER NOT NULL REFERENCES Empleado(id_empleado)
);

CREATE TABLE DetalleVenta (
    id_detalle SERIAL PRIMARY KEY,
    cantidad INTEGER NOT NULL,
    precio_unitario NUMERIC(10,2) NOT NULL,
    id_venta INTEGER NOT NULL REFERENCES Venta(id_venta),
    id_producto INTEGER NOT NULL REFERENCES Producto(id_producto)
);

-- ========================
-- ÍNDICES
-- ========================

-- Acelera reportes y filtros por fecha de venta
CREATE INDEX idx_venta_fecha ON Venta(fecha);

-- Acelera filtros de productos por categoría
CREATE INDEX idx_producto_categoria ON Producto(id_categoria);

-- Acelera consulta de detalles de una venta específica
CREATE INDEX idx_detalle_venta ON DetalleVenta(id_venta);

-- Acelera búsquedas de productos por proveedor
CREATE INDEX idx_producto_proveedor ON Producto(id_proveedor);

-- ========================
-- SEED DATA
-- ========================

INSERT INTO Categoria (nombre, descripcion) VALUES
('Electrónica',       'Dispositivos y accesorios electrónicos'),
('Ropa',              'Prendas de vestir para toda la familia'),
('Alimentos',         'Productos alimenticios no perecederos'),
('Hogar',             'Artículos para el hogar y decoración'),
('Deportes',          'Equipos y ropa deportiva'),
('Juguetes',          'Juguetes y juegos para niños'),
('Librería',          'Libros, cuadernos y útiles escolares'),
('Belleza',           'Cosméticos y productos de cuidado personal'),
('Ferretería',        'Herramientas y materiales de construcción'),
('Automotriz',        'Accesorios y repuestos para vehículos'),
('Mascotas',          'Alimentos y accesorios para mascotas'),
('Jardín',            'Plantas, tierra y herramientas de jardín'),
('Farmacia',          'Medicamentos y productos de salud'),
('Música',            'Instrumentos y accesorios musicales'),
('Computación',       'Hardware, software y periféricos'),
('Fotografía',        'Cámaras y accesorios fotográficos'),
('Viajes',            'Maletas, mochilas y accesorios de viaje'),
('Oficina',           'Insumos y muebles de oficina'),
('Bebidas',           'Bebidas embotelladas y en polvo'),
('Limpieza',          'Productos de limpieza del hogar'),
('Iluminación',       'Lámparas, focos y accesorios de luz'),
('Seguridad',         'Cámaras, candados y sistemas de seguridad'),
('Textiles',          'Telas, hilos y accesorios de costura'),
('Papelería',         'Papel, sobres y artículos de escritorio'),
('Telecomunicaciones','Teléfonos, planes y accesorios de red');

INSERT INTO Proveedor (nombre, telefono, email, direccion) VALUES
('Distribuidora Tech S.A.',    '22001100', 'ventas@disttech.com',     'Zona 9, Guatemala'),
('Textiles del Norte',         '23001200', 'info@texnorte.com',       'Zona 1, Quetzaltenango'),
('Alimentos Frescos Ltda.',    '24001300', 'pedidos@alfrescos.com',   'Zona 3, Escuintla'),
('HogarPlus Guatemala',        '25001400', 'soporte@hogarplus.com',   'Zona 10, Guatemala'),
('SportZone Importaciones',    '26001500', 'sport@sportzone.com',     'Zona 4, Guatemala'),
('JugueTodo S.A.',             '27001600', 'ventas@juguetodo.com',    'Zona 11, Guatemala'),
('Editorial Centroamericana',  '28001700', 'editorial@centroa.com',   'Zona 2, Guatemala'),
('Belleza Total Dist.',        '29001800', 'belleza@btotal.com',      'Zona 13, Guatemala'),
('Ferretería Industrial',      '30001900', 'ferro@industrial.com',    'Zona 5, Villa Nueva'),
('AutoPartes GT',              '31002000', 'autopartes@apgt.com',     'Zona 7, Mixco'),
('PetWorld Guatemala',         '32002100', 'pets@petworld.com',       'Zona 12, Guatemala'),
('Jardines del Sur',           '33002200', 'jardines@sur.com',        'Zona 6, Petapa'),
('Farmacorp',                  '34002300', 'farmacorp@corp.com',      'Zona 15, Guatemala'),
('Musicalia GT',               '35002400', 'musicalia@gt.com',        'Zona 1, Guatemala'),
('Computek S.A.',              '36002500', 'computek@sa.com',         'Zona 10, Guatemala'),
('FotoImport',                 '37002600', 'foto@import.com',         'Zona 14, Guatemala'),
('Viajero Distrib.',           '38002700', 'viajero@dist.com',        'Zona 8, Guatemala'),
('OficMax Guatemala',          '39002800', 'ofic@max.com',            'Zona 11, Guatemala'),
('Bebidas Unidos',             '40002900', 'bebidas@unidos.com',      'Zona 3, Guatemala'),
('CleanPro Dist.',             '41003000', 'clean@pro.com',           'Zona 6, Guatemala'),
('LuzTotal',                   '42003100', 'luz@total.com',           'Zona 9, Guatemala'),
('SecureGT',                   '43003200', 'secure@gt.com',           'Zona 10, Guatemala'),
('Textilera Maya',             '44003300', 'maya@textilera.com',      'Zona 1, Antigua'),
('PapelFácil',                 '45003400', 'papel@facil.com',         'Zona 2, Guatemala'),
('TelecomGT',                  '46003500', 'telecom@gt.com',          'Zona 4, Guatemala');

INSERT INTO Empleado (nombre, apellido, telefono, email, cargo) VALUES
('Carlos',   'Méndez',    '55001001', 'cmendez@tienda.com',    'Vendedor'),
('Ana',      'López',     '55001002', 'alopez@tienda.com',     'Vendedor'),
('Luis',     'García',    '55001003', 'lgarcia@tienda.com',    'Supervisor'),
('María',    'Pérez',     '55001004', 'mperez@tienda.com',     'Vendedor'),
('José',     'Ramírez',   '55001005', 'jramirez@tienda.com',   'Cajero'),
('Sofía',    'Torres',    '55001006', 'storres@tienda.com',    'Vendedor'),
('Pedro',    'Castillo',  '55001007', 'pcastillo@tienda.com',  'Supervisor'),
('Laura',    'Flores',    '55001008', 'lflores@tienda.com',    'Cajero'),
('Diego',    'Morales',   '55001009', 'dmorales@tienda.com',   'Vendedor'),
('Valeria',  'Juárez',    '55001010', 'vjuarez@tienda.com',    'Vendedor'),
('Miguel',   'Hernández', '55001011', 'mhernandez@tienda.com', 'Gerente'),
('Claudia',  'Vásquez',   '55001012', 'cvasquez@tienda.com',   'Cajero'),
('Roberto',  'Cruz',      '55001013', 'rcruz@tienda.com',      'Vendedor'),
('Gabriela', 'Ortiz',     '55001014', 'gortiz@tienda.com',     'Vendedor'),
('Fernando', 'Reyes',     '55001015', 'freyes@tienda.com',     'Supervisor'),
('Paola',    'Aguilar',   '55001016', 'paguilar@tienda.com',   'Cajero'),
('Andrés',   'Soto',      '55001017', 'asoto@tienda.com',      'Vendedor'),
('Carmen',   'Ramos',     '55001018', 'cramos@tienda.com',     'Vendedor'),
('Héctor',   'Núñez',     '55001019', 'hnunez@tienda.com',     'Gerente'),
('Daniela',  'Vargas',    '55001020', 'dvargas@tienda.com',    'Cajero'),
('Ricardo',  'Sandoval',  '55001021', 'rsandoval@tienda.com',  'Vendedor'),
('Mónica',   'Estrada',   '55001022', 'mestrada@tienda.com',   'Supervisor'),
('Álvaro',   'Fuentes',   '55001023', 'afuentes@tienda.com',   'Vendedor'),
('Patricia', 'Lemus',     '55001024', 'plemus@tienda.com',     'Cajero'),
('Ernesto',  'Barrera',   '55001025', 'ebarrera@tienda.com',   'Vendedor');

INSERT INTO Cliente (nombre, apellido, telefono, email) VALUES
('Juan',      'Alvarado',   '60001001', 'jalvarado@mail.com'),
('Rosa',      'Cifuentes',  '60001002', 'rcifuentes@mail.com'),
('Marco',     'Dávila',     '60001003', 'mdavila@mail.com'),
('Elena',     'Espinoza',   '60001004', 'eespinoza@mail.com'),
('Tomás',     'Figueroa',   '60001005', 'tfigueroa@mail.com'),
('Irene',     'Godínez',    '60001006', 'igodinez@mail.com'),
('Samuel',    'Herrera',    '60001007', 'sherrera@mail.com'),
('Diana',     'Ibáñez',     '60001008', 'dibanez@mail.com'),
('Rodrigo',   'Juárez',     '60001009', 'rjuarez@mail.com'),
('Silvia',    'Kestler',    '60001010', 'skestler@mail.com'),
('Alejandro', 'Lorenzana',  '60001011', 'alorenzana@mail.com'),
('Natalia',   'Mejía',      '60001012', 'nmejia@mail.com'),
('Óscar',     'Navarro',    '60001013', 'onavarro@mail.com'),
('Beatriz',   'Orellana',   '60001014', 'borellana@mail.com'),
('Guillermo', 'Pineda',     '60001015', 'gpineda@mail.com'),
('Lucía',     'Quiñónez',   '60001016', 'lquinonez@mail.com'),
('Arturo',    'Recinos',    '60001017', 'arecinos@mail.com'),
('Verónica',  'Salazar',    '60001018', 'vsalazar@mail.com'),
('Enrique',   'Tojín',      '60001019', 'etojin@mail.com'),
('Flor',      'Urrutia',    '60001020', 'furrutia@mail.com'),
('Gerardo',   'Villagrán',  '60001021', 'gvillagran@mail.com'),
('Wendy',     'Xicará',     '60001022', 'wxicara@mail.com'),
('Hugo',      'Yanes',      '60001023', 'hyanes@mail.com'),
('Miriam',    'Zelada',     '60001024', 'mzelada@mail.com'),
('Byron',     'Acabal',     '60001025', 'bacabal@mail.com');

INSERT INTO Producto (nombre, descripcion, precio, stock, id_categoria, id_proveedor) VALUES
('Laptop 15"',         'Laptop con 8GB RAM y 256GB SSD',      4500.00, 30,  1,  1),
('Camiseta Polo',      'Camiseta polo de algodón talla M',       85.00,150,  2,  2),
('Arroz Doña María',   'Arroz blanco 5 libras',                  28.00,300,  3,  3),
('Lámpara de mesa',    'Lámpara LED con 3 niveles de brillo',   120.00, 60,  4,  4),
('Balón de fútbol',    'Balón oficial tamaño 5',                  95.00, 80,  5,  5),
('Lego Classic',       'Set de 500 piezas para construcción',   250.00, 45,  6,  6),
('Matemática 10',      'Libro de texto de matemática escolar',    65.00,200,  7,  7),
('Shampoo Pro',        'Shampoo para cabello seco 400ml',         55.00,120,  8,  8),
('Martillo Stanley',   'Martillo de carpintero 16oz',             90.00, 70,  9,  9),
('Aceite de motor',    'Aceite sintético 5W-30 1 litro',         115.00, 90, 10, 10),
('Alimento para perro','Croquetas premium 3kg',                  180.00, 55, 11, 11),
('Manguera 10m',       'Manguera reforzada para jardín',          95.00, 40, 12, 12),
('Ibuprofeno 400mg',   'Caja de 20 tabletas',                     18.00,500, 13, 13),
('Guitarra acústica',  'Guitarra de 6 cuerdas, tono natural',    650.00, 20, 14, 14),
('Mouse inalámbrico',  'Mouse óptico 1600 DPI sin cable',         75.00,100, 15,  1),
('Cámara Canon',       'Cámara réflex 24MP con lente 18-55',   3200.00, 15, 16, 16),
('Maleta de viaje',    'Maleta rígida 24 pulgadas con ruedas',   420.00, 35, 17, 17),
('Silla de oficina',   'Silla ergonómica con soporte lumbar',    850.00, 25, 18, 18),
('Jugo de naranja',    'Jugo natural 1 litro sin conservantes',   22.00,200, 19, 19),
('Desinfectante',      'Desinfectante multiusos 1 litro',         35.00,180, 20, 20),
('Foco LED 9W',        'Foco LED de bajo consumo luz blanca',     15.00,400, 21, 21),
('Candado combinación','Candado de 4 dígitos resistente',         48.00, 90, 22, 22),
('Tela de algodón',    'Tela 100% algodón por metro',             32.00,250, 23, 23),
('Resma de papel',     'Resma 500 hojas carta 75g',               48.00,300, 24, 24),
('Router WiFi',        'Router dual band 750 Mbps',              320.00, 50, 25, 25);

INSERT INTO Venta (fecha, total, id_cliente, id_empleado) VALUES
('2026-01-05 09:00:00', 4585.00,  1,  1),
('2026-01-08 10:30:00',  170.00,  2,  2),
('2026-01-10 11:00:00',   56.00,  3,  3),
('2026-01-12 14:00:00',  345.00,  4,  4),
('2026-01-15 09:30:00',  190.00,  5,  5),
('2026-01-18 16:00:00',  315.00,  6,  6),
('2026-01-20 10:00:00', 3275.00,  7,  7),
('2026-01-22 11:30:00',  250.00,  8,  8),
('2026-01-25 13:00:00',  180.00,  9,  9),
('2026-02-01 09:00:00',  640.00, 10, 10),
('2026-02-03 10:00:00',  850.00, 11, 11),
('2026-02-05 14:30:00',   90.00, 12, 12),
('2026-02-07 15:00:00',  420.00, 13, 13),
('2026-02-10 09:00:00',  155.00, 14, 14),
('2026-02-12 11:00:00',  368.00, 15, 15),
('2026-02-14 16:30:00',  130.00, 16, 16),
('2026-02-17 10:00:00',  960.00, 17, 17),
('2026-02-19 13:30:00',   44.00, 18, 18),
('2026-02-21 09:30:00',  215.00, 19, 19),
('2026-02-24 14:00:00',  320.00, 20, 20),
('2026-03-01 10:00:00',  150.00, 21, 21),
('2026-03-03 11:00:00',  650.00, 22, 22),
('2026-03-05 15:00:00',   85.00, 23, 23),
('2026-03-07 09:00:00',  480.00, 24, 24),
('2026-03-10 10:30:00',  700.00, 25, 25);

INSERT INTO DetalleVenta (cantidad, precio_unitario, id_venta, id_producto) VALUES
(1, 4500.00,  1,  1),
(1,   85.00,  2,  2),
(2,   28.00,  3,  3),
(1,  120.00,  4,  4),
(2,   95.00,  5,  5),
(1,  250.00,  6,  6),
(1, 3200.00,  7, 16),
(1,  250.00,  8,  6),
(1,  180.00,  9, 11),
(1,  640.00, 10, 14),
(1,  850.00, 11, 18),
(1,   90.00, 12,  9),
(1,  420.00, 13, 17),
(1,   65.00, 14,  7),
(2,   75.00, 15, 15),
(2,   55.00, 16,  8),
(1,  320.00, 17, 25),
(2,   22.00, 18, 19),
(1,  215.00, 19,  4),
(2,   48.00, 20, 22),
(3,   15.00, 21, 21),
(1,  650.00, 22, 14),
(1,   85.00, 23,  2),
(2,   32.00, 24, 23),
(2,   48.00, 25, 24);
from sqlalchemy import Column, Integer, String, Numeric, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class Categoria(Base):
    __tablename__ = "categoria"

    id_categoria = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text)

    productos = relationship("Producto", back_populates="categoria")


class Proveedor(Base):
    __tablename__ = "proveedor"

    id_proveedor = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    telefono = Column(String(20))
    email = Column(String(100))
    direccion = Column(Text)

    productos = relationship("Producto", back_populates="proveedor")


class Producto(Base):
    __tablename__ = "producto"

    id_producto = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    descripcion = Column(Text)
    precio = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    id_categoria = Column(Integer, ForeignKey("categoria.id_categoria"), nullable=False)
    id_proveedor = Column(Integer, ForeignKey("proveedor.id_proveedor"), nullable=False)

    categoria = relationship("Categoria", back_populates="productos")
    proveedor = relationship("Proveedor", back_populates="productos")
    detalles = relationship("DetalleVenta", back_populates="producto")


class Empleado(Base):
    __tablename__ = "empleado"

    id_empleado = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    telefono = Column(String(20))
    email = Column(String(100))
    cargo = Column(String(50))

    ventas = relationship("Venta", back_populates="empleado")


class Cliente(Base):
    __tablename__ = "cliente"

    id_cliente = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    telefono = Column(String(20))
    email = Column(String(100))

    ventas = relationship("Venta", back_populates="cliente")


class Venta(Base):
    __tablename__ = "venta"

    id_venta = Column(Integer, primary_key=True, index=True)
    fecha = Column(TIMESTAMP, nullable=False)
    total = Column(Numeric(10, 2), nullable=False)
    id_cliente = Column(Integer, ForeignKey("cliente.id_cliente"), nullable=False)
    id_empleado = Column(Integer, ForeignKey("empleado.id_empleado"), nullable=False)

    cliente = relationship("Cliente", back_populates="ventas")
    empleado = relationship("Empleado", back_populates="ventas")
    detalles = relationship("DetalleVenta", back_populates="venta")


class DetalleVenta(Base):
    __tablename__ = "detalleventa"

    id_detalle = Column(Integer, primary_key=True, index=True)
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Numeric(10, 2), nullable=False)
    id_venta = Column(Integer, ForeignKey("venta.id_venta"), nullable=False)
    id_producto = Column(Integer, ForeignKey("producto.id_producto"), nullable=False)

    venta = relationship("Venta", back_populates="detalles")
    producto = relationship("Producto", back_populates="detalles")


class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(20), nullable=False, default="vendedor")
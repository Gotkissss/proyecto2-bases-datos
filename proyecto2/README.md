# Proyecto 2 — Sistema de Inventario y Ventas

Diego Quixchan – 24903  
Bases de Datos 1, Sección 20  
Universidad del Valle de Guatemala

## Tecnologías

- **Base de datos:** PostgreSQL 15
- **Backend:** Python + FastAPI
- **Frontend:** React + Vite
- **Infraestructura:** Docker + Docker Compose

## Requisitos

- Docker Desktop instalado y corriendo
- Git

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
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Docs API: http://localhost:8000/docs

## Credenciales de base de datos

| Variable | Valor |
|---|---|
| Usuario | proy2 |
| Contraseña | secret |
| Base de datos | tienda |
| Puerto | 5432 |
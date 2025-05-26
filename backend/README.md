# Backend - API para Aplicativo de Tareas con DHTMLX Gantt

Este backend está desarrollado en **Node.js** usando **Express** y utiliza **SQLite** como base de datos para almacenar y gestionar la información de tareas y subtareas.

---

## Descripción

El backend sirve como API REST bajo la ruta `/api` para manejar todas las operaciones relacionadas con las tareas. También puede servir el frontend React compilado en producción.

---

## Características principales

- API REST para CRUD de tareas y subtareas.
- Uso de SQLite para persistencia de datos.
- Soporte para CORS para permitir la comunicación con el frontend React.
- Monitorización y reinicio automático con `nodemon` en desarrollo.

---

## Archivo `package.json`

```json
{
  "name": "backend",
  "version": "1.0.0",
  "description": "Backend para servir la API y el frontend de React.",
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js",
    "postinstall": "cd ../frontend && npm install && npm run build"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^5.1.0",
    "sqlite3": "^5.1.7"
  },
  "devDependencies": {
    "nodemon": "^3.1.10"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}

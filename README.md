# Aplicativo de Tareas con DHTMLX Gantt (React + Node.js + SQLite)

Este proyecto es una aplicación de gestión de tareas que utiliza **DHTMLX Gantt** para la visualización y manejo de tareas en formato de diagrama de Gantt. Está desarrollado con **React** en el frontend, **Node.js** en el backend y utiliza una base de datos **SQLite** para almacenamiento.

## Características principales

- Visualización y edición de tareas y subtareas con DHTMLX Gantt.
- Backend RESTful API en Node.js accesible desde `/api`.
- Persistencia de datos en base SQLite.
- Proyecto dividido en dos carpetas principales: `frontend` (React) y `backend` (Node.js).
- Proyecto desplegado y 100% funcional en:  
  [https://prueba-tecnica-dhtmlx.onrender.com](https://prueba-tecnica-dhtmlx.onrender.com)

---

## Ejecutar el proyecto localmente

Para ejecutar tanto el backend como el frontend en modo desarrollo, solo necesitas ejecutar el siguiente comando en la raíz del proyecto:

```json
"scripts": {
  "start": "concurrently \"npm run server\" \"npm run client\"",
  "server": "cd backend && nodemon app.js",
  "client": "cd frontend && npm start"
}

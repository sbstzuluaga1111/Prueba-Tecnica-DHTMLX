const express = require('express');
const router = express.Router();

const taskController = require('../controllers/Tareas.Controller.js');
const subTareasController = require('../controllers/SubTareas.Controller.js');

// RUTAS PARA LAS TAREAS PRINCIPALES
router.get('/tareas', taskController.getAllTasks);          // Listar tareas principales
router.post('/tareas', taskController.createTask);          // Crear tarea principal
router.put('/tareas/:id', taskController.updateTask);       // Actualizar tarea principal
router.delete('/tareas/:id', taskController.deleteTask);    // Eliminar tarea principal

// RUTAS PARA LAS SUBTAREAS DE UNA TAREA PRINCIPAL
router.get('/tareas/:taskId/subtareas', (req, res, next) => {
  req.params.parentId = Number(req.params.taskId);
  next();
}, subTareasController.getSubTasksByParent);                // Listar subtareas por parent

router.post('/tareas/:taskId/subtareas', (req, res, next) => {
  req.body.parent = Number(req.params.taskId);
  next();
}, subTareasController.createSubTask);                      // Crear subtarea

router.put('/subtareas/:id', subTareasController.updateSubTask);    // Actualizar subtarea
router.delete('/subtareas/:id', subTareasController.deleteSubTask); // Eliminar subtarea

module.exports = router;

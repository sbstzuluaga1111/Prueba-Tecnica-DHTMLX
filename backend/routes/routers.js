const express = require('express');
const router = express.Router();
const taskController = require('../controllers/Tareas.Controller.js');
const subtaskController = require('../controllers/SubTareas.Controller.js');

// RUTAS PARA LAS TAREAS PRINCIPALES
router.get('/tareas', taskController.getAllTasks);
router.post('/tareas', taskController.createTask);
router.get('/tareas/:id', taskController.getTaskById);
router.put('/tareas/:id', taskController.updateTask);
router.delete('/tareas/:id', taskController.deleteTask);

// RUTAS PARA LAS SUBTAREAS RELACIONADAS A UNA TAREA
router.get('/tareas/:taskId/subtareas', subtaskController.getSubtasksByTaskId);
router.post('/tareas/:taskId/subtareas', subtaskController.createSubtask);

module.exports = router;

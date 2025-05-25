const express = require('express');
const router = express.Router();
const taskController = require('../controllers/Tareas.Controller');
const subtaskController = require('../controllers/SubTareas.Controller');

//RUTAS PARA LAS TAREAS PRINCIPALES
router.get('/tareas', taskController.getAllTasks);
router.post('/tareas', taskController.createTask);

//RUTAS PARA LAS SUBTAREAS
router.get('/tasks/:taskId/subtasks', subtaskController.getSubtasksByTaskId);
router.post('/subtasks', subtaskController.createSubtask);

module.exports = router;

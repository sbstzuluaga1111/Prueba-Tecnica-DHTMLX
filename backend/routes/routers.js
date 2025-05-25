const express = require('express');
const router = express.Router();
const taskController = require('../controllers/Tareas.Controller.js');
const subTareasController = require('../controllers/SubTareas.Controller.js');

// RUTAS PARA LAS TAREAS PRINCIPALES
router.get('/tareas', taskController.getAllTasks);
router.post('/tareas', taskController.createTask);
router.get('/tareas/:id', taskController.getTaskById);
router.get('/tareas/:id/con-subtareas', taskController.getTaskWithSubtasks);
router.put('/tareas/:id', taskController.updateTask);
router.delete('/tareas/:id', taskController.deleteTask);

// RUTAS PARA LAS SUBTAREAS RELACIONADAS A UNA TAREA
router.get('/tareas/:taskId/subtareas', subTareasController.getSubtasksByTaskId); 
router.post('/tareas/:taskId/subtareas', subTareasController.createSubtask);      
router.get('/subtareas/sin-asignar', subTareasController.getUnassignedSubtasks);  
router.put('/subtareas/:id', subTareasController.updateSubtask);                  
router.delete('/subtareas/:id', subTareasController.deleteSubtask);               
router.put('/subtareas/:id/reasignar', subTareasController.reassignSubtask);      
router.post('/subtareas/:id/convertir-a-tarea', subTareasController.convertSubtaskToTask);

module.exports = router;

const express = require('express');
const router = express.Router();

const taskController = require('../controllers/Tareas.Controller.js');
const subTareasController = require('../controllers/SubTareas.Controller.js');
const linksController = require('../controllers/Enlaces.Controller.js');

// RUTAS PARA LAS TAREAS PRINCIPALES
router.get('/tareas', taskController.getAllTasks);          
router.post('/tareas', taskController.createTask);          
router.put('/tareas/:id', taskController.updateTask);       
router.delete('/tareas/:id', taskController.deleteTask);

// RUTAS PARA LAS SUBTAREAS DE UNA TAREA PRINCIPAL
router.get('/tareas/:taskId/subtareas', (req, res, next) => {
  req.params.parentId = Number(req.params.taskId);
  next();
}, subTareasController.getSubTasksByParent);                

router.post('/tareas/:taskId/subtareas', (req, res, next) => {
  req.body.parent = Number(req.params.taskId);
  next();
}, subTareasController.createSubTask);                      

router.put('/subtareas/:id', subTareasController.updateSubTask);    
router.delete('/subtareas/:id', subTareasController.deleteSubTask);


// Obtener todos los links (relaciones entre tareas)
router.get('/links', linksController.getAllLinks);
router.post('/links', linksController.createLink);
router.put('/links/:id', linksController.updateLink);
router.delete('/links/:id', linksController.deleteLink);

module.exports = router;

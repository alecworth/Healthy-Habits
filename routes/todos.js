const express = require('express')
const router = express.Router()
const todosController = require('../controllers/todos') 
const { ensureAuth } = require('../middleware/auth')

router.post('/createTodo', todosController.createTodo)

router.post('/logCompletion', todosController.logCompletion)

router.get('/', ensureAuth, todosController.getTodos)

router.put('/markComplete', todosController.markComplete)

router.put('/markIncomplete', todosController.markIncomplete)

router.delete('/deleteTodo', todosController.deleteTodo)

router.delete('/deleteCompletion', todosController.deleteCompletion);

module.exports = router
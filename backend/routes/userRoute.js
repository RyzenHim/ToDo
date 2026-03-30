const express = require('express')
const router = express.Router()
const userController = require('../controller/userController')
const auth = require('../middleware/auth')

router.post('/signup', userController.signup)
router.post('/login', userController.login)
router.get('/all', auth, userController.all)
router.get('/profile', auth, userController.profile)
router.post('/assigntask', auth, userController.assigntask)
router.patch('/update', auth, userController.update)
router.get('/mytasks', auth, userController.mytasks)
router.patch('/updatetask/:id', auth, userController.updateTask)
router.post('/practice', auth, userController.practice)
router.delete("/deletetask/:id", auth, userController.deleteTask
);
router.get("/getAllTasks", auth, userController.getAllTasks);
router.patch("/tasks/reassign/:taskId", auth, userController.reassignTask);
router.delete("/user/:id", auth, userController.deleteUser);


module.exports = router
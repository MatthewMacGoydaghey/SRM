const express = require('express')
const router = express.Router()
const AuthContoller = require('../controllers/authController')
const Controller = new AuthContoller()
const authorization = require('../middleware/authVerify')



router.post('/reg', Controller.regUser)

router.post('/', Controller.authUser)

router.get('/refresh', Controller.handleRefreshToken)

router.delete('/refresh', Controller.logout)

router.get('/', authorization, Controller.getUsers)

router.get('/:id', authorization, Controller.getUser)

router.patch('/', authorization, Controller.updateUser)

router.delete('/:id', authorization, Controller.deleteUser)


module.exports = router
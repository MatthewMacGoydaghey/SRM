const express = require('express')
const router = express.Router()
const OrderController = require('../controllers/orderController')
const Controller = new OrderController()


router.post('/', Controller.addOrder)

router.get('/', Controller.getOrders)

router.get('/:id', Controller.getOrder)

router.patch('/:id', Controller.updateOrder)

router.patch('/', Controller.rateOrder)


module.exports = router
const express = require('express')
const router = express.Router()
const path = require('path')
const ChatController = require('../controllers/chatController')
const Controller = new ChatController()
const authorization = require('../middleware/authVerify')

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "..", "HTML", "chat.html"))
})


router.post('/', authorization, Controller.postMessage)


router.get('/:id', authorization, Controller.getMessages)




module.exports = router
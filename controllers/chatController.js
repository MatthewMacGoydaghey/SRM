const db = require('../db')



class OrderController {


async postMessage(req, res) {
  try {
    const userId = req.user.id
    const {chatId, message} = req.body
    if (!chatId) {
      return res.status(404).json('ChatId needed')
    }
    let userRole = req.user.role
    if (userRole === "Client") { 
      userRole = 'clientid'
    } else {
      userRole = 'providerid'
    } 
  const userData = await db.query(`SELECT * FROM usermodel WHERE id = ${userId}`)
  const user = userData.rows[0]
  const ifChatHasUser = await db.query(`SELECT * FROM chatmodel WHERE ${userRole} = ${userId}`)
  const chats = ifChatHasUser.rows
  for (let chat of chats) {
    if (chat.id === chatId) {
      const createdMessage = await db.query(`INSERT INTO messages(chatid, username, postdate, usermessage) VALUES($1, $2, $3, $4) RETURNING *`,
  [chatId, user.username, '00:00:00', message])
  return res.status(200).json(createdMessage)
    }
  }
  return res.sendStatus(403)
  } catch (error) {
    res.status(400).json(error)
  }
}



 async getMessages(req, res) {
  try {
    const chatId = req.params.id
const userId = req.user.id
let userRole = req.user.role
    if (userRole === "Client") {
      userRole = 'clientid'
    } else {
      userRole = 'providerid'
    }

    const ifChatHasUser = await db.query(`SELECT * FROM chatmodel WHERE ${userRole} = ${userId}`)
  const chats = ifChatHasUser.rows
  for (let chat of chats) {
    if (chat.id == chatId) {
      const messagesData = await db.query(`SELECT * FROM messages WHERE chatid = ${chatId}`)
      const messages = messagesData.rows
      const userData = await db.query(`SELECT * FROM usermodel WHERE id = ${userId}`)
      const user = userData.rows[0]
      let newMessagesArray = [];
      // Loop defines the affilation of message and in case message belongs to requsted user, adds new key "viewer" with true value in object
      // In front-end part messages with key "viewer: true" will be renderered as requsted user's messages
      for (let message of messages) {
         if (message.username === user.username) {
         message.viewer = true
         }
         newMessagesArray.push(message)
      }
   return res.status(200).json(newMessagesArray)
    }
 }
 return res.sendStatus(403)
  } catch (error) {
    res.status(400).json(error)
  }



}


}


module.exports = OrderController
const express = require('express')
const path = require('path')
const app = express()
const cookieParser = require('cookie-parser')
const authorization = require('./middleware/authVerify')
const uuid = require('uuid')


const { PORT } = require('./config')


const webSocket = require('ws')
const wsServer = new webSocket.Server({port: 3001})
const wsClients = [];



wsServer.on('connection', (client) => {
 console.log('User connected')
 client.on('message', (data) => {
 const jsonData = JSON.parse(data.toString())
 const {chatId, message} = jsonData
 // if statement defines if function gets request for authorization from new client or message to send from authorized client
 // Loop defines which client should get render message according to clients's "chatId" key
 if (!message) {
 const userId = uuid.v4()
 client.id = userId
 client.chatId = chatId
 wsClients.push(client)
} else {
  for (client of wsClients) {
    if (client.chatId === chatId) {
    client.send('RENDER')
    }
  }
}
 })

 client.on('close', () => {
  console.log('User disconnected')
  delete wsClients[client.id]
 })
})




app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`)
})

app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())
app.use(cookieParser())


app.use('/auth', require('./routes/auth'))
app.use('/proposals', authorization, require('./routes/proposals'))
app.use('/orders', authorization, require('./routes/orders'))
app.use('/chat', require('./routes/chat'))

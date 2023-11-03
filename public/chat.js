const chatInput = document.querySelector('.chatInput')
const tokenInput = document.querySelector('.tokenInput')
const startButton = document.querySelector('.startButton')
let accessToken;
let ws;

const chatDiv = document.querySelector('.chatDiv')
const messageInput = document.querySelector('.messageInput')
const sendMessageButton = document.querySelector('.sendMessageButton')







startButton.onclick = async (method) => {
  // Function gets messages data from DB and connects user to WebSocket server
  // If "method" value equals "RENDER", only gets messages data and starts render function
  let chatId = chatInput.value
  accessToken = tokenInput.value
  fetch(`http://localhost:3000/chat/${chatId}`, {
    method: 'GET',
    credentials: "include",
  headers: {
    'Content-Type': 'application/json;charset=utf-8',
    'Authorization': `Bearer ${accessToken}`
  }
  })
  .then((response) => {
    return response.json()
  })
  .then((data) => {
    renderMessages(data)
    if (!(method === 'RENDER')) {
      initSocket()
      chatId = parseInt(chatId)
      setTimeout(() => {
        ws.send(JSON.stringify({"chatId": chatId}))
      }, 200)
    }
  })
}



function initSocket() {
if (ws) {
  ws.onerror = ws.onopen = ws.onclose = null
  ws.close()
}
 ws = new WebSocket('ws://localhost:3001')
 
  ws.onopen = () => {
    console.log('Connected to WS')
  }

  ws.onmessage = (message) => {
    if (message.data = 'RENDER') {
      startButton.onclick('RENDER')
    }
  }

  ws.onerror = (err) => {
    console.log(err)
  }
}



const renderMessages = async (posts) => {
  chatDiv.innerHTML = ``
for (let post of posts) {
  if (post.viewer) {
    const messageDiv = document.createElement('div')
    messageDiv.innerHTML = `<div class="postDiv">
    <p class="message">${post.username}:</p>
    <p class="message">${post.usermessage}</p>
    <div>`
    messageDiv.classList.add('messageDiv', 'viewer')
    chatDiv.appendChild(messageDiv)
  } else {
    const messageDiv = document.createElement('div')
    messageDiv.innerHTML = `<div class="postDiv">
    <p class="message">${post.username}:</p>
    <p class="message">${post.usermessage}</p>
    <div>`
    messageDiv.classList.add('messageDiv')
    chatDiv.appendChild(messageDiv)
  }
}
}



sendMessageButton.onclick = async () => {
  // Sends message data to DB and user's chatId to WebSocket server
  let chatId = chatInput.value
  accessToken = tokenInput.value
const message = messageInput.value
if (!message) {
  return console.log('No message')
}
chatId = parseInt(chatId)
const obj = {
  "chatId": chatId,
  "message": message
}
fetch(`http://localhost:3000/chat`, {
  method: 'POST',
  credentials: "include",
headers: {
  'Content-Type': 'application/json;charset=utf-8',
  'Authorization': `Bearer ${accessToken}`
},
body: JSON.stringify(obj)
})
.then((response) => {
  return response.json()
})
.then((data) => {
  ws.send(JSON.stringify(obj))
  
})
}

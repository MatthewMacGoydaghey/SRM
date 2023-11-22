const db = require('../db')



class OrderController {


 async addOrder(req, res) {
  try {
    const clientId = req.user.id
    const userRole = req.user.role
    if (!(userRole === 'Client')) {
    return res.sendStatus(403)
    }

    const {providerId, proposalId, quantity, totalcost} = req.body
    const proposalData = await db.query(`SELECT * FROM proposalmodel WHERE id = ${proposalId}`)
    const proposal = proposalData.rows[0]
    if (!(proposal.providerid === providerId)) {
      return res.status(400).json(`This provider does not have requested proposal`)
    }
    const createdOrder = await db.query(`INSERT INTO ordermodel(providerid, proposalid, clientid, quantity, totalcost)
     VALUES($1, $2, $3, $4, $5) RETURNING *`, [providerId, proposalId, clientId, quantity, totalcost])
     const order = createdOrder.rows[0]
     const createdChat = await db.query(`INSERT INTO chatmodel(orderid, clientid, providerid) VALUES($1, $2, $3) RETURNING *`, [order.id, order.clientid, order.providerid])
     const chat = createdChat.rows[0]
     await db.query(`UPDATE ordermodel SET chatid = $1 WHERE id = $2`, [chat.id, order.id])
     const orderData = await db.query(`SELECT * FROM ordermodel WHERE id = ${order.id}`)
     res.status(200).json(orderData.rows[0])
  } catch (error) {
    res.status(400).json(error)
  }
 }




 async getOrders(req, res) {
  try {
    const userId = req.user.id
    let userRole = req.user.role
    // if statement defines role of requsted user and sets postgre-compatible values for following SQL queries
    if (userRole === "Client") {
      userRole = 'clientid'
    } else {
      userRole = 'providerid'
    }
    const ordersData = await db.query(`SELECT * FROM ordermodel WHERE ${userRole} = ${userId}`)
    res.status(200).json(ordersData.rows)
  } catch (error) {
    res.status(400).json(error)
  }
 }



 async getOrder(req, res) {
  try {
    const orderId = req.params.id
    const userId = req.user.id
    let userRole = req.user.role
    if (userRole === "Client") {
      userRole = 'clientid'
    } else {
      userRole = 'providerid'
    }

    const orderData = await db.query(`SELECT * FROM ordermodel WHERE id = ${orderId}`)
    const order = orderData.rows[0]
    if (userRole === 'clientid') {
    if (!(userId === order.clientid)) {
      return res.sendStatus(403)
    }} else {
      if (!(userId === order.providerid)) {
        return res.sendStatus(403)
      }}
    res.status(200).json(order)
  } catch (error) {
    res.status(400).json(error)
  }
 }




 async updateOrder(req, res) {
  try {
    const orderid = req.params.id
    const userRole = req.user.role
    if (!(userRole === 'Provider')) {
     return res.sendStatus(403)
    }
    const {value} = req.body
    if (!(value === 'Sent' || "Being delivered" || "Completed" || "Failed")) {
      return res.sendStatus(400)
    }
    const updated = await db.query(`UPDATE ordermodel SET status = $1 WHERE id = $2`, [value, orderid])
    res.status(200).json(updated)
  } catch (error) {
    res.status(400).json(error)
  }
 }



 async rateOrder(req, res) {
  const user = req.user
  const {orderId, rate} = req.body

if (!orderId || !rate) {
  return res.status(404).json('orderId and rate not found')
}

let rating = 1[rate]

  let userId

  if (user.role === 'Client') {
    userId = 'clientid'
  } else if (user.role === 'Provider') {
    userId = 'providerid'
  }


  let orderData = await db.query(`SELECT * FROM ordermodel WHERE ${userId} = ${user.id}`)

  if (orderData.rowCount === 0) {
    return res.status(404).json('Order not found')
  }

let ratedUser

if (userId === 'Client') {
  ratedUser = orderData.rows[0].providerid
} else {
  ratedUser = orderData.rows[0].clientid
}

  if (orderId === orderData.rows[0].id) {
    let ratedUserData = await db.query(`SELECT * FROM usermodel WHERE id = ${ratedUser}`)
    let ratedUserId = ratedUserData.rows[0].id
    let setRating = await db.query(`UPDATE usermodel SET rating = $1 WHERE id = $2`, [rating, ratedUserId])
    return res.status(200).json(setRating)
  } else {
    return res.status(403).json('You can not set rating through this order')
  }

 }

}




module.exports = OrderController
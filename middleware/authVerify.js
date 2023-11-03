const jwt = require('jsonwebtoken')
const { ACCESS_SECRET} = require('../config')


const authorization = (req, res, next) => {
const bearer = req.header('Authorization')
if (!bearer) {
  return res.status(403).json('Bearer not found')
}
const token = bearer.split(' ')[1]
try {
  const verified = jwt.verify(token, ACCESS_SECRET)
  req.user = verified
next()
} catch (error) {
  res.status(403).json(error)
}
}


module.exports = authorization
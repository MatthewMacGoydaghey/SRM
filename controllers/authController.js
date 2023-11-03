const db = require('../db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const {ACCESS_SECRET, REFRESH_SECRET} = require('../config')

class AuthContoller {


async regUser(req, res) {
  try {
const { username, email, pwd, role, location } = req.body
const hashedPwd = await bcrypt.hash(pwd, 7)
const newPerson = await db.query('INSERT INTO usermodel(username, email, password, role, location) values ($1, $2, $3, $4, $5) RETURNING *',
 [username, email, hashedPwd, role, location])

res.status(200).json(newPerson.rows[0])
  } catch (error) {
    return res.status(400).json(error)
  }
}



async authUser(req, res) {
  try {
    const { email, pwd } = req.body
if (!email || !pwd) {
  return res.status(404).json('Data missing')
}
const userData = await db.query(`SELECT * FROM usermodel WHERE email = '${email}'`)
if (userData.rowCount === 0) {
  return res.status(400).json(`Email ${email} not found`)
}
const foundUser = userData.rows[0]
const pwdCorrect = bcrypt.compareSync(pwd, foundUser.password)
if (!pwdCorrect) {
  return res.status(403).json('Incorrect password')
}

const payload = {
  id: foundUser.id,
  role: foundUser.role
}

const access_token = jwt.sign(
  payload,
  ACCESS_SECRET,
  {expiresIn: "1h"}
)

const refresh_token = jwt.sign(
  payload,
  REFRESH_SECRET,
  {expiresIn: "1d"}
)

const tokenExists = await db.query(`SELECT * FROM refresh_token where userid = ${foundUser.id}`)
if (tokenExists.rowCount === 0) {
 await db.query('INSERT INTO refresh_token(userid, token) values ($1, $2) RETURNING *', [foundUser.id, refresh_token])
} else {
  const data = await db.query(`UPDATE refresh_token SET token = $1 WHERE userid = ${foundUser.id} RETURNING *`, [refresh_token])
}
res.cookie('jwt', refresh_token, {httpOnly: true, maxAge: 24 * 6000})
  res.status(200).json({foundUser, access_token})
}
   catch (error) {
    res.status(400).json(error)
  }
}



async handleRefreshToken(req, res) {
// When access token expired, updates refresh token in DB and user's cookies and gives new access token in response
  try {
    const bearer = req.cookies
    if (!bearer) {
      res.status(404).json('Bearer not found')
    }
  const token = bearer.jwt

  const verifiedToken = jwt.verify(token, REFRESH_SECRET)
  const checkedTokenData = await db.query(`SELECT * FROM refresh_token WHERE userid = ${verifiedToken.id}`)
  if (checkedTokenData.rowCount === 0) {
    return res.sendStatus(403)
  }
// "RowCount === 0" means refresh token from request does not exist in DB
  const foundToken = checkedTokenData.rows[0]
  if (!(foundToken.token === token)) {
    return res.sendStatus(403)
  }
  const userData = await db.query(`SELECT * FROM usermodel WHERE id = ${foundToken.userid}`)
  const foundUser = userData.rows[0]
const payload = {
  id: foundUser.id,
  role: foundUser.role
}

  const access_token = jwt.sign(
payload,
ACCESS_SECRET,
{expiresIn: '1h'}
  )

  const refresh_token = jwt.sign(
    payload,
    REFRESH_SECRET,
    {expiresIn: "1d"}
  )

await db.query(`UPDATE refresh_token SET token = $1 WHERE userid = ${foundUser.id} RETURNING *`, [refresh_token])

  res.cookie('jwt', refresh_token, {httpOnly: true, maxAge: 24 * 6000})
  res.status(200).json(access_token)
  } catch (error) {
    res.status(400).json(error)
  }
}


async logout(req, res) {
  try {
    const bearer = req.cookies
    if (!bearer) {
      res.status(404).json('Bearer not found')
    }
  const token = bearer.jwt
  const deleted = await db.query(`DELETE FROM refresh_token WHERE token = '${token}'`)
  res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true})
  res.status(200).json(deleted)
  } catch (error) {
    res.status(400).json(error)
  }
}


async getUsers(req, res) {
  try {
    const payload = req.user
    if (!(payload.role === "Admin")) {
      return res.status(403).json('You dont have rights for this request')
    }
    const data = await db.query('SELECT * from usermodel')
    res.status(200).json(data.rows)
  } catch (error) {
    res.status(400).json(error)
  }
}



async getUser(req, res) {
  try {
    const payload = req.user
    if (!(payload.role === "Admin")) {
      return res.status(403).json('You dont have rights for this request')
    }
    const { id } = req.params
const data = await db.query(`SELECT * FROM usermodel WHERE id = ${id}`)
res.status(200).json(data.rows)
  } catch (error) {
    res.status(400).json(error)
  }
}


async updateUser(req, res) {
  try {
    const payload = req.user
    const id = payload.id
    if (!(payload.role === "Admin" || id )) {
      return res.status(403).json('You dont have rights for this request')
    }
    const {key, value} = req.body
    if (!key || !value) {
      return res.sendStatus(404)
    }
    const updated = await db.query(`UPDATE usermodel set ${key} = $1 where id = $2 RETURNING *`, [value, id])
    res.status(200).json(updated.rows[0])
  } catch (error) {
    res.status(400).json(error)
  }
}



async deleteUser(req, res) {
  try {
    const payload = req.user
    if (!(payload.role === "Admin")) {
      return res.status(403).json('You dont have rights for this request')
    }
    const {id} = req.params
    const deleted = await db.query(`DELETE FROM usermodel where id = ${id}`)
    res.status(200).json(deleted)
  } catch (error) {
    res.status(400).json(error)
  }
}

}


module.exports = AuthContoller
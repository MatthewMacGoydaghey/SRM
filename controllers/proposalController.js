const db = require('../db')



class ProposalController {

async addProposal(req, res) {
try {
  const userRole = req.user.role
  if (!(userRole === 'Provider')) {
    return res.status(403).json('You dont have rights for this request')
  }
  
  const providerid = req.user.id
  const {ofp, cost, description} = req.body
  if (!ofp) {
    return res.status(404).json('Data missing')
  }

  const created = await db.query(`INSERT INTO proposalmodel(providerid, objectofproposal, costofobject, description)
   VALUES($1, $2, $3, $4) RETURNING *`, [providerid, ofp, cost, description])
  res.status(200).json(created)
} catch (error) {
  res.status(400).json(error)
}
}



async getProposals(req, res) {
  try {
  const data = await db.query(`SELECT * FROM proposalmodel`)
  res.status(200).json(data.rows)
  } catch (error) {
    res.status(400).json(error)
  }
}



async getProposal(req, res) {
  try {
  const proposalId = req.params.id
  const data = await db.query(`SELECT * FROM proposalmodel WHERE id = ${proposalId}`)
  res.status(200).json(data.rows[0])
  } catch (error) {
    res.status(400).json(error)
  }
}




async updateProposal(req, res) {
  try {
    const userRole = req.user.role
    if (!(userRole === 'Provider')) {
      return res.status(403).json('You dont have rights for this request')
    }
    const proposalId = req.params.id
    const proposalData = await db.query(`SELECT * FROM proposalmodel WHERE id = ${proposalId}`)
    const foundProposal = proposalData.rows[0]
    if (!(foundProposal.providerid === req.user.id)) {
return res.sendStatus(403)
    }


const {key, value} = req.body
if (!key || !value) {
 return res.status(404).json('Data missing')
}
const updated = await db.query(`UPDATE proposalmodel SET ${key} = $1 WHERE id = $2 RETURNING *`, [value, proposalId])
res.status(200).json(updated.rows[0])
  } catch (error) {
    res.status(400).json(error)
  }
}




async deleteProposal(req, res) {
  try {
    const userRole = req.user.role
    if (!(userRole === 'Provider')) {
      return res.status(403).json('You dont have rights for this request')
    }
    const proposalId = req.params.id
    const proposalData = await db.query(`SELECT * FROM proposalmodel WHERE id = ${proposalId}`)
    const foundProposal = proposalData.rows[0]
    if (!(foundProposal.providerid === req.user.id)) {
return res.sendStatus(403)
    }


const deleted = await db.query(`DELETE FROM proposalmodel WHERE id = ${proposalId}`)
res.status(200).json(deleted)
  } catch (error) {
    res.status(400).json(error)
  }
}



}


module.exports = ProposalController
const express = require('express')
const router = express.Router()
const ProposalController = require('../controllers/proposalController')
const Controller = new ProposalController()



router.post('/', Controller.addProposal)

router.get('/', Controller.getProposals)

router.get('/:id', Controller.getProposal)

router.patch('/:id', Controller.updateProposal)

router.delete('/:id', Controller.deleteProposal)



module.exports = router
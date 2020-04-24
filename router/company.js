const express = require('express');
const router = express.Router()
const { requiresignin, companyAuthMiddleware } = require('../controller/auth')
const { company, updateCompany, createAnnounce, removeAnnounce, justForYourCompany, cancelContactUser, sendContactRequest, declinedUser, declineContactRequestFromUser, acceptContactRequestFromUser,blockUser,unblockUser } = require('../controller/company')


router.get('/company', requiresignin, companyAuthMiddleware, company)
router.put('/company/update', requiresignin, companyAuthMiddleware, updateCompany)
router.post('/company/announce', requiresignin, companyAuthMiddleware, createAnnounce)
router.delete('/company/announce/remove', requiresignin, companyAuthMiddleware, removeAnnounce)
router.get('/company/justForYouCompany', requiresignin, companyAuthMiddleware, justForYourCompany)
router.post('/company/contactUser', requiresignin, companyAuthMiddleware, sendContactRequest)
router.post('/company/cancelContactUser', requiresignin, companyAuthMiddleware, cancelContactUser)
router.post('/company/declineContactRequestFromUser', requiresignin, companyAuthMiddleware, declineContactRequestFromUser)
router.post('/company/acceptContactRequestFromUser', requiresignin, companyAuthMiddleware, acceptContactRequestFromUser)
router.post('/company/declinedUser', requiresignin, companyAuthMiddleware, declinedUser)
router.post('/company/block', requiresignin, companyAuthMiddleware, blockUser)
router.post('/company/unblock', requiresignin, companyAuthMiddleware, unblockUser)

module.exports = router;
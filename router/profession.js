const express = require('express');
const router = express.Router()
const { create, list, update, adminRemoveProfession } = require('../controller/profession')
const { requiresignin, adminMiddleware } = require('../controller/auth')

router.post('/profession', requiresignin, adminMiddleware, create)
router.get('/professions', requiresignin, list)
router.delete('/profession/adminRemoveProfession', requiresignin, adminMiddleware, adminRemoveProfession)
//router.delete('/blog/userRemoveProfession/:slug', requiresignin, userRemoveProfession) //create a special profession key to the user so he can write what he want
router.put('/profession', requiresignin, adminMiddleware, update)
//router.get('/profession/search', listSearch);
//router.post('/profession/related', listRelated);

module.exports = router;
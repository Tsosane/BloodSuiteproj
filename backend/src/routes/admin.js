const express = require('express');
const router = express.Router();
const { getUsers, updateUserStatus } = require('../controllers/adminController');
const { authMiddleware } = require('../middleware/auth');
const { rbacMiddleware, ROLES } = require('../middleware/rbac');

router.use(authMiddleware);
router.use(rbacMiddleware([ROLES.ADMIN]));

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);

module.exports = router;

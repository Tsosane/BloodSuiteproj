// src/routes/requests.js
const express = require('express');
const router = express.Router();
const {
  getRequests,
  createRequest,
  updateRequestStatus,
  fulfillRequest,
  cancelRequest,
} = require('../controllers/requestController');
const { authMiddleware } = require('../middleware/auth');
const { rbacMiddleware, ROLES } = require('../middleware/rbac');
const { validateRequest } = require('../middleware/validation');

router.use(authMiddleware);

router.get('/', rbacMiddleware([ROLES.ADMIN, ROLES.HOSPITAL, ROLES.MANAGER]), getRequests);
router.post('/', rbacMiddleware([ROLES.ADMIN, ROLES.HOSPITAL]), validateRequest, createRequest);
router.put('/:id/status', rbacMiddleware([ROLES.ADMIN, ROLES.HOSPITAL]), updateRequestStatus);
router.put('/:id/fulfill', rbacMiddleware([ROLES.ADMIN, ROLES.HOSPITAL]), fulfillRequest);
router.delete('/:id', rbacMiddleware([ROLES.ADMIN, ROLES.HOSPITAL]), cancelRequest);

module.exports = router;
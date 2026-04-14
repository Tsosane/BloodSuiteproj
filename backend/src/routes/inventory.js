// src/routes/inventory.js
const express = require('express');
const router = express.Router();
const {
  getInventory,
  addInventory,
  updateInventory,
  deleteInventory,
  getExpiringUnits,
  getLowStockUnits,
} = require('../controllers/inventoryController');
const { authMiddleware } = require('../middleware/auth');
const { rbacMiddleware, ROLES } = require('../middleware/rbac');
const { validateInventory } = require('../middleware/validation');

router.use(authMiddleware);

router.get('/', rbacMiddleware([ROLES.ADMIN, ROLES.HOSPITAL, ROLES.MANAGER]), getInventory);
router.get('/expiring', rbacMiddleware([ROLES.ADMIN, ROLES.HOSPITAL]), getExpiringUnits);
router.get('/low-stock', rbacMiddleware([ROLES.ADMIN, ROLES.HOSPITAL]), getLowStockUnits);
router.post('/', rbacMiddleware([ROLES.ADMIN, ROLES.HOSPITAL]), validateInventory, addInventory);
router.put('/:id', rbacMiddleware([ROLES.ADMIN, ROLES.HOSPITAL]), updateInventory);
router.delete('/:id', rbacMiddleware([ROLES.ADMIN, ROLES.HOSPITAL]), deleteInventory);

module.exports = router;
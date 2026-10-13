const express = require('express');
const controller = require('../controllers/trackController');

const router = express.Router();

// fixed paths first, otherwise '/:id' would swallow them
router.get('/summary', controller.summary);
router.put('/order', controller.reorder);

router.get('/', controller.list);
router.post('/', controller.create);

router.get('/:id', controller.getById);
router.put('/:id', controller.replace);
router.delete('/:id', controller.remove);

router.put('/:id/star', controller.star);
router.delete('/:id/star', controller.unstar);

module.exports = router;

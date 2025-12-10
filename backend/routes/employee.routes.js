const express = require('express');
const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'Employee endpoint OK' }));

module.exports = router;

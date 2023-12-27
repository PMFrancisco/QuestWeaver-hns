const express = require('express');
const router = express.Router();

const isAuthenticated = require('../middlewares/isAuthenticated');

router.get('/', isAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Quest Weaver' });
});

router.use('/auth', require('./auth'));
router.use('/profile', isAuthenticated, require('./user'));
router.use('/games', isAuthenticated, require('./games'));

module.exports = router;

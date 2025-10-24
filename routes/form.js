const express = require('express');
const ss = require('../modules/smartsheet.js');
const router = express.Router();

router.route('/')
.all((req,res) => {
    res.send('app')
});

module.exports = router;
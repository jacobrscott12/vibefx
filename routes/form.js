const express = require('express');
const ss = require('../modules/smartsheet.js');
const router = express.Router();

router.route('/')
.all((req,res) => {
    res.send('app')
});

router.route('/lem')
.get((req,res) => {
    res.render('forms/lem.ejs')
})

module.exports = router;
const express = require('express');
const ss = require('../modules/smartsheet.js');
const router = express.Router();

router.route('/')
.all((req,res) => {
    res.send('app')
});

router.route('/updateconfig')
.all((req,res) => {
    
})

router.route('/createsheet')
.get((req,res) => {
    
})

module.exports = router;
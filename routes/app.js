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

router.route('/create')
.all((req,res) => {
    const ssKey = req.query.b;
    const workspaceName = req.query.name;

    const createWorkspace = async() => {
        try {
            const workspace = await ss.createWorkspace(ssKey,workspaceName);
            return workspace;
        } catch (error) {
            throw error;
        }    
    }

    createWorkspace()
    .then((result) => {
        res.send(result);
    })
    .catch((error) => {
        res.send(error);
    })



})

module.exports = router;
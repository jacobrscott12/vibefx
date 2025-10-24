const express = require('express');
const ss = require('../modules/smartsheet.js');
const ssConst = require('../res/ssconfig.json');
const router = express.Router();

/*///////////////////////////////////////////////////////////////////////////////
DOCUMENT INTENT
Create multiple functional endpoints to act as testing calls; useful for debugging issues in main codepath. 
DUE TO SECURITY CONCERNS, THIS ENDPOINT WILL BE DISABLED AT RUNTIME. Toggle global.DEBUG = true in index.js

Functions should return as verbose of a result as possible to the user. 

///////////////////////////////////////////////////////////////////////////////*/

router.route('/')
.all((req,res) => {
    res.send('smartsheet')
});

router.route('/getfolder')
.all((req,res) => {
    const ssKey = req.query.b;
    const folderID = req.query.id;
    const folderName = req.query.name;

    (async() => {
        const folder = await ss.getFolder(ssKey,{})
    })
})

router.route('/create')
.all((req,res) => {
    const ssKey = req.query.b;
    const destinationFolder = req.query.dest;
    const folderName = req.query.name;
})

router.route('/copyworkspace')
.all((req,res) => {
    const ssKey = req.query.b;
    const workspaceID = req.query.id;
    const newWorkspaceName = req.query.name;

    async function copyWorkspace() {
        let newWorkspace = await ss.copyWorkspace(ssKey,{workspaceID: workspaceID, newWorkspaceName: newWorkspaceName});
        return newWorkspace;
    }

    copyWorkspace(ssKey,workspaceID,newWorkspaceName)
    .then((result) => {
        res.send(result)
    }).catch((error) => {
        res.send(error);
    })
})

router.route('/createworkspace')
.all((req,res) => {
    const ssKey = req.query.b;
    const newWorkspaceName = req.query.name;

})

router.route('/getsheet')
.all((req,res) => {
    const ssKey = req.query.b;
    const sheetID = req.query.id;

    async function getSheet(ssKey, sheetID) {
        const sheet = await ss.getSheet(ssKey,{sheetID: sheetID});
        return sheet;
    }

    getSheet(ssKey, sheetID)
    .then((result) => {
        res.send(result);
    }).catch((error) => {
        res.send(error);
    })
    

})

module.exports = router;
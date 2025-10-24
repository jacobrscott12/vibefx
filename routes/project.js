const express = require('express');
const ss = require('../modules/smartsheet.js');
const router = express.Router();

router.route('/')
.all((req,res) => {
    res.send('app')
});

router.route('/create')
.all((req,res) => {
    const ssKey = req.query.b;
    const templateFolderID = req.query.src;
    const projectFolderID = req.query.dest;
    const folderName = req.query.name;

    async function checkProjectFolderExists(projectFolderID, folderName) {
        try {            
            const projectFolder = await ss.getFolder(ssKey,{parentFolderID: projectFolderID, folderName: folderName});
            return projectFolder;
        } catch (error) {
            throw error;
        }    
    }

    async function createProjectFolder(templateFolderID, projectFolderID, folderName) {
        try {
            const projectFolder = await ss.copyFolder(ssKey, {folderToCopy: templateFolderID, destinationFolder: projectFolderID, folderName: folderName});
            return projectFolder;
        } catch(error) {
            throw error;
        }
    }

    checkProjectFolderExists(projectFolderID, folderName)
    .then((result) => {
        res.redirect(result.permalink);
    })
    .catch((error) => {
        if(error.message === 'FOLDER_DOES_NOT_EXIST' || error.message === 'PARENT_FOLDER_EMPTY') {
            
            createProjectFolder(templateFolderID, projectFolderID, folderName)
            .then((result) => {
                res.redirect(result.permalink);
            }).catch((error) => {
                res.send(error);
            })
            
                
        } else {
            res.send(error.message);
        }
        
    })



})

module.exports = router;
const ssAPI = 'https://api.smartsheet.com/2.0'

// WORKSPACES ////////////////////////////////////////
const workspaceID = 6649137958545284;

async function getWorkspace(ssKey, queryObject) {
    // If handed folderID in queryObject, get folder directly
    if(global.DEBUG === true) {console.log(queryObject)}
    const workspaceID = queryObject.workspaceID;

    // Get workspace metadata
    const metadata = async(workspaceID) => {
        const response = await fetch(
            `${ssAPI}/workspaces/${workspaceID}/metadata`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${ssKey}`
                }
            }
        );

        const metadata = await response.json();
        if(metadata.errorCode) {throw metadata.message}

        return metadata;
    }
    
    // Get workspace contents
    const contents = async(workspaceID) => {
        const query = new URLSearchParams({
            childrenResourceType: 'folders, reports, sights, sheets'
        }).toString();

        const response = await fetch(
            `${ssAPI}/workspaces/${workspaceID}/children?${query}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${ssKey}`
                }
            }
        );

        const contents = await response.json();
        // if(global.DEBUG === true) {console.log(contents)}
        if(contents.errorCode) {throw contents.message}

        return contents;
    }

    let promiseArray = [];
    promiseArray.push(metadata(workspaceID), contents(workspaceID));
    workspaceArray = await Promise.all(promiseArray);

    const workspaceObject = async(workspaceArray) => {
        
        let metadata = workspaceArray[0];
        let contents = workspaceArray[1].data;

        let workspaceContents = [];
        for (const object of contents) {
            let workspaceObject = {
                id: object.id,
                name: object.name,
                type: object.resourceType,
                permalink: object.permalink
            }

            workspaceContents.push(workspaceObject);
        }

        let workspace = {
            id: metadata.id,
            name: metadata.name,
            permalink: metadata.permalink,
            contents: workspaceContents
        }

        return workspace;
    }

    let workspace = await workspaceObject(workspaceArray);
    return workspace;
}


async function createWorkspace(ssKey, workspaceName) {
    const query = new URLSearchParams({
        include: 'all'
    }).toString();

    try {
        const response = await fetch(
            `${ssAPI}/workspaces?${query}`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${ssKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name: workspaceName})
            }
        );

        const data = await response.json();
        if(data.errorCode) {throw data}

        if(global.DEBUG === true) {console.log(data)}

        return data;
    } catch(error) {
        throw error;
    }
}

async function copyWorkspace(ssKey, queryObject) {
    const workspaceID = queryObject.workspaceID;
    const newWorkspaceName = queryObject.newWorkspaceName;

    const query = new URLSearchParams({
        include: 'all',
    }).toString();

    const response = await fetch(
        `${ssAPI}/workspaces/${workspaceID}/copy?${query}`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${ssKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                newName: newWorkspaceName
            })
        }
    );

    const worksheet = await response.json();
    return worksheet;
}

async function getFolder(ssKey, queryObject) {
    // If handed folderID in queryObject, get folder directly
    if(global.DEBUG === true) {console.log(queryObject)}
    if(queryObject.hasOwnProperty('folderID')) {
        const folderID = queryObject.folderID;

        // Get folder metadata
        const metadata = async(folderID) => {
            const response = await fetch(
                `${ssAPI}/folders/${folderID}/metadata`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${ssKey}`
                    }
                }
            );

            const metadata = await response.json();
            if(metadata.errorCode) {throw metadata.message}

            return metadata;
        }
        
        // Get folder contents
        const contents = async(folderID) => {
            let contentsArray = [];
            async function getContents(folderID, lastKey) {
                if(lastKey) {
                    const query = new URLSearchParams({
                        childrenResourceType: 'folders, reports, sights, sheets',
                        lastKey: lastKey,
                        maxItems: '200'
                    }).toString();
                }

                const query = new URLSearchParams({
                    childrenResourceType: 'folders, reports, sights, sheets',
                    maxItems: '200'
                }).toString();
                

                const response = await fetch(
                    `${ssAPI}/folders/${folderID}/children?${query}`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${ssKey}`
                        }
                    }
                );

                const contents = await response.json();
                if(global.DEBUG === true) {console.log(contents)}
                if(contents.data === undefined || contents.data.length === 0) {throw new Error('PARENT_FOLDER_EMPTY')} 
                if(contents.errorCode) {throw contents.message}

                return contents;
                
            }

            let contents = await getContents(folderID);
            

            return contents;
        }

        let promiseArray = [];
        promiseArray.push(metadata(folderID), contents(folderID));
        folderArray = await Promise.all(promiseArray);

        const folderObject = async(folderArray) => {
            
            let metadata = folderArray[0];
            let contents = folderArray[1];

            let folderContents = [];
            for (const object of contents.data) {
                let folderObject = {
                    id: object.id,
                    name: object.name,
                    type: object.resourceType,
                    permalink: object.permalink
                }

                folderContents.push(folderObject);
            }

            let folderObject = {
                id: metadata.id,
                name: metadata.name,
                permalink: metadata.permalink,
                contents: folderContents
            }

            return folderObject;
        }

        const folder = await folderObject(folderArray);
        return folder;
    }

    // If handed parentID in query object, get parent folder children and search for named folder (recursion potential)
    if(queryObject.hasOwnProperty('parentFolderID')) {
        const parentFolderID = queryObject.parentFolderID;
        const folderName = queryObject.folderName;

        // Get parent folder contents
        const parentFolderContents = async(parentFolderID) => {
            let folder = await getFolder(ssKey, {folderID: parentFolderID});
            return folder.contents;
        }

        const folderContents = await parentFolderContents(parentFolderID);
        // Search for folder by name, return id if exists, return null id if it doesn't
        const searchResult = async(folderContents,folderName) => {
            const result = folderContents.find((object) => {
                return object.name.includes(folderName);
            })

            return result;

        }

        // 

        const resultFolder = await searchResult(folderContents,folderName);
        if(typeof resultFolder === 'undefined') {
            // Folder does not exist 
            throw new Error('FOLDER_DOES_NOT_EXIST');
        }

        const folder = getFolder(ssKey,{folderID: resultFolder.id});
        return folder;
    }

    // If handed path, recursively search for and select folder

}

async function getFolderMetadata(ssKey, queryObject) {
    if(queryObject.hasOwnProperty('folderID')) {
        const folderID = queryObject.folderID;

        // Get folder metadata
        const metadata = async(folderID) => {
            const response = await fetch(
                `${ssAPI}/folders/${folderID}/metadata`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${ssKey}`
                    }
                }
            );

            const metadata = await response.json();
            if(metadata.errorCode) {throw metadata.message}

            return metadata;
        }
        

        let promiseArray = [];
        promiseArray.push(metadata(folderID));
        folderArray = await Promise.all(promiseArray);

        const folderObject = async(folderArray) => {
            
            let metadata = folderArray[0];

            let folderObject = {
                id: metadata.id,
                name: metadata.name,
                permalink: metadata.permalink
            }

            return folderObject;
        }

        let folder = await folderObject(folderArray);
        return folder;
    }
}

async function copyFolder(ssKey, queryObject) {
    const folderToCopy = queryObject.folderToCopy;
    const destinationFolder = queryObject.destinationFolder;
    const folderName = queryObject.folderName;

    const query = new URLSearchParams({
        include: 'attachments,cellLinks,data,discussions,filters,forms,ruleRecipients,rules,shares'
    });

    const response = await fetch(
        `${ssAPI}/folders/${folderToCopy}/copy?${query}`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${ssKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                destinationId: destinationFolder,
                destinationType: 'folder',
                newName: folderName
            })
        }
    );

    const folder = await response.json();
    return folder;
}

function parseSheet(sheetObject) {
    
    function makeColumnMap(columnArray) {
        let map = {};

        for (const col of columnArray) {
            map[col.id] = col.title;
        }

        return map;
    }

    const colMap = makeColumnMap(sheetObject.columns);
    const invertMap = Object.fromEntries(Object.entries(colMap).map(([key, value]) => [value, key])); 

    function parseRows(rowArray) {
        
        function parseCells(cellArray) {
            
            let cells = [];

            for (const cellObject of cellArray) {
                let cell = {};

                cell = {
                    columnId: cellObject.columnId,
                    columnName: colMap[cellObject.columnId],
                    value: cellObject.value
                }

                cells.push(cell);
            }
            return cells;
        }

        let rows = [];
        for (const rowObject of rowArray) {
            let row = {};
            row = {
                id: rowObject.id,
                rowNumber: rowObject.rowNumber,
                cells: parseCells(rowObject.cells)
            }

            rows.push(row);
        }

        return rows;
    }



    let sheet = {
        id: sheetObject.id,
        name: sheetObject.name,
        totalRowCount: sheetObject.totalRowCount,
        colMap: colMap,
        colMapInv: invertMap,
        rows: parseRows(sheetObject.rows)
    }

    return sheet;

}

async function getSheet(ssKey, queryObject) {
    const sheetID = queryObject.sheetID;

    // If passed sheet name
    const sheetName = queryObject.sheetName;
    const parentFolder = queryObject.parentFolder;

    const query = new URLSearchParams({
        include: 'attachments,columnType,discussions'
    }).toString();

    const response = await fetch(
        `${ssAPI}/sheets/${sheetID}?${query}`,
        {
            method: 'GET', 
            headers: {
                Authorization: `Bearer ${ssKey}`
            }
        }
    );

    const sheet  = await response.json();
    const parsedSheet = parseSheet(sheet);
    // return sheet;
    return parsedSheet;

}

exports.createWorkspace = createWorkspace;
exports.copyWorkspace = copyWorkspace;

exports.getFolder = getFolder;
exports.getFolderMetadata = getFolderMetadata;
exports.copyFolder = copyFolder;

exports.getSheet = getSheet;
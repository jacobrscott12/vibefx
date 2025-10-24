// MODULES ////////////////////////////////////////
const express = require('express');
const session = require('express-session');
global.DEBUG = true;

const app = express();
const port = 3001;

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
    if(global.DEBUG === true) {console.log(`DEBUG FLAG ENABLED.`)}
})

app.route('/')
.all((req,res) => {
    res.send('Success');
});

// ROUTES ///////////////////////////////////////////

const appRoute = require('./routes/app.js');
app.use('/app', appRoute);


const projectRoute = require('./routes/project.js');
app.use('/project', projectRoute);

const formRoute = require('./routes/form.js');
app.use('/form', formRoute);


if(global.DEBUG === true) {
    const ssRoute = require('./routes/ss.js');
    app.use('/ss', ssRoute);
}



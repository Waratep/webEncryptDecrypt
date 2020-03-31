const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

app.use(fileUpload());

app.post('/upload', function(req, res) {

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let sampleFile = req.files.sampleFile;
    sampleFile.mv(__dirname + '/tmpfile/' + sampleFile.name, function(err) {
        if (err)
            return res.status(500).send(err);
        const fs = require('fs')
        const steggy = require('steggy-noencrypt')

        const original = fs.readFileSync(__dirname + '/tmpfile/' + sampleFile.name)
        const message = req.body.text

        const concealed = steggy.conceal(original, message)
        fs.writeFileSync(__dirname + '/tmpfile/' + 'output' + sampleFile.name, concealed)

        res.sendfile(__dirname + '/tmpfile/' + 'output' + sampleFile.name);

        // res.end();
    });

});

app.listen(3000, () => console.log(`Example app listening on port ${3000}!`))
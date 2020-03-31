var express = require('express');
var app = express();
var https = require('https');
const fileUpload = require('express-fileupload');

app.use(fileUpload());
app.use(express.static('public'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + "/" + "index.html");
})

app.post('/getRandomKey', function(req, res) {

    var ciphers = req.body.ciphers;
    var key_size = req.body.size;
    var outputformat = req.body.format;

    const crypto = require('crypto');
    let key;
    let iv;
    switch (ciphers) {
        case 'aes':
            key = crypto.randomBytes(parseInt(key_size) / 8);
            iv = crypto.randomBytes(16);
            break;

        case 'des':
            key = crypto.randomBytes(8);
            iv = crypto.randomBytes(8);
            break;
    }

    let ret;
    switch (outputformat) {
        case 'hex':
            ret = { 'key': key.toString('hex'), 'iv': iv.toString('hex') }
            break;
        case 'base64':
            ret = { 'key': key.toString('base64'), 'iv': iv.toString('base64') }
            break;
    }

    res.send(ret);
})

app.post('/NormalEncrypt', function(req, res) {

    var ciphers = req.body.ciphers;
    var mode = req.body.mode;
    var secrete_key = req.body.secrete_key;
    var outputformat = req.body.format;

    let buffer_secrete_key = Buffer.from(secrete_key, 'hex');

    let crypto = require('crypto');
    let algorithm;
    let key_size;

    switch (ciphers) {
        case 'aes':
            key_size = req.body.size;
            algorithm = ciphers + '-' + key_size + '-' + mode + '';
            break;
        case 'des':
            algorithm = ciphers + '-' + mode + '';
            break;
    }

    let cipher;
    let iv;
    let buffer_iv;

    switch (mode) {
        case 'cbc':
            iv = req.body.iv;
            buffer_iv = Buffer.from(iv, 'hex');
            cipher = crypto.createCipheriv(algorithm, buffer_secrete_key, buffer_iv);
            break;

        case 'ecb':
            cipher = crypto.createCipher(algorithm, buffer_secrete_key);
            break;
    }

    let text;
    let image;
    let encrypted;
    let ret;

    if (!req.files || Object.keys(req.files).length === 0) {
        text = req.body.text
        encrypted = cipher.update(text, 'utf-8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        switch (outputformat) {
            case 'hex':
                ret = { 'data': encrypted.toString('hex') }
                break;
            case 'base64':
                ret = { 'data': encrypted.toString('base64') }
                break;
        }
        res.send(ret);

    } else {
        let sampleFile = req.files.sampleFile;
        sampleFile.mv(__dirname + '/tmpfile/' + sampleFile.name, function(err) {
            if (err)
                return res.status(500).send(err);

            const fs = require('fs')
            image = fs.readFileSync(__dirname + '/tmpfile/' + sampleFile.name)

            encrypted = cipher.update(Buffer.from(image), 'utf-8');
            encrypted = Buffer.concat([encrypted, cipher.final()]);

            var promise = new Promise(function(resolve, reject) {
                ret = __dirname + '/tmpfile/' + 'output' + sampleFile.name;
                fs.writeFileSync(ret, encrypted)
                res.sendfile(ret);
                setTimeout(resolve, 500)
            });
            promise.then(function() {
                // fs.unlinkSync(__dirname + '/tmpfile/' + sampleFile.name);
                // fs.unlinkSync(__dirname + '/tmpfile/' + 'output' + sampleFile.name);
            })
        });
    }
})

app.post('/NormalDecrypt', function(req, res) {

    var ciphers = req.body.ciphers;
    var mode = req.body.mode;
    var secrete_key = req.body.secrete_key;
    var outputformat = req.body.format;

    let buffer_secrete_key = Buffer.from(secrete_key, 'hex');

    const crypto = require('crypto');
    let algorithm;
    let key_size;

    switch (ciphers) {
        case 'aes':
            key_size = req.body.size;
            algorithm = ciphers + '-' + key_size + '-' + mode + '';
            break;
        case 'des':
            algorithm = ciphers + '-' + mode + '';
            break;
    }

    let decipher;
    let iv;
    let buffer_iv;

    switch (mode) {
        case 'cbc':
            iv = req.body.iv;
            buffer_iv = Buffer.from(iv, 'hex');
            decipher = crypto.createDecipheriv(algorithm, Buffer.from(buffer_secrete_key), Buffer.from(buffer_iv));
            break;

        case 'ecb':
            decipher = crypto.createDecipher(algorithm, Buffer.from(buffer_secrete_key));
            break;
    }


    let buffer_text;
    let encryptedText;
    let text;
    let image;
    let ret;
    let decrypted;

    if (!req.files || Object.keys(req.files).length === 0) {

        buffer_text = Buffer.from(text, 'hex');
        encryptedText = Buffer.from(buffer_text, 'hex');
        decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        switch (outputformat) {
            case 'hex':
                ret = { 'data': decrypted.toString('hex') }
                break;
            case 'base64':
                ret = { 'data': decrypted.toString('base64') }
                break;
            case 'str':
                ret = { 'data': decrypted.toString() }
                break;
        }
        res.send(ret);
    } else {
        let sampleFile = req.files.sampleFile;
        sampleFile.mv(__dirname + '/tmpfile/' + sampleFile.name, function(err) {
            if (err)
                return res.status(500).send(err);

            const fs = require('fs')
            image = fs.readFileSync(__dirname + '/tmpfile/' + sampleFile.name)

            decrypted = decipher.update(image);
            decrypted = Buffer.concat([decrypted, decipher.final()]);

            var promise = new Promise(function(resolve, reject) {
                ret = __dirname + '/tmpfile/' + 'output' + sampleFile.name;
                fs.writeFileSync(ret, decrypted)
                res.sendfile(ret);
                setTimeout(resolve, 500)
            });
            promise.then(function() {
                // fs.unlinkSync(__dirname + '/tmpfile/' + sampleFile.name);
                // fs.unlinkSync(__dirname + '/tmpfile/' + 'output' + sampleFile.name);
            })
        });
    }
})

app.post('/StegaEncrypt', function(req, res) {

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded or text is emtry.');
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
    });
})

app.post('/StegaDecrypt', function(req, res) {

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded or text is emtry.');
    }

    let sampleFile = req.files.sampleFile;
    sampleFile.mv(__dirname + '/tmpfile/' + sampleFile.name, function(err) {
        if (err)
            return res.status(500).send(err);
        const fs = require('fs')
        const image = fs.readFileSync(__dirname + '/tmpfile/' + sampleFile.name)
        const steggy = require('steggy-noencrypt')
        const revealed = steggy.reveal(image /*, encoding */ )
        console.log(revealed.toString());

        ret = { 'text': revealed.toString() }
        res.status(200).send(ret);
    });
})

app.listen(3000, () => console.log(`Example app listening on port ${3000}!`))
    // https.createServer({
    //     key: fs.readFileSync('./key.pem'),
    //     cert: fs.readFileSync('./cert.pem'),
    //     passphrase: '1234567890'
    // }, app).listen(3000);
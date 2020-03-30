var express = require('express');
var app = express();
var https = require('https');

app.use(express.static('public'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + "/" + "index.html");
})

app.post('/getRandomKey', function(req, res) {

    var ciphers = req.query.ciphers;
    var key_size = req.query.size;
    var outputformat = req.query.format;

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

    var text = req.query.text;
    var ciphers = req.query.ciphers;
    var mode = req.query.mode;
    var secrete_key = req.query.secrete_key;
    var outputformat = req.query.format;

    let buffer_secrete_key = Buffer.from(secrete_key, 'hex');

    let crypto = require('crypto');
    let algorithm;
    let key_size;

    switch (ciphers) {
        case 'aes':
            key_size = req.query.size;
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
            iv = req.query.iv;
            buffer_iv = Buffer.from(iv, 'hex');
            cipher = crypto.createCipheriv(algorithm, buffer_secrete_key, buffer_iv);
            break;

        case 'ecb':
            cipher = crypto.createCipher(algorithm, buffer_secrete_key);
            break;
    }

    let encrypted = cipher.update(text, 'utf-8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    let ret;
    switch (outputformat) {
        case 'hex':
            ret = { 'data': encrypted.toString('hex') }
            break;
        case 'base64':
            ret = { 'data': encrypted.toString('base64') }
            break;
    }

    res.send(ret);
})

app.post('/NormalDecrypt', function(req, res) {

    var text = req.query.text;
    var ciphers = req.query.ciphers;
    var mode = req.query.mode;
    var secrete_key = req.query.secrete_key;
    var outputformat = req.query.format;

    let buffer_secrete_key = Buffer.from(secrete_key, 'hex');
    let buffer_text = Buffer.from(text, 'hex');

    const crypto = require('crypto');
    let algorithm;
    let key_size;

    switch (ciphers) {
        case 'aes':
            key_size = req.query.size;
            algorithm = ciphers + '-' + key_size + '-' + mode + '';
            break;
        case 'des':
            algorithm = ciphers + '-' + mode + '';
            break;
    }

    let encryptedText = Buffer.from(buffer_text, 'hex');
    let decipher;
    let iv;
    let buffer_iv;

    switch (mode) {
        case 'cbc':
            iv = req.query.iv;
            buffer_iv = Buffer.from(iv, 'hex');
            decipher = crypto.createDecipheriv(algorithm, Buffer.from(buffer_secrete_key), Buffer.from(buffer_iv));
            break;

        case 'ecb':
            decipher = crypto.createDecipher(algorithm, Buffer.from(buffer_secrete_key));
            break;
    }

    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    let ret;
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
})

app.listen(3000, () => console.log(`Example app listening on port ${3000}!`))
    // https.createServer({
    //     key: fs.readFileSync('./key.pem'),
    //     cert: fs.readFileSync('./cert.pem'),
    //     passphrase: '1234567890'
    // }, app).listen(3000);
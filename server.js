var express = require('express');
var app = express();
var https = require('https');

app.use(express.static('public'));
app.get('/', function(req, res) {
    res.sendFile(__dirname + "/" + "index.html");
})

app.post('/getRandomKey', function(req, res) {

    var ciphers = req.query.cipher;
    var mode = req.query.mode;
    var key_size = req.query.size;
    var outputformat = req.query.format;

    const crypto = require('crypto');
    const algorithm = ciphers + '-' + key_size + '-' + mode + '';
    const key = crypto.randomBytes(parseInt(key_size) / 8);
    const iv = crypto.randomBytes(16);

    if (outputformat == 'hex') {
        var ret = { 'key': key.toString('hex'), 'iv': iv.toString('hex') }
    }
    if (outputformat == 'base64') {
        var ret = { 'key': key.toString('base64'), 'iv': iv.toString('base64') }
    }

    res.send(ret);
})

app.post('/NormalEncrypt', function(req, res) {

    var text = req.query.text;
    var ciphers = req.query.ciphers;
    var mode = req.query.mode;
    var key_size = req.query.size;
    var secrete_key = req.query.secrete_key;
    var iv = req.query.iv;
    var outputformat = req.query.format;

    let buffer_secrete_key = Buffer.from(secrete_key, 'hex');
    let buffer_iv = Buffer.from(iv, 'hex');

    const crypto = require('crypto');
    const algorithm = ciphers + '-' + key_size + '-' + mode + '';

    let cipher = crypto.createCipheriv(algorithm, buffer_secrete_key, buffer_iv);
    let encrypted = cipher.update(text, 'utf-8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    if (outputformat == 'hex') {
        var ret = { 'data': encrypted.toString('hex') }
    }
    if (outputformat == 'base64') {
        var ret = { 'data': encrypted.toString('base64') }
    }

    res.send(ret);
})

app.post('/NormalDecrypt', function(req, res) {

    var text = req.query.text;
    var ciphers = req.query.ciphers;
    var mode = req.query.mode;
    var key_size = req.query.size;
    var secrete_key = req.query.secrete_key;
    var iv = req.query.iv;
    var outputformat = req.query.format;

    let buffer_secrete_key = Buffer.from(secrete_key, 'hex');
    let buffer_iv = Buffer.from(iv, 'hex');
    let buffer_text = Buffer.from(text, 'hex');

    const crypto = require('crypto');
    const algorithm = ciphers + '-' + key_size + '-' + mode + '';

    let encryptedText = Buffer.from(buffer_text, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(buffer_secrete_key), Buffer.from(buffer_iv));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    if (outputformat == 'hex') {
        var ret = { 'data': decrypted.toString('hex') }
    }
    if (outputformat == 'base64') {
        var ret = { 'data': decrypted.toString('base64') }
    }
    if (outputformat == 'str') {
        var ret = { 'data': decrypted.toString() }
    }

    res.send(ret);
})

app.listen(3000, () => console.log(`Example app listening on port ${3000}!`))
    // https.createServer({
    //     key: fs.readFileSync('./key.pem'),
    //     cert: fs.readFileSync('./cert.pem'),
    //     passphrase: '1234567890'
    // }, app).listen(3000);
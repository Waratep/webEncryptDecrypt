const crypto = require('crypto');

function encodeDesCBC(textToEncode, keyString, ivString) {
    var key = new Buffer(keyString.substring(0, 8), 'utf8');
    var iv = new Buffer(ivString.substring(0, 8), 'utf8');
    var cipher = crypto.createCipheriv('des-cbc', key, iv);
    var c = cipher.update(textToEncode, 'utf8', 'hex');
    c += cipher.final('hex');
    return c;
}


let a = encodeDesCBC('Waratep', 'd2165e107b9ba13d03ac77f7ab8328a11f8db58ae141403b5f5f1c3ddd5824ab', 'e9a49413185f5b4eac2ed5920aea150b')

console.log(a);
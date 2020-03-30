// Nodejs encryption with CTR
const crypto = require('crypto');
const algorithm = 'aes-128-cbc';
const key = crypto.randomBytes(16);
const iv = crypto.randomBytes(16);


// console.log(Buffer.from(key.toString('hex')), iv.toString('hex'));


function encrypt(text) {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), Buffer.from(iv));
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    console.log(encryptedText);
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), Buffer.from(iv));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

var hw = encrypt('datasss')
console.log(hw)
console.log(decrypt(hw))
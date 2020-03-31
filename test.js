const fs = require('fs')
const steggy = require('steggy-noencrypt')

const original = fs.readFileSync('1.png') // buffer
const message = 'keep it secret, keep it safe' // string or buffer

const concealed = steggy.conceal(original, message /*, encoding */ )
fs.writeFileSync('output.png', concealed)


const image = fs.readFileSync('output.png')
const revealed = steggy.reveal(image /*, encoding */ )
console.log(revealed.toString())
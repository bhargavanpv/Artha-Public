const crypto = require('crypto')

const ALGORITHM = 'aes-256-cbc'
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex') // 32 bytes = 64 hex chars
const IV_LENGTH = 16

// Encrypt a string → returns "iv:encryptedData" 
const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
    const encrypted = Buffer.concat([cipher.update(String(text)), cipher.final()])
    return iv.toString('hex') + ':' + encrypted.toString('hex')
}

// Decrypt "iv:encryptedData" → returns original string
const decrypt = (text) => {
    const [ivHex, encryptedHex] = text.split(':')
    const iv = Buffer.from(ivHex, 'hex')
    const encrypted = Buffer.from(encryptedHex, 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
    return decrypted.toString()
}

module.exports = { encrypt, decrypt }
const crypto = require('crypto');
const fs = require("fs");

// const lizaiPublicKey = fs.readFileSync('./public.pem', 'utf-8'); // Load your private key
// const lizaiPrivateKey = fs.readFileSync('./private.pem', 'utf-8'); // Load your private key
const keyToEncrypt = 'super-hyper-mega-secret';

function generateKeys() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048
    });
    const priv = privateKey.export({ format: 'pem', type: 'pkcs1' })
    fs.writeFileSync('./private.pem', priv);
    const pub = publicKey.export({ type: 'pkcs1',format: 'pem' })
    fs.writeFileSync('./public.pem', pub)
}
generateKeys();

let  lizaiPrivateKey = fs.readFileSync('./private.pem').toString()
const lizaiPublicKey= fs.readFileSync('./public.pem').toString();

const encryptRSA = crypto.publicEncrypt(
    {
        key: lizaiPublicKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    },
    Buffer.from(keyToEncrypt)
);

const encryptedKey = encryptRSA.toString('base64');
console.log('Encrypted Key:', encryptedKey);

const decryptRSA = crypto.privateDecrypt(
    {
        key: lizaiPrivateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    },
    Buffer.from(encryptedKey)
);

console.log('Decrypted Key:', decryptRSA.toString('utf-8'));
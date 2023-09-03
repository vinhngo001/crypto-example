const crypto = require('crypto');
const fs = require("fs");

const keyToEncrypt = 'i want to live again, forever';

function generateKeys() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048
    });
    const priv = privateKey.export({ format: 'pem', type: 'pkcs1' })
    fs.writeFileSync('./private.pem', priv);
    const pub = publicKey.export({ type: 'pkcs1', format: 'pem' })
    fs.writeFileSync('./public.pem', pub)
}
// generateKeys();

const lizaiPrivateKey = fs.readFileSync('./private.pem').toString();
const lizaiPublicKey = fs.readFileSync('./public.pem').toString();

// const encryptedKey = crypto.publicEncrypt(
//     {
//         key: lizaiPublicKey,
//         padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
//         oaepHash: "sha256",
//     },
//     // We convert the keyToEncrypt string to a buffer using `Buffer.from`
//     Buffer.from(keyToEncrypt)
// );
// fs.writeFileSync('encrypted.txt', encryptedKey);

// console.log("encypted key: ", encryptedKey.toString("base64"));

const encryptedContents = fs.readFileSync('./encrypted.txt');
const decryptedKey = crypto.privateDecrypt(
    {
        key: lizaiPrivateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
    },
    Buffer.from(encryptedContents)
);

console.log("decrypted key: ", decryptedKey.toString());

const desKey = decryptedKey.toString();

const dataToEncrypt = {
    username: "admin",
    password: "123456"
}

function encreptedData(dataToEncrypt) {
    // Convert the data object to a JSON string
    const dataJsonString = JSON.stringify(dataToEncrypt);

    // Convert the JSON string to a Buffer
    const dataBuffer = Buffer.from(dataJsonString, 'utf-8');
    // random 16 digit initialization vector
    const iv = crypto.randomBytes(16);
    // Create a DES cipher with the key
    const cipher = crypto.createCipheriv('aes-256-cbc', desKey, iv);

    // Encrypt the data
    const encryptedData = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);

    console.log('Encrypted Data:', encryptedData.toString('hex'));
}

function decryptData(data, base64){
    
}
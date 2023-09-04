const crypto = require('crypto');
const fs = require("fs");
const { encreptedDes, decryptDes } = require('./des');

const keyToEncrypt = 'zfmRZuMctQrhQ36lK2z47bm4';

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

const result = encreptedDes(desKey, dataToEncrypt);
// console.log({result});

const encreptedData = result.encryptedData;
const encryptionKey = result.encryptionKey;
const base64 = result.base64
const decryptData = decryptDes(encreptedData, encryptionKey, base64);

console.log(">>>>>",decryptData ,"<<<<<");

const dataToSign = decryptData;

const sign = crypto.createSign('SHA256');
sign.update(dataToSign);

const signedData = sign.sign(lizaiPrivateKey, 'base64');
console.log({signedData});

const verify = crypto.createVerify('SHA256');
verify.update(dataToSign);

const isSignatureValid = verify.verify(lizaiPublicKey, signedData, 'base64');

if (isSignatureValid) {
    // Signature is valid
    console.log({ message: 'Signature is valid' });
} else {
    // Signature is invalid
    console.log({ message: 'Signature is invalid' });
}
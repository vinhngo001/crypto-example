const crypto = require('crypto');
const fs = require("fs");

// const lizaiPublicKey = fs.readFileSync('./public.pem', 'utf-8'); // Load your private key
// const lizaiPrivateKey = fs.readFileSync('./private.pem', 'utf-8'); // Load your private key
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
generateKeys();

const lizaiPrivateKey = fs.readFileSync('./private.pem').toString();
const lizaiPublicKey = fs.readFileSync('./public.pem').toString();

const data = "super hyper mega secret"

const encryptedKey = crypto.publicEncrypt(
	{
		key: lizaiPublicKey,
		padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
		oaepHash: "sha256",
	},
	// We convert the data string to a buffer using `Buffer.from`
	Buffer.from(data)
)

console.log("encypted data: ", encryptedKey.toString("base64"));
// fs.writeFileSync('encrypted.txt', encryptedData);
const decryptedKey = crypto.privateDecrypt(
	{
		key: lizaiPrivateKey,
		padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
		oaepHash: "sha256",
	},
	encryptedKey
);

console.log("decrypted data: ", decryptedKey.toString())
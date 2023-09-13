const CryptoJS = require("crypto-js");
const fs = require("fs");

const lizaiPrivateKey = fs.readFileSync('./private.pem').toString();
const lizaiPublicKey = fs.readFileSync('./public.pem').toString();

// Your encryption key (24 characters)
const encryptionKey = "zfmRZuMctQrhQ36lK2z47bm4";

// Your data to encrypt
const data = {
  username: "admin",
  password: "123456",
};

// Convert the data to a string
const dataString = JSON.stringify(data);

// Encrypt the data using TripleDES
const encryptedData = CryptoJS.TripleDES.encrypt(dataString, encryptionKey);

// The result is a CipherParams object
const ciphertext = encryptedData.toString();

console.log("Encrypted Data:", ciphertext);

// Decrypt the ciphertext using TripleDES
const decryptedBytes = CryptoJS.TripleDES.decrypt(ciphertext, encryptionKey);

// Convert the decrypted bytes to a string
const decryptedDataString = decryptedBytes.toString(CryptoJS.enc.Utf8);

// Parse the decrypted data back into an object
const decryptedData = JSON.parse(decryptedDataString);

console.log("Decrypted Data:", decryptedData);


// Function to sign data with a private key
function sign(data, privateKeyPEM) {
  const privateKeyWordArray = CryptoJS.enc.Utf8.parse(privateKeyPEM);
  const signature = CryptoJS.HmacSHA256(data, privateKeyWordArray);
  return CryptoJS.enc.Base64.stringify(signature);
}

// Function to verify data with a public key
function checkSign(data, signature, publicKeyPEM) {
  const publicKeyWordArray = CryptoJS.enc.Utf8.parse(publicKeyPEM);
  const expectedSignature = CryptoJS.HmacSHA256(data, publicKeyWordArray);
  const expectedSignatureBase64 = CryptoJS.enc.Base64.stringify(expectedSignature);
  console.log({signature, expectedSignatureBase64})
  return signature === expectedSignatureBase64;
}

const dataToSign = "Hello, Signature!";

const signedData = sign(dataToSign, lizaiPrivateKey);
console.log({ signedData });

const isSignatureValid = checkSign(dataToSign, signedData, lizaiPublicKey);

if (isSignatureValid) {
  // Signature is valid
  console.log({ message: 'Signature is valid' });
} else {
  // Signature is invalid
  console.log({ message: 'Signature is invalid' });
}
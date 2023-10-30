const fs = require("fs");
const crypto = require("crypto");

const lizaiPrivateKey = fs.readFileSync('./private-key.pem').toString();
const lizaiPublicKey = fs.readFileSync('./public-key.pem').toString();

function decodeBase64(data){
    const decodedData = Buffer.from(data, 'base64').toString('utf-8');
    return decodedData;
}

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

function encodeBase64(data) {
    // Encode the data to Base64
    const base64Data = Buffer.from(data, 'utf-8').toString('base64');
    return base64Data;
}

// Function to sign data
function signData(dataToSignBase64String, privateKey) {
    try {
        // Create a Sign object
        const sign = crypto.createSign('RSA-SHA256');
        sign.update(dataToSignBase64String);

        // Sign the data using the private key
        const signature = sign.sign(privateKey, 'base64');
        return signature;
    } catch (error) {
        console.error(error);
        return null;
    }
}

// Function to verify a signature
function verifySignature(dataToVerifyBase64String, signatureBase64String, publicKey) {
    try {
        // Create a Verify object
        const verify = crypto.createVerify('RSA-SHA256'); // SHA256
        verify.update(dataToVerifyBase64String);

        // Verify the signature using the public key
        const verified = verify.verify(publicKey, signatureBase64String, 'base64');
        return verified;
    } catch (error) {
        console.error(error);
        return false;
    }
}

// Example usage
// const dataToDecode = "YmxhYmxh";
const dataToDecode =  "eyJzdGF0dXMiOjIwMCwic3VjY2VzcyI6dHJ1ZSwibWVzc2FnZSI6IkRPTkUiLCJkYXRhIjp7ImF1dGgtc3RhdHVzIjp0cnVlfSwiZXJyb3IiOm51bGx9"
// const dataToSign = { "fromCreatedDate": 1672518456, "toCreatedDate": 1694057256 };
const dataToSign = decodeBase64(dataToDecode);
console.log({dataToSign});

const encodedData = encodeBase64(JSON.stringify(dataToSign));
console.log({ encodedData });

const signature = signData(JSON.stringify(dataToSign), lizaiPrivateKey);
console.log({ signature });

if (signature) {
    const isVerified = verifySignature(JSON.stringify(dataToSign), signature, lizaiPublicKey);
    if (isVerified) {
        console.log('Signature is verified.');
    } else {
        console.log('Signature is not verified.');
    }
} else {
    console.log('Failed to sign the data.');
}
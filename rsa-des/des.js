const crypto = require("crypto");
const fs = require("fs");

function encreptedDes(key, dataToEncrypt) {
    // Convert the data object to a JSON string
    const dataJsonString = JSON.stringify(dataToEncrypt);

    // Convert the JSON string to a Buffer
    const encryptionKey = Buffer.from(key, 'utf-8');

    // Ensure the key is 24 bytes (192 bits)
    if (encryptionKey.length !== 24) {
        console.error('Key length must be 24 bytes for des-ede3-cbc encryption.');
        return;
    } 
    // else {
    //     console.log('Key:', encryptionKey.toString('hex'));
    // }

    // set encryption alorithm
    const algorithm = "des-ede3-cbc";

    const iv = crypto.randomBytes(8);

    // Create a DES cipher with the key
    const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);

    // Encrypt the data
    let encryptedData = cipher.update(dataJsonString, "utf8", "base64");
    encryptedData += cipher.final("base64");

    // fs.writeFileSync('./encrypted-data.txt', encryptedData);
    // convert the initialization vector to base 64 string
    const base64data = Buffer.from(iv, 'binary').toString('base64');

    return {
        encryptionKey: encryptionKey,
        encryptedData,
        base64: base64data
    }
}

function decryptDes(encryptedData, key, base64) {
    // set encryption alorithm
    const algorithm = "des-ede3-cbc";

    // random 16 digit initialization vector
    // const iv = crypto.randomBytes(8);
    const originalData = Buffer.from(base64, 'base64');

    const decipher = crypto.createDecipheriv(algorithm, key, originalData); // Specify the appropriate IV
    let data = decipher.update(encryptedData, 'base64', 'utf8');
    data += decipher.final('utf8');

    return data;
}

function checkSign() {

}

module.exports = {
    encreptedDes,
    decryptDes
}
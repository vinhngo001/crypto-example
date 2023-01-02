const crypto = require("crypto");

function encreptedData(data) {
    // set encryption alorithm
    const algorithm = "aes-256-cbc";

    // private key
    const key = "tech-super-hyper-mega-secret-key";

    // random 16 digit initialization vector
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encryptedData = cipher.update(data, "utf-8", "hex");
    encryptedData += cipher.final("hex");

    // convert the initialization vector to base 64 string
    const base64data = Buffer.from(iv, 'binary').toString('base64');

    return {
        base64: base64data,
        encryptedData: encryptedData
    }
}

console.log(encreptedData("Hello"));

function decryptedData(data, base64) {
    // set encryption alorithm
    const algorithm = "aes-256-cbc";

    // private key
    const key = "tech-super-hyper-mega-secret-key";

    // Convert initialize vector from base64 to buffer
    const originalData = Buffer.from(base64, 'base64');

    // decrypt the string using encryption alorithm and private key
    const decipher = crypto.createDecipheriv(algorithm, key, originalData);
    let decryptedData = decipher.update(data, "hex", "utf-8");
    decryptedData += decipher.final("utf8");

    return decryptedData;
}

// console.log(decryptedData("fa6cb95e740320e40fa42a4d09ec4658", "tC1QSTNQlc63xjRxRmMotw=="))
const crypto = require("crypto");

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
});

console.log(
	publicKey.export({
		type: "pkcs1",
		format: "pem",
	}),

	privateKey.export({
		type: "pkcs1",
		format: "pem",
	})
)

// This is the data we want to encrypt
const data = "super hyper mega secret"

const encryptedData = crypto.publicEncrypt(
	{
		key: publicKey,
		padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
		oaepHash: "sha256",
	},
	// We convert the data string to a buffer using `Buffer.from`
	Buffer.from(data)
)

// The encrypted data is in the form of bytes, so we print it in base64 format
// so that it's displayed in a more readable form
console.log("encypted data: ", encryptedData.toString("base64"));

const decryptedData = crypto.privateDecrypt(
	{
		key: privateKey,
		// In order to decrypt the data, we need to specify the
		// same hashing function and padding scheme that we used to
		// encrypt the data in the previous step
		padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
		oaepHash: "sha256",
	},
	encryptedData
);

console.log("decrypted data: ", decryptedData.toString())

// const verifiableData = "this need to be verified"

// const signature = crypto.sign("sha256", Buffer.from(verifiableData), {
// 	key: privateKey,
// 	padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
// })

// console.log(signature.toString("base64"))

// To verify the data, we provide the same hashing algorithm and
// padding scheme we provided to generate the signature, along
// with the signature itself, the data that we want to
// verify against the signature, and the public key
// const isVerified = crypto.verify(
// 	"sha256",
// 	Buffer.from(verifiableData),
// 	{
// 		key: publicKey,
// 		padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
// 	},
// 	signature
// );

// isVerified should be `true` if the signature is valid
// console.log("signature verified: ", isVerified)

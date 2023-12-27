require("dotenv").config();
const AWS = require("aws-sdk");
const { getAWSConfig } = require("../env");
const fs = require("fs");
const path = require("path");

// Config AWS SDK
// AWS.config.update({
//     region: process.env.REGION,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     }
// });

// const s3 = new AWS.S3();

// Function to initialize AWS S3
const initializeAWS = () => {
    const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = getAWSConfig();

    // Set AWS credentials and region
    AWS.config.update({
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
        region: AWS_REGION
    });

    // Create S3 instance
    return new AWS.S3();
}

async function getContentFromS3Link(objectKey) {
    const s3 = initializeAWS();
    const awsConfig = getAWSConfig();
    const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET, AWS_REGION } = awsConfig
    try {
        // const params = {
        //     region: AWS_REGION,
        //     credentials: {
        //         accessKeyId: AWS_ACCESS_KEY_ID,
        //         secretAccessKey: AWS_SECRET_ACCESS_KEY,
        //     }
        // }

        // Specify your S3 bucket and file information
        const bucketName = S3_BUCKET;

        const s3Params = {
            Bucket: bucketName,
            Key: objectKey,
        }

        const data = await s3.getObject(s3Params).promise();

        // Assuming the content is stored in UTF-8 encoding
        const content = data.Body.toString('utf-8');
        console.log({content})
        return content;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function listS3Objects() {
    const { S3_BUCKET } = getAWSConfig();
    const s3 = initializeAWS();

    // List objects in the bucket
    const listObjectsParams = { Bucket: S3_BUCKET };
    const objects = await s3.listObjects(listObjectsParams).promise();

    // Extract and return the object keys (links)
    return objects.Contents.map(obj => obj.Key);
}

async function getObjectContent(objectKey) {
    const { S3_BUCKET } = getAWSConfig();
    const s3 = initializeAWS();

    try {
        const getObjectParams = { Bucket: S3_BUCKET, Key: objectKey };
        const object = await s3.getObject(getObjectParams).promise();

        // Return the content as a string
        return object.Body.toString('utf-8');
    } catch (error) {
        console.log(error);
        throw error;
    }
}

async function downloadAllFiles() {
    try {
        // const { S3_BUCKET } = getAWSConfig();
        // const s3 = initializeAWS();
        const s3 = new AWS.S3();
        let continuationToken = null;
        let allObjects = [];

        const params = { Bucket: "lizai-upload", ContinuationToken: continuationToken }
        // console.log(objects.Contents[0]);
        // console.log(objects.Contents[1]);
        const localDirectory = "./content";
        // do {
        //     const objects = await s3.listObjectsV2(params).promise();

        //     allObjects = allObjects.concat(objects.Contents);
        //     continuationToken = objects.NextContinuationToken;
        // } while (continuationToken);

        // console.log(">>>>>>>", allObjects.length);
        const objects = await s3.listObjectsV2(params).promise();
        for (const obj of objects.Contents) {
            const objectKey = obj.Key;
            // console.log({ objectKey });
            const strArr = objectKey.split("/")[1].split("-");
            const isContentHtml = strArr[0] === "contentHtml" ? true : false;
            // console.log(">>>>>>", strArr[0])
            if (!isContentHtml) {
                const localFilePath = path.join(localDirectory, objectKey);
                console.log({ localFilePath });
                // fs.mkdirSync(path.dirname(localFilePath), {recursive: true});
                const content = await getObjectContent(objectKey);
                // const data = await s3.getObject({ Bucket: S3_BUCKET, Key: key });
                console.log({ content });
                // fs.writeFileSync(localFilePath, JSON.stringify(content, null, 2));
                console.log(`Downloaded: ${objectKey}`);
            }
        }
        return;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

const main = async () => {
    try {
        const objectKeys = await listS3Objects();
        for (const objectKey of objectKeys) {
            // const strArr = objectKey.split('/');
            // if(strArr[1].split('-')[0] === "contentHtml"){
            //     console.log(`Link: ${objectKey}`);
            // }
            const content = await getObjectContent(objectKey);
            // console.log(`Link: ${objectKey}\nContent:\n${content}\n`);
            fs.writeFileSync(`./content/${objectKey}`, JSON.stringify(content, null, 2));
        }
    } catch (error) {
        console.error(error.message || error);
    }
}

// main();
// downloadAllFiles();
module.exports = {
    getContentFromS3Link,
    downloadAllFiles
}
getContentFromS3Link("contentFiles/contentHtml-fda-1702365545256.txt");
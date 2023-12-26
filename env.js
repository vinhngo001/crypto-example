require("dotenv").config()
function getEnv(key) {
    return process.env[key];
}

exports.getAWSConfig = () => {
    const AWS_ACCESS_KEY_ID = getEnv('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = getEnv('AWS_SECRET_ACCESS_KEY');
    const AWS_REGION = getEnv('AWS_REGION');
    const S3_BUCKET = getEnv("S3_BUCKET");

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION) {
        throw new Error(`Some of aws env var are missing, please check \n
        AccessKeyId: ${AWS_ACCESS_KEY_ID}\n
        SecretAccessKey: ${AWS_SECRET_ACCESS_KEY}\n
        Region: ${AWS_REGION}\n
        Bucket: ${S3_BUCKET}\n`);
    }

    return {
        AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY,
        AWS_REGION,
        S3_BUCKET
    }
}


exports.getRabbitMQUrl = () => {
    const RABBITMQ_URL = getEnv('RABBITMQ_URL');
    if (!RABBITMQ_URL) {
        throw new Error(`RabbitMQ url is undefined.`);
    }
    return RABBITMQ_URL;
}
// module.exports = getEnv;
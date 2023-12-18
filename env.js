const dotenv = require("dotenv")
dotenv.config();

function getEnv(key){
    return process.env[key];
}

export function getAWSConfig(){
    const AWS_ACCESS_KEY_ID = getEnv('AWS_ACCESS_KEY_ID');
    const AWS_SECRET_ACCESS_KEY = getEnv('AWS_SECRET_ACCESS_KEY');
    const AWS_REGION = getEnv('')
}

module.exports = getEnv;
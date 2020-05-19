import * as AWS from 'aws-sdk';

export const config = () => {
    require('dotenv').config();
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
};
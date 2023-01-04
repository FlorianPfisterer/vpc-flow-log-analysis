import * as AWS from 'aws-sdk';
import { config } from './config';
import { removeUndef, createFolderIfNotExists } from './utils';
import { writeFile, unlink } from 'fs';
const mergeFiles = require('merge-files');
const gunzip = require('gunzip-file');

const downloadTask = 'download log data from AWS s3';
const unzipTask = 'unzip log data';
const mergeTask = 'merge log files';
export const downloadAndPrepareLogs = async (): Promise<string> => {
    config();
    
    console.time(downloadTask);
    const zippedFilePaths = await downloadLogs();
    console.timeEnd(downloadTask);
    
    console.time(unzipTask);
    const fileNames = await unzipLogs(zippedFilePaths);
    console.timeEnd(unzipTask);

    console.time(mergeTask);
    const mergedFileName = `logs/log_${new Date().toISOString()}.txt`;
    await createFolderIfNotExists(mergedFileName);
    await mergeFiles(fileNames, mergedFileName);
    console.timeEnd(mergeTask);

    return mergedFileName;
}

async function getAllKeys(s3, params, allKeys = []) {
    const response = await s3.listObjectsV2(params).promise();
    response.Contents.forEach(obj => allKeys.push(obj));

    if (response.NextContinuationToken) {
        params.ContinuationToken = response.NextContinuationToken;
        await getAllKeys(s3, params, allKeys);
    }

    return allKeys;
}

const downloadLogs = async (): Promise<string[]> => {
    const bucket = process.env.AWS_S3_BUCKET_NAME;

    const s3 = new AWS.S3()

    const allObjects = await getAllKeys(s3,{ Bucket: bucket });
    const selectedObjects = allObjects.slice(-2500);


    const filePaths: string[] = await Promise.all((selectedObjects || []).map(async object => {
        const data = await s3.getObject({ Key: object.Key, Bucket: bucket }).promise();

        const fullPath = `data/${object.Key}`;
        await createFolderIfNotExists(fullPath);
        return new Promise((resolve, reject) => {
            writeFile(fullPath, data.Body as Buffer, (err) => {
                if (err) reject(err);
                else resolve(fullPath);
            });
        });
    })) as string[];

    return filePaths;
}

const unzipLogs = async (filePaths: string[]): Promise<string[]> => {
    return removeUndef(await Promise.all(filePaths.map(filePath => {
        return new Promise<string | undefined>((resolve, reject) => {
            if (filePath.endsWith('.gz')) {
                const newFileName = filePath.substr(0, filePath.length - '.gz'.length);
                gunzip(filePath, newFileName, () => {
                    // now remove the file
                    unlink(filePath, (err) => {
                        if (err) reject(err);
                        else resolve(newFileName);
                    })
                });
            } else {
                resolve(undefined);
            } 
        });
    })));
}

import { Request, parseLine } from './request';
import { createReadStream } from 'fs';
const readline = require('readline');

const readTask = 'read and parse requests';
export const readLogs = async (fileName: string): Promise<Request[]> => {
    console.time(readTask);
    const requests: Request[] = [];

    const fileStream = createReadStream(fileName);
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    for await (const line of rl) {
        const request = parseLine(line);
        if (request) requests.push(request);
    }

    console.timeEnd(readTask);
    return requests;
}
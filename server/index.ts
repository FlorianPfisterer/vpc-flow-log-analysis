import { downloadAndPrepareLogs } from "./s3-download";
import { readLogs } from './reader';
import { generateGraph } from './generate-graph';

(async () => {
    const logFileName = await downloadAndPrepareLogs();
    const requests = await readLogs(logFileName);
    console.log(`Found ${requests.length} requests.`);

    const graphFileName = await generateGraph(requests);
    console.log(`Exported log graph to ${graphFileName}`);
})();
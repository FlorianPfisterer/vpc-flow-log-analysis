import { downloadAndPrepareLogs } from "./s3-download";

(async () => {
    const logFileName = await downloadAndPrepareLogs();
    
})();
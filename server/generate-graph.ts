import { Request } from './request';
import { writeFile } from 'fs';
import { createFolderIfNotExists } from './utils';

type Node = string;
type Edge = { src: Node, dst: Node }

const generateGraphTask = 'generate nodes and edges';
const writeGraphTask = 'export graph data to file';
export const generateGraph = async (requests: Request[]): Promise<string> => {
    console.time(generateGraphTask);
    const nodes = getNodes(requests);
    const edges = getEdges(requests);
    console.timeEnd(generateGraphTask);

    console.time(writeGraphTask);
    const fileName = `graphs/log-graph_${new Date().toISOString()}.json`;
    createFolderIfNotExists(fileName);
    await writeJson({ nodes, edges }, fileName);
    console.timeEnd(writeGraphTask);

    return fileName;
}

const writeJson = (obj: object, fileName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        writeFile(fileName, JSON.stringify(obj, null, 2), (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

const getNodes = (requests: Request[]): Node[] => {
    const uniqueNodes = new Set<Node>();
    requests.forEach(req => {
        uniqueNodes.add(getNode(req.srcAddress, req.srcPort));
        uniqueNodes.add(getNode(req.destAddress, req.destPort));
    });
    return Array.from(uniqueNodes);
}

const getEdges = (requests: Request[]): Edge[] => {
    return requests.map(req => {
        return {
            src: getNode(req.srcAddress, req.srcPort),
            dst: getNode(req.destAddress, req.destPort)
        };
    });
}

const getNode = (address: string, port: number): Node => {
    return `${address}:${port}`;
}
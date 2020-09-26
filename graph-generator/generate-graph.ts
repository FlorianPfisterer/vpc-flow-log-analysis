import { Request } from './request';
import { writeFile, unlinkSync } from 'fs';
import { createFolderIfNotExists, removeUndef } from './utils';
import { symlinkSync } from 'fs';
import { knownAddresses } from './known-ips';
import * as path from 'path';
const randomip = require('random-ip');

type Node = string;
type Edge = { src: Node, dst: Node, count: number };

const generateGraphTask = 'generate nodes and edges';
const writeGraphTask = 'export graph data to file';
export const generateGraph = async (requests: Request[]): Promise<string> => {
    console.time(generateGraphTask);
    const edges = getEdges(requests, 10, 50);
    const nodes = getNodes(edges);
    console.timeEnd(generateGraphTask);

    console.time(writeGraphTask);
    const fileName = `graphs/log-graph_${new Date().toISOString()}.json`;
    createFolderIfNotExists(fileName);
    await writeJson({ nodes, edges }, fileName);
    
    const symLinkPath = path.resolve('.', 'client', 'graph.json');
    try {
        unlinkSync(symLinkPath);
    } catch (err) {}
    symlinkSync(path.resolve('.', fileName), symLinkPath);
    console.timeEnd(writeGraphTask);

    return symLinkPath;
}

const writeJson = (obj: object, fileName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        writeFile(fileName, JSON.stringify(obj, null, 2), (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

const getNodes = (edges: Edge[]): Node[] => {
    const uniqueNodes = new Set<Node>();
    edges.forEach(edge => {
        uniqueNodes.add(edge.src);
        uniqueNodes.add(edge.dst);
    });
    return Array.from(uniqueNodes);
}

const separator = '<%>';
const getEdges = (requests: Request[], minOccurrencesThreshold: number = 10, topK: number = -1): Edge[] => {
    const countByEdge: { [edge: string]: number } = {};
    requests.forEach(req => {
        const src = getNode(req.srcAddress, req.srcPort);
        const dst = getNode(req.destAddress, req.destPort);
        const fst = src > dst ? src : dst;
        const snd = fst === src ? dst : src;

        const edge = `${fst}${separator}${snd}`;
        if (edge in countByEdge)
            countByEdge[edge] += 1;
        else
            countByEdge[edge] = 1;
    });

    const edges = removeUndef(Object.keys(countByEdge).map(edge => {
        const count = countByEdge[edge];
        if (count < minOccurrencesThreshold)
            return undefined;

        const [src, dst] = edge.split(separator);
        return {
            src,
            dst,
            count
        };
    }));

    if (topK > 0) {
        return edges.sort((a, b) => b.count - a.count).slice(0, topK);
    }
    return edges;
}

const randomIPs = {};
const getNode = (address: string, port: number): Node => {
    if (address in knownAddresses) {
        return knownAddresses[address];
    } else if (address in randomIPs) {
        return randomIPs[address];
    }
    
    const randomizedIP = randomip('0.0.0.0', 0);
    randomIPs[address] = randomizedIP;
    return randomizedIP;
}
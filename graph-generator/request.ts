export type Request = {
    srcAddress: string;
    srcPort: number;
    destAddress: string;
    destPort: number;
};

export const parseLine = (line: string): Request | undefined => {
    const fields = line.split(' ');
    if (fields[0] !== '2') {
        return undefined;
    }

    const [
        version,
        accountId,
        interfaceId,
        srcaddr,
        dstaddr,
        srcport,
        dstport,
        protocol,
        packets,
        bytes,
        start,
        end,
        action,
        logStatus
    ] = fields;

    return {
        srcAddress: srcaddr,
        srcPort: parseInt(srcport),
        destAddress: dstaddr,
        destPort: parseInt(dstport)
    };
}
import { mkdir } from 'fs';

export function removeUndef<S>(array: (S | undefined)[]): S[] {
    return array.reduce((prev: S[], current: S | undefined) => {
        if (current) return prev.concat(current);
        else return prev;
    }, []);
}

export const createFolderIfNotExists = async (path: string): Promise<void> => {
    const folders = path.split('/');
    folders.pop();  // last element is file path
    const folderPath = folders.join('/');

    return new Promise((resolve, reject) => {
        mkdir(folderPath, { recursive: true }, (err) => {
            if (err) reject(err);
            else resolve();
        })
    });
}
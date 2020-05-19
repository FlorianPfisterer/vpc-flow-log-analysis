export function removeUndef<S>(array: (S | undefined)[]): S[] {
    return array.reduce((prev: S[], current: S | undefined) => {
        if (current) return prev.concat(current);
        else return prev;
    }, []);
}